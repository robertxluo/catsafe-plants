# TASKS

## Task Sizing Rules (applies to every task)
- Keep each task atomic and vertical-slice oriented.
- Target: `<=5 files changed` and `<=300 LOC` net change.
- Prefer one visible user outcome per task.
- If a task exceeds limits, split before implementation.

## T-01 - Launch a visible search-first home UI (local mock list)
**Goal**
- Deliver the fastest usable UI: users can type a plant name and immediately see safety matches from local mock data.

**Acceptance criteria**
- Home route shows branded hero, search input.
- Home uses pastel yellow base with cat-pattern background.
- Typing filters by common name and scientific name.
- Results render as clickable cards with plant name and safety badge.
- Search is case-insensitive and updates as user types.
- Mobile layout remains usable at narrow widths.

**Out of scope**
- Supabase-backed data reads.
- Detail page content.
- Directory browsing and filters.

**Verification steps**
- Manual:
  - Run app and search for known names (`Lily`, `Lilium`, etc.).
  - Confirm matching cards update while typing.
  - Confirm pastel yellow + cat-pattern background is visible and readable.
  - Confirm no layout break on mobile viewport.
- Tests:
  - Deferred to T-04 (test baseline and home component coverage).

## T-02 - Add complete home-state UX (loading, empty, error)
**Goal**
- Make the home search flow production-ready with explicit loading, empty, and error states.

**Acceptance criteria**
- Initial data load shows a loading state.
- Search action shows a brief loading state for consistency.
- No-match query shows a clear empty state.
- Data-load failure shows a clear error state with retry action.
- Retry successfully restores normal search behavior.

**Out of scope**
- Global error boundary work.
- API/network retry policies.
- Detail route error handling.

**Verification steps**
- Manual:
  - Load the page and confirm initial loading state appears.
  - Search nonsense text and confirm empty state.
  - Force local loader failure and confirm error + retry behavior.
- Tests:
  - Add/update test for loading state visibility.
  - Add/update test for empty-state rendering.
  - Add/update test for error-state rendering and retry path.

## T-03 - Add image/placeholder support in home result cards
**Goal**
- Improve scanability by showing a primary image (or placeholder) on each home search result.

**Acceptance criteria**
- Plant mock model includes a primary image field.
- Result cards render primary image when available.
- Cards render a consistent placeholder when image is missing.
- Safety badge remains readable and visually distinct over pastel UI.

**Out of scope**
- Image gallery support.
- External image hosting migration.
- Performance tuning beyond basic rendering correctness.

**Verification steps**
- Manual:
  - Confirm cards with image URL show image.
  - Confirm cards without image show placeholder.
  - Verify card readability on desktop and mobile.
- Tests:
  - Add/update component test for image rendering branch.
  - Add/update component test for placeholder branch.

## T-04 - Introduce test baseline for UI component work
**Goal**
- Add a lightweight test harness so search and view behavior can be validated quickly as slices ship.

**Acceptance criteria**
- Test command exists in `package.json`.
- Vitest + RTL runs successfully in this repo.
- Home component tests run in jsdom environment.
- CI/local output clearly reports passing/failing tests.

**Out of scope**
- Full end-to-end browser testing.
- Snapshot-heavy test strategy.
- Coverage thresholds enforcement.

**Verification steps**
- Manual:
  - Run `npm run test` and confirm tests execute.
  - Confirm test runner can run in watch mode.
- Tests:
  - Add/update at least one passing smoke test for home component render.

## T-05 - Add URL-based detail route and home-result navigation
**Goal**
- Enable opening a plant detail page by URL and by clicking a home search result.

**Acceptance criteria**
- Clicking a search result navigates to `/plants/[id]`.
- Directly opening `/plants/[id]` renders the same detail route.
- Invalid plant id renders a graceful not-found state.
- Detail route shows a route-level loading state.

**Out of scope**
- Citation content.
- Alternatives section.
- Supabase data fetching.

**Verification steps**
- Manual:
  - Navigate from home search to detail and back.
  - Open valid and invalid detail URLs directly.
  - Confirm loading and not-found states are visible.
- Tests:
  - Add/update route-level test for valid id render.
  - Add/update route-level test for not-found path.

## T-06 - Add detail safety summary + informational disclaimer
**Goal**
- Provide core safety information and trust framing on the detail page.

**Acceptance criteria**
- Detail page displays plant name and safety status badge.
- Toxic plants display symptoms and toxic parts when present.
- Unknown/missing fields degrade gracefully (no broken UI).
- Informational disclaimer is always visible: not a substitute for veterinary care.

**Out of scope**
- Citation links.
- Alternatives recommendations.
- Admin editing controls.

**Verification steps**
- Manual:
  - Open safe, toxic, and unknown plants and confirm content differences.
  - Verify disclaimer visibility on desktop and mobile.
- Tests:
  - Add/update detail component test for toxic field rendering.
  - Add/update detail component test for unknown fallback and disclaimer.

## T-07 - Add citation-backed evidence section with unknown fallback
**Goal**
- Show source-backed evidence on detail pages and enforce cautious language when evidence is missing.

**Acceptance criteria**
- Detail page renders citation list with source name + URL.
- Citation links are clearly labeled and functional.
- Citation URLs resolve to the intended source page (direct response or valid redirect).
- Missing citations show `Unknown` fallback copy.
- Safety copy avoids absolute/medical-certainty language.

**Out of scope**
- Citation ingestion tooling.
- Source moderation workflows.
- Third-party scraping.

**Verification steps**
- Manual:
  - Open plants with citations and verify section content and links.
  - Open each citation link and confirm it lands on the expected source page.
  - Open plants without citations and verify unknown fallback copy.
- Tests:
  - Add/update test for citation rendering.
  - Add/update test for no-citation fallback behavior.

## T-08 - Add safe alternatives for toxic plants
**Goal**
- Give users immediate next-step choices by showing safe alternatives on toxic detail pages.

**Acceptance criteria**
- Toxic detail pages show an alternatives section.
- Section displays 3-5 alternatives when available.
- Each alternative card shows name, safety badge, and thumbnail/placeholder.
- Clicking an alternative opens that plant detail page.
- Non-toxic and unknown detail pages hide this section.

**Out of scope**
- Similarity ranking algorithm work.
- Personalized recommendations.
- Editorial/admin curation tools.

**Verification steps**
- Manual:
  - Open toxic plants and verify alternatives appear and navigate correctly.
  - Open non-toxic/unknown plants and verify section is hidden.
- Tests:
  - Add/update conditional-rendering test (toxic vs non-toxic).
  - Add/update link navigation test for alternatives.

## T-09 - Launch `/plants` directory with pagination (20/page)
**Goal**
- Provide a browseable directory for users who do not know exact names.

**Acceptance criteria**
- New `/plants` route lists plants with 20 items per page.
- Pagination supports next/previous and current page indicator.
- Directory cards show primary image/placeholder, name, and safety status.
- Directory includes loading, empty, and error states.

**Out of scope**
- Directory search input.
- Safety/color filters.
- Server-side caching optimization.

**Verification steps**
- Manual:
  - Navigate through pages and confirm 20 items per page.
  - Verify loading, empty, and error states via temporary stubs.
  - Confirm basic mobile usability.
- Tests:
  - Add/update tests for pagination math and boundary cases.

## T-10 - Add directory filters: safety status + flower color
**Goal**
- Let users narrow directory results by safety and flower color.

**Acceptance criteria**
- Directory includes safety filter (`safe only`, `toxic only`) and flower-color filter.
- Applying each filter updates visible results correctly.
- Combined filters apply with AND logic.
- No-match state includes clear reset action.
- Filter controls are keyboard accessible and labeled.

**Out of scope**
- Free-text color values.
- Multi-select color combinations (unless already present in UI pattern).
- Persisted/saved filter state.

**Verification steps**
- Manual:
  - Apply each filter independently and then together.
  - Trigger no-match condition and use reset action.
  - Tab through controls and verify focus states.
- Tests:
  - Add/update tests for filter predicate logic.
  - Add/update tests for reset behavior.

## T-11 - Add Supabase read path for home, detail, and directory
**Goal**
- Replace local mock read paths with Supabase-backed reads while preserving UI behavior.

**Acceptance criteria**
- Home search, detail, and directory read from Supabase in development.
- Missing env vars show clear configuration error state.
- Data mapping preserves existing UI fields and fallbacks.
- No server-only secrets are exposed client-side.

**Out of scope**
- Admin write flows.
- Realtime subscriptions.
- Large schema redesign.

**Verification steps**
- Manual:
  - Run with valid env vars and verify all public routes.
  - Run with missing env vars and verify friendly config error.
- Tests:
  - Add/update data-mapping tests (Supabase row -> UI model).
  - Add/update tests for missing-env error path.

## T-12 - Enforce trust guardrails + performance + release checks
**Goal**
- Finish MVP hardening with trust guardrails, image/perf basics, and reproducible release checks.

**Acceptance criteria**
- Unknown evidence always maps to `Unknown` safety display with caution language.
- Plants missing required evidence are hidden or clearly labeled incomplete (document chosen policy).
- Citation URL audit passes for published records (no broken links in release dataset).
- List views use primary image only; detail can load full gallery.
- Core touched flows pass loading/empty/error and keyboard/focus sanity checks.
- `npm run lint` and `npm run build` pass in a network-capable environment.
- `docs/PROJECT.md` is updated for any new commands/env/constraints.

**Out of scope**
- Admin dashboard rollout.
- Analytics expansion beyond minimal logging.
- New user-facing features outside MVP scope.

**Verification steps**
- Manual:
  - Run end-to-end happy path: home search -> detail -> alternatives -> directory + filters.
  - Run citation link spot-check/audit against release records and verify links resolve.
  - Validate loading/empty/error states across touched routes.
  - Verify mobile layout and keyboard navigation basics.
- Tests:
  - Run `npm run test`.
  - Run `npm run lint`.
  - Run `npm run build`.

**Deferred optimization note**
- Do not implement in current slice: refactor detail data loading to query a single plant by id (plus only its alternative ids) instead of loading the full plants dataset client-side.

## T-21 - Establish Netlify deployment baseline in repo
**Goal**
- Codify Netlify build/runtime behavior so deploys are deterministic.

**Acceptance criteria**
- Add `netlify.toml` with `command = "npm run build"` and `publish = ".next"`.
- Pin Node runtime to `24.x` in both `.nvmrc` and `netlify.toml`.
- Add `engines.node` to `package.json`.
- Update `docs/PROJECT.md` deployment section from Vercel-default to Netlify.

**Out of scope**
- Domain cutover.
- CDN/security hardening.

**Verification steps**
- Manual:
  - Netlify preview build succeeds from clean clone.
  - `npm run build` succeeds locally with Node `24.x`.
- Tests:
  - Run `npm run build`.

## T-22 - Configure environment strategy for production vs previews
**Goal**
- Keep preview deploys isolated from production data.

**Acceptance criteria**
- Document exact Netlify env vars per context in `docs/PROJECT.md`.
- Production context uses production Supabase `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Deploy Preview context uses preview Supabase `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Add a short context verification checklist to `docs/release/mvp-qa-2026-02-11.md`.

**Out of scope**
- Secret rotation automation.
- Supabase schema migration tooling.

**Verification steps**
- Manual:
  - Production deploy reads production data.
  - Deploy preview reads preview data only.
- Tests:
  - Run `npm run smoke:deploy -- --base-url=<deploy-preview-url>`.

## T-23 - Fix remote image host allowlist for real dataset hosts
**Goal**
- Prevent runtime image failures and dev-mode client exceptions.

**Acceptance criteria**
- Update `next.config.ts` remote image hosts to include both `www.aspca.org` and `upload.wikimedia.org`.
- Validate image rendering across `/`, `/plants`, and `/plants/[id]` with seeded data.
- Keep graceful placeholders when image URL is missing/invalid.

**Out of scope**
- R2 migration.
- Image optimization strategy redesign.

**Verification steps**
- Manual:
  - Browser smoke confirms no client-side exception page on home/directory/detail.
- Tests:
  - Run `npm run test:run`.
  - Run `npm run build`.

## T-24 - Add Netlify-focused CI gate
**Goal**
- Block unsafe merges before Netlify deploy.

**Acceptance criteria**
- Add `.github/workflows/ci.yml`.
- CI runs `npm ci`, `npm run test:run`, `npm run lint`, and `npm run build` on Node `24`.
- PR and push workflows execute automatically.

**Out of scope**
- Automated production deploy from CI.
- Visual regression system.

**Verification steps**
- Manual:
  - Push a branch or open a PR and confirm workflow executes.
- Tests:
  - Confirm CI job logs include test, lint, and build steps.

## T-25 - Add deploy smoke test + release checklist for Netlify
**Goal**
- Make post-deploy verification fast and repeatable.

**Acceptance criteria**
- Add a smoke command (Playwright) that validates:
  - Home search happy path.
  - Home empty state.
  - Detail evidence/alternatives visibility.
  - Directory filter + pagination flow.
  - No browser `pageerror`/`console.error` in the smoke flow.
- Document pre-deploy and post-deploy command sequence in `README.md`.
- Required release sequence includes `npm run audit:citations`, tests, lint, build, and smoke.

**Out of scope**
- Full E2E matrix.
- Performance lab benchmarking.

**Verification steps**
- Manual:
  - Run `npm run smoke:deploy -- --base-url=<netlify-preview-url>`.
  - Run `npm run smoke:deploy -- --base-url=<netlify-production-url>`.
- Tests:
  - Run `npm run test:run`.

## T-26 - Replace scaffold README with Netlify operator runbook
**Goal**
- Ensure any engineer can deploy/operate without chat context.

**Acceptance criteria**
- Rewrite `README.md` with:
  - Local setup.
  - Node version policy.
  - Netlify setup steps.
  - Required env vars by context.
  - Rollback and incident basics.
- Link canonical docs: `docs/PROJECT.md` and `docs/TASKS.md`.

**Out of scope**
- Marketing docs.
- Deep architecture docs.

**Verification steps**
- Manual:
  - Fresh setup and deploy from README steps only.
- Tests:
  - Confirm documented commands exist and run successfully.
