import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.CITATION_AUDIT_TIMEOUT_MS ?? 10000);

function failWithMessage(message) {
  console.error(`\nCitation audit failed: ${message}\n`);
  process.exit(1);
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeHost(hostname) {
  return hostname.toLowerCase().replace(/^www\./, '');
}

function isAllowedRedirect(originalUrl, finalUrl) {
  const originalHost = normalizeHost(originalUrl.hostname);
  const finalHost = normalizeHost(finalUrl.hostname);
  if (originalHost === finalHost) {
    return true;
  }
  return finalHost.endsWith(`.${originalHost}`) || originalHost.endsWith(`.${finalHost}`);
}

async function checkCitationUrl(url) {
  const originalUrl = new URL(url);
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    return {
      ok: false,
      reason: `received HTTP ${response.status}`,
    };
  }

  const finalUrl = new URL(response.url);
  if (!isAllowedRedirect(originalUrl, finalUrl)) {
    return {
      ok: false,
      reason: `redirected to different host (${finalUrl.hostname})`,
    };
  }

  return { ok: true };
}

function groupCitationsByPlant(citationRows) {
  const map = new Map();

  for (const row of citationRows) {
    const plantId = typeof row.plant_id === 'string' ? row.plant_id.trim() : '';
    const sourceName = typeof row.source_name === 'string' ? row.source_name.trim() : '';
    const sourceUrl = typeof row.source_url === 'string' ? row.source_url.trim() : '';

    if (!plantId) {
      continue;
    }

    const existing = map.get(plantId) ?? [];
    existing.push({ sourceName, sourceUrl });
    map.set(plantId, existing);
  }

  return map;
}

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  failWithMessage('missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const [{ data: plantRows, error: plantError }, { data: citationRows, error: citationError }] = await Promise.all([
  supabase.from('plants').select('id, common_name'),
  supabase.from('citations').select('plant_id, source_name, source_url'),
]);

if (plantError || citationError) {
  failWithMessage((plantError ?? citationError)?.message ?? 'unable to query release dataset');
}

const plants = (plantRows ?? []).map((row) => ({
  id: typeof row.id === 'string' ? row.id.trim() : '',
  name:
    typeof row.common_name === 'string' && row.common_name.trim().length > 0 ? row.common_name.trim() : 'Unknown Plant',
}));

const citationsByPlant = groupCitationsByPlant(citationRows ?? []);
const failures = [];
const uniqueCitationUrls = new Set();

for (const plant of plants) {
  if (!plant.id) {
    continue;
  }

  const citations = citationsByPlant.get(plant.id) ?? [];
  if (citations.length === 0) {
    failures.push(`[${plant.id}] ${plant.name}: missing required citation evidence`);
    continue;
  }

  for (const citation of citations) {
    if (!citation.sourceName || !citation.sourceUrl) {
      failures.push(`[${plant.id}] ${plant.name}: citation is missing source name or URL`);
      continue;
    }

    if (!isHttpUrl(citation.sourceUrl)) {
      failures.push(`[${plant.id}] ${plant.name}: citation URL is invalid (${citation.sourceUrl})`);
      continue;
    }

    uniqueCitationUrls.add(citation.sourceUrl);
  }
}

const urlHealthByCitation = new Map();
await Promise.all(
  Array.from(uniqueCitationUrls).map(async (url) => {
    try {
      const result = await checkCitationUrl(url);
      urlHealthByCitation.set(url, result);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'unknown network error';
      urlHealthByCitation.set(url, { ok: false, reason: detail });
    }
  })
);

for (const plant of plants) {
  if (!plant.id) {
    continue;
  }

  const citations = citationsByPlant.get(plant.id) ?? [];
  for (const citation of citations) {
    if (!isHttpUrl(citation.sourceUrl)) {
      continue;
    }

    const urlHealth = urlHealthByCitation.get(citation.sourceUrl);
    if (!urlHealth?.ok) {
      failures.push(
        `[${plant.id}] ${plant.name}: "${citation.sourceName}" URL check failed (${citation.sourceUrl}) - ${urlHealth?.reason ?? 'unknown error'}`
      );
    }
  }
}

if (failures.length > 0) {
  console.error('\nCitation audit failed with the following issues:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(`\nTotal issues: ${failures.length}\n`);
  process.exit(1);
}

console.log(
  `\nCitation audit passed for ${plants.length} plants and ${uniqueCitationUrls.size} unique citation URLs.\n`
);
