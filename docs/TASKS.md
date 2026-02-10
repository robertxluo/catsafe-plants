# TASKS

## Task Sizing Rules (applies to every task)
- Keep each task atomic and vertical-slice oriented.
- Target: `<=5 files changed` and `<=300 LOC` net change.
- Prefer one visible user outcome per task.
- If a task exceeds limits, split before implementation.

## T-01 - Ship a usable search-first home screen (mock data)
**Goal**
- Deliver a visible, mobile-friendly home page where users can search plant names and see immediate safety results from local mock data.

**Acceptance Criteria**
- Home screen has a clear search input and submit/instant-search behavior.
- Home screen uses a soft pastel yellow background with cat-pattern artwork.
- Visual style is pastel/cute while preserving clear, professional readability.
- Typing a common or scientific name returns matching plants from local data.
- Each result card shows plant name, safety badge, and primary image/placeholder.
- Empty state is shown when no results match.
- Loading state is shown while filtering/searching (even if simulated briefly for UX consistency).
- Error state is shown if local data read fails.

**Out of Scope**
- Supabase-backed search.
- Pagination and advanced filters.
- Detail-page evidence content.

**Verification**
- Manual:
  - Start app, search for known plant names, confirm result cards and safety badges.
  - Search nonsense text, confirm empty state.
  - Trigger error path (temporary data import break), confirm error state.
  - Check mobile width for layout and basic keyboard focus flow.
- Tests:
  - Add component test(s) for search filtering behavior and empty-state rendering.

## T-02 - Add URL-based plant detail route with trust disclaimer
**Goal**
- Enable opening a dedicated plant detail page by URL and show essential safety summary plus informational disclaimer.

**Acceptance Criteria**
- Clicking a search result navigates to `/plants/[id]` (or slug) route.
- Detail page shows plant name, safety status, symptoms/toxic parts section (when present), and at least one image.
- Detail page includes visible informational disclaimer (not a substitute for veterinary care).
- Missing/invalid plant ID returns a graceful not-found UI.
- Loading state appears while detail data resolves.

**Out of Scope**
- Citation list.
- Alternatives carousel/list.
- Supabase data fetching.

**Verification**
- Manual:
  - Open detail from home search and via direct URL.
  - Test invalid URL and confirm not-found UI.
  - Verify disclaimer visibility on desktop and mobile.
- Tests:
  - Add route-level test(s) for valid ID and not-found state.

## T-03 - Add citation-backed evidence section to detail page
**Goal**
- Present source-backed evidence on every plant detail page and enforce fallback language for unknown evidence.

**Acceptance Criteria**
- Detail page renders a citations section with source name and URL for current plant.
- If citations are missing, page shows `Unknown` caution copy and no strong safety claim.
- Citation links open correctly and are visibly labeled.
- Safety copy avoids medical certainty wording.

**Out of Scope**
- Data-entry/admin tooling.
- Citation moderation workflow.
- External source scraping.

**Verification**
- Manual:
  - Open plants with and without citations; verify section and unknown fallback behavior.
  - Click citation links and verify destinations.
- Tests:
  - Add tests for citation rendering and unknown-evidence fallback logic.

## T-04 - Add safe alternatives on toxic detail pages
**Goal**
- Show 3-5 safe alternatives on toxic plant pages to provide immediate next actions.

**Acceptance Criteria**
- Toxic plant detail pages render an alternatives section.
- Alternatives list shows 3-5 safe plants when available.
- Each alternative includes name, safety badge, and thumbnail/placeholder.
- Clicking an alternative navigates to that plant detail page.
- Non-toxic and unknown plants do not show this section.

**Out of Scope**
- Similarity scoring algorithm.
- Personalized recommendations.
- Ranking optimization.

**Verification**
- Manual:
  - Open a toxic plant and confirm 3-5 alternatives display and navigation works.
  - Open non-toxic/unknown plant and confirm alternatives section is hidden.
- Tests:
  - Add tests for conditional rendering and link behavior.

## T-05 - Launch directory page with pagination (20 per page)
**Goal**
- Provide a browseable plant directory for users who do not search by exact name.

**Acceptance Criteria**
- New `/plants` directory route lists plants with 20 items per page.
- Pagination controls support next/previous and page indicator.
- List cards show primary image, name, and safety status.
- Empty state appears if no plants are available.
- Loading and error states are handled on this route.

**Out of Scope**
- Search input on directory page.
- Filter UI.
- Server-side caching optimization.

**Verification**
- Manual:
  - Navigate through multiple pages and verify 20 items per page.
  - Confirm empty/error states via temporary data stubs.
  - Verify mobile layout remains usable.
- Tests:
  - Add tests for pagination math and boundary conditions.

## T-06 - Add directory filters: safety and flower color
**Goal**
- Let users narrow directory results by safety status and flower color.

**Acceptance Criteria**
- Directory has safety filter (`safe only`, `toxic only`) and flower-color filter from controlled values.
- Applying filters updates visible results correctly.
- Combined filters (safety + color) work together.
- Filtered empty state includes clear reset action.
- Filter controls are keyboard accessible and labeled.

**Out of Scope**
- Free-text custom colors.
- Multi-select for many colors in one pass (unless already supported by existing UI pattern).
- Saved filter preferences.

**Verification**
- Manual:
  - Apply each filter independently and combined; validate result accuracy.
  - Trigger no-match condition and confirm reset flow.
  - Keyboard tab through filters and verify focus styles.
- Tests:
  - Add tests for filter predicate logic and controlled color enforcement.

## T-07 - Add Supabase read path for search/directory/detail
**Goal**
- Replace mock data reads with Supabase-backed reads for public plant content.

**Acceptance Criteria**
- Search, directory, and detail routes read from Supabase in development.
- If env vars are missing, app shows clear configuration error state.
- Response shape preserves current UI behavior (name, safety, image, citations, alternatives).
- Unknown/missing fields degrade gracefully in UI.
- No secrets are exposed to client beyond approved public keys.

**Out of Scope**
- Admin write flows.
- Database migrations beyond minimum required read compatibility.
- Realtime subscriptions.

**Verification**
- Manual:
  - Run with valid env vars and confirm search/directory/detail work against DB.
  - Run with missing env vars and confirm friendly config error.
- Tests:
  - Add integration-style data mapping tests (query result -> UI model).

## T-08 - Enforce data quality guardrails in UI + query layer
**Goal**
- Ensure public views respect trust constraints (citation required, unknown fallback, toxic alt completeness indicator).

**Acceptance Criteria**
- Plants lacking citation data are either hidden from public lists or clearly labeled incomplete (choose one implementation and document).
- Unknown evidence always maps to `Unknown` safety display with caution language.
- Toxic plants with fewer than 3 alternatives show explicit incomplete-state messaging.
- Directory and detail views remain functional when records are partial.

**Out of Scope**
- Admin enforcement dashboards.
- Automated content backfill jobs.
- Third-party data validation services.

**Verification**
- Manual:
  - Seed/fixture partial records and verify each guardrail behavior.
  - Confirm no broken UI when required fields are absent.
- Tests:
  - Add tests for citation-required display policy and alternatives completeness rule.

## T-09 - Performance pass for image-heavy flows
**Goal**
- Improve perceived speed for home/search, directory, and detail pages to support fast confidence checks.

**Acceptance Criteria**
- List views load only a primary image per plant; detail loads full gallery.
- Images use optimized rendering strategy (Next Image, sizing, lazy loading where appropriate).
- Avoid unnecessary refetching/re-renders on filter/search changes.
- Basic performance check confirms first result appears quickly on standard local throttling profile.

**Out of Scope**
- CDN architecture redesign.
- Full synthetic monitoring setup.
- Advanced caching invalidation strategy.

**Verification**
- Manual:
  - Use browser dev tools throttling to compare search/list/detail responsiveness.
  - Confirm lazy loading and no layout shift spikes on scroll.
- Tests:
  - Add lightweight regression tests for data payload split assumptions where testable.

## T-10 - MVP readiness hardening and launch checklist
**Goal**
- Finalize MVP quality bar with UX states, accessibility basics, and reproducible checks for release confidence.

**Acceptance Criteria**
- Touched screens have explicit loading, empty, and error states.
- Landing page brand style matches approved visual direction (pastel yellow (bg-yellow-50) + cat-pattern background).
- Overall UI retains pastel/cute aesthetic without weakening trust/readability of safety information.
- Core interactions pass basic keyboard/focus sanity checks.
- Lint and production build pass.
- `docs/PROJECT.md` reflects any new commands/env vars/constraints introduced during implementation.
- Manual QA checklist is captured for happy path + edge cases.

**Out of Scope**
- Post-MVP admin/auth rollout.
- Analytics instrumentation beyond minimal logs.
- New product features.

**Verification**
- Manual:
  - Run full happy path from home search -> detail -> alternatives -> directory filters.
  - Validate loading/empty/error states on each touched flow.
  - Check mobile viewport and keyboard navigation basics.
- Tests:
  - Run `npm run lint`.
  - Run `npm run build`.
  - Run full project test suite (if present) and capture results.
