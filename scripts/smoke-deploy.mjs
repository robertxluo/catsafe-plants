import { chromium } from 'playwright';

function parseBaseUrl(args) {
  const fromFlag = args.find((arg) => arg.startsWith('--base-url='))?.slice('--base-url='.length);
  if (fromFlag) return fromFlag;

  const flagIndex = args.findIndex((arg) => arg === '--base-url');
  if (flagIndex >= 0) {
    return args[flagIndex + 1];
  }

  return process.env.SMOKE_BASE_URL;
}

function normalizeBaseUrl(input) {
  if (!input) return null;

  try {
    const value = new URL(input);
    if (value.protocol !== 'http:' && value.protocol !== 'https:') {
      return null;
    }
    value.hash = '';
    value.search = '';
    if (value.pathname.endsWith('/')) {
      value.pathname = value.pathname.slice(0, -1);
    }
    return value.toString();
  } catch {
    return null;
  }
}

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function printStep(message) {
  console.log(`\n[smoke] ${message}`);
}

function summarizeErrorEntry(entry) {
  if (entry.type === 'pageerror') {
    return `pageerror: ${entry.message}`;
  }
  return `console.error: ${entry.message}`;
}

function buildUrl(baseUrl, path) {
  return new URL(path, `${baseUrl}/`).toString();
}

async function expectVisible(locator, description) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout: 45000 });
  } catch {
    throw new Error(`Expected ${description} to be visible.`);
  }
}

async function findHomeQueryWithResults(page, searchInput) {
  const candidateQueries = ['lily', 'fern', 'palm', 'rose', 'plant'];

  for (const query of candidateQueries) {
    await searchInput.fill(query);
    await page.waitForTimeout(450);
    const firstOptionButton = page.locator('[role="option"] button').first();
    if ((await firstOptionButton.count()) > 0) {
      return query;
    }
  }

  throw new Error('Unable to find any home search query with visible results.');
}

async function openFirstHomeSearchResult(page, searchInput, query) {
  await searchInput.fill(query);
  await page.waitForTimeout(450);
  const firstOptionButton = page.locator('[role="option"] button').first();
  if ((await firstOptionButton.count()) === 0) {
    throw new Error(`Unable to open a home search result for query "${query}".`);
  }

  await firstOptionButton.click();
  await page.waitForURL(/\/plants\/[^/?#]+/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

async function run() {
  const baseUrlRaw = parseBaseUrl(process.argv.slice(2));
  const baseUrl = normalizeBaseUrl(baseUrlRaw);

  assertCondition(
    Boolean(baseUrl),
    'Missing or invalid --base-url. Example: npm run smoke:deploy -- --base-url=https://catsafe.robertluo.dev/'
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const runtimeErrors = [];

  page.on('pageerror', (error) => {
    runtimeErrors.push({ type: 'pageerror', message: error.message });
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      runtimeErrors.push({ type: 'console', message: msg.text() });
    }
  });

  try {
    printStep(`Navigating to home: ${baseUrl}`);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await expectVisible(page.getByText(/keep your cat safe/i), 'home hero heading');

    const searchInput = page.getByRole('combobox', { name: /search plants by name/i });
    await expectVisible(searchInput, 'home search input');

    printStep('Checking home empty-state search');
    const searchableQuery = await findHomeQueryWithResults(page, searchInput);
    await searchInput.fill('zzzxqvnotplant987');
    await page.waitForTimeout(600);
    await expectVisible(page.getByText(/no plants found matching/i), 'home empty-state message');

    printStep('Checking home happy-path detail navigation');
    await openFirstHomeSearchResult(page, searchInput, searchableQuery);
    console.log(`[smoke] Opened detail from query "${searchableQuery}".`);
    await expectVisible(page.getByText(/^Evidence$/i), 'detail evidence section');
    await expectVisible(page.getByRole('link', { name: /open source/i }), 'detail source link');

    printStep('Checking directory filter and toxic-detail alternatives');
    await page.goto(buildUrl(baseUrl, '/plants'), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1:has-text("Plant Directory")', { timeout: 45000 });
    await page.getByRole('button', { name: /^toxic only$/i }).click();
    await page.waitForTimeout(300);
    const firstToxicResult = page.locator('button[aria-label^="Open details for "]').first();
    await expectVisible(firstToxicResult, 'toxic directory result');
    await firstToxicResult.click();
    await expectVisible(page.getByRole('heading', { name: /safe alternatives/i }), 'safe alternatives section');

    printStep('Checking directory pagination');
    await page.goto(buildUrl(baseUrl, '/plants'), { waitUntil: 'domcontentloaded' });
    const paginationTop = page.getByRole('navigation', { name: /pagination top/i });
    await expectVisible(paginationTop, 'top pagination controls');
    const nextButton = paginationTop.getByRole('button', { name: /^next$/i });
    assertCondition(await nextButton.isEnabled(), 'Expected pagination Next button to be enabled.');
    await nextButton.click();
    await page.waitForURL(/[\?&]page=2\b/, { timeout: 10000 });
    await expectVisible(page.getByText(/viewing 2 of/i), 'page 2 indicator');

    assertCondition(
      runtimeErrors.length === 0,
      `Detected runtime errors:\n${runtimeErrors.map((entry) => `- ${summarizeErrorEntry(entry)}`).join('\n')}`
    );

    printStep('Smoke deploy checks passed.');
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error(`\n[smoke] FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
