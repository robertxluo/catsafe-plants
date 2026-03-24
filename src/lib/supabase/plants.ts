import type { FlowerColor, Plant, SafetyStatus } from '@/src/lib/plants';
import { createClient } from '@/src/lib/supabase/client';

export const SUPABASE_CONFIG_ERROR =
  'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.';

const VALID_SAFETY_STATUSES: ReadonlySet<SafetyStatus> = new Set([
  'non_toxic',
  'mildly_toxic',
  'highly_toxic',
  'unknown',
]);

const VALID_FLOWER_COLORS: ReadonlySet<FlowerColor> = new Set([
  'white',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
  'blue',
  'green',
]);

export type GenericRow = Record<string, unknown>;

function readOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isImageUrl(value: string): boolean {
  if (value.startsWith('/')) {
    return true;
  }
  return isHttpUrl(value);
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => readOptionalString(item)).filter((item): item is string => item !== null);
}

function readImageArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => readOptionalString(item)).filter((item): item is string => item !== null);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('[')) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((item) => readOptionalString(item)).filter((item): item is string => item !== null);
  } catch {
    return [];
  }
}

function normalizeSafetyStatus(value: unknown): SafetyStatus {
  if (typeof value === 'string' && VALID_SAFETY_STATUSES.has(value as SafetyStatus)) {
    return value as SafetyStatus;
  }
  return 'unknown';
}

function normalizeFlowerColors(value: unknown): FlowerColor[] {
  return readStringArray(value).filter((color): color is FlowerColor => VALID_FLOWER_COLORS.has(color as FlowerColor));
}

export function ensurePublicSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }
}

export function mapCitationsByPlant(rows: GenericRow[]) {
  const map = new Map<string, Plant['citations']>();

  for (const row of rows) {
    const plantId = readOptionalString(row.plant_id);
    const sourceName = readOptionalString(row.source_name);
    const sourceUrl = readOptionalString(row.source_url);

    if (!plantId || !sourceName || !sourceUrl || !isHttpUrl(sourceUrl)) {
      continue;
    }

    const existing = map.get(plantId) ?? [];
    existing.push({ source_name: sourceName, source_url: sourceUrl });
    map.set(plantId, existing);
  }

  return map;
}

export function mapAlternativesByPlant(rows: GenericRow[]) {
  const map = new Map<string, string[]>();

  for (const row of rows) {
    const toxicPlantId = readOptionalString(row.toxic_plant_id);
    const safePlantId = readOptionalString(row.safe_plant_id);

    if (!toxicPlantId || !safePlantId) {
      continue;
    }

    const existing = map.get(toxicPlantId) ?? [];
    if (!existing.includes(safePlantId)) {
      existing.push(safePlantId);
      map.set(toxicPlantId, existing);
    }
  }

  return map;
}

export function mapPlantRow(
  row: GenericRow,
  citationsByPlant: Map<string, Plant['citations']>,
  alternativesByPlant: Map<string, string[]>
): Plant | null {
  const id = readOptionalString(row.id);
  if (!id) {
    return null;
  }

  const names = readStringArray(row.names);
  const commonName = readOptionalString(row.common_name) ?? names[0] ?? 'Unknown Plant';
  const scientificName = readOptionalString(row.scientific_name) ?? names[1] ?? 'Species unidentified';

  const explicitAkaNames = readStringArray(row.aka_names);
  const akaFromNames = names.slice(2);
  const rawAkaNames = explicitAkaNames.length > 0 ? explicitAkaNames : akaFromNames;
  const akaNames = Array.from(new Set(rawAkaNames)).filter((aka) => aka !== commonName && aka !== scientificName);
  const primaryImageCandidate = readOptionalString(row.primary_image_url);
  const primaryImageUrl = primaryImageCandidate && isImageUrl(primaryImageCandidate) ? primaryImageCandidate : null;
  const normalizedPhotoUrls = readImageArray(row.photo_urls).filter(isImageUrl);
  const photoUrls = Array.from(new Set(normalizedPhotoUrls));
  const effectivePrimaryImageUrl = primaryImageUrl ?? photoUrls[0] ?? null;
  const effectivePhotoUrls = photoUrls.length > 0 ? photoUrls : effectivePrimaryImageUrl ? [effectivePrimaryImageUrl] : [];
  const citations = citationsByPlant.get(id) ?? [];
  const normalizedSafetyStatus = normalizeSafetyStatus(row.safety_status);
  const safetyStatus = citations.length > 0 ? normalizedSafetyStatus : 'unknown';

  return {
    id,
    common_name: commonName,
    scientific_name: scientificName,
    aka_names: akaNames,
    flower_colors: normalizeFlowerColors(row.flower_colors),
    primary_image_url: effectivePrimaryImageUrl,
    photo_urls: effectivePhotoUrls,
    safety_status: safetyStatus,
    symptoms: readOptionalString(row.symptoms),
    toxic_parts: readOptionalString(row.toxic_parts),
    alternatives: alternativesByPlant.get(id) ?? [],
    citations,
  };
}

export async function loadPlantsFromSupabase(): Promise<Plant[]> {
  ensurePublicSupabaseConfig();

  const supabase = createClient();

  const [
    { data: plantRows, error: plantsError },
    { data: citationRows, error: citationsError },
    { data: alternativesRows, error: alternativesError },
  ] = await Promise.all([
    supabase.from('plants').select('*'),
    supabase.from('citations').select('plant_id, source_name, source_url'),
    supabase.from('alternatives').select('toxic_plant_id, safe_plant_id'),
  ]);

  if (plantsError || citationsError || alternativesError) {
    const firstError = plantsError ?? citationsError ?? alternativesError;
    throw new Error(firstError?.message ?? 'Unknown database error');
  }

  const citationsByPlant = mapCitationsByPlant((citationRows ?? []) as GenericRow[]);
  const alternativesByPlant = mapAlternativesByPlant((alternativesRows ?? []) as GenericRow[]);

  return ((plantRows ?? []) as GenericRow[])
    .map((row) => mapPlantRow(row, citationsByPlant, alternativesByPlant))
    .filter((plant): plant is Plant => plant !== null);
}
