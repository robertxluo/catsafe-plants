# CatSafe Plants Project Brief

## Product Snapshot
- **Product:** CatSafe Plants
- **One-liner:** CatSafe Plants helps cat owners quickly check whether indoor plants and flowers are safe for cats, and discover safer alternatives before they buy.
- **Launch intent:** Public launch (real product, not prototype).
- **Visual direction:** Sage/slate and soft-neutral, still cute, professional, and trustworthy.
- **Landing page style requirement:** Full-page plant/cat hero scene with subtle neutral overlays and optional low-emphasis cat-pattern texture.
- **Primary users:**
  - Cat owners who need fast safety checks.
  - Cat owners browsing for safe plants by look/aesthetic.

## MVP Scope

### MVP In
- Search plants by common name or scientific name.
- Plant directory with pagination (20 per page).
- Filter directory by safety status (`safe only`, `toxic only`) and flower color.
- Landing page uses sage/slate-neutrals with full-page plant/cat hero imagery and subtle overlay treatment.
- Plant detail page with:
  - Safety badge/status.
  - Symptoms and toxic parts (when applicable).
  - Multiple photos/gallery.
  - 3-5 safe alternatives for toxic plants.
  - Citation-backed evidence section.
- Citations are required for every plant record.
- Public, mobile-friendly interface with loading/empty/error states on touched flows.

### MVP Out
- Hidden admin dashboard and admin auth flow (deferred post-launch).
- User accounts/profiles for public users.
- E-commerce/checkouts.
- Community features (comments, ratings, forums).
- Personalization/recommendations based on user history.
- Native iOS/Android apps.
- Multi-language support.
- Notifications (email/push).

## Approved Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling/UI:** Tailwind CSS 4.
- **Backend:** Node.js runtime via Next.js route handlers/server components/serverless model.
- **Database:** PostgreSQL (via Supabase).
- **Auth (approved approach):** Supabase Auth + email allowlist (for future admin scope).
- **Image hosting (approved):** Cloudinary.

## Repo Commands
- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Production build: `npm run build`
- Start production server locally: `npm run start`
- Lint: `npm run lint`
- Citation release audit (network required): `npm run audit:citations`
- Deploy smoke check (network required): `npm run smoke:deploy -- --base-url=<url>`
- MVP top-50 seed SQL (run in Supabase SQL editor): `scripts/sql/seed-mvp-top50-popular.sql`
- Required Node runtime baseline: `22.x` (`package.json#engines`)

## Environment Variables
Current required variables (already used by code):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional variable (release check tuning):
- `CITATION_AUDIT_TIMEOUT_MS` (timeout per citation URL check; defaults to `10000`)

Planned/additional variables (when image ingestion and/or admin tooling is implemented):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never exposed to client)

### Netlify Context Variable Strategy (Required)
- **Production context**
  - `NEXT_PUBLIC_SUPABASE_URL` -> production Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` -> production Supabase publishable key
- **Deploy Preview context**
  - `NEXT_PUBLIC_SUPABASE_URL` -> preview Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` -> preview Supabase publishable key
- **Branch Deploy context** (optional, if used)
  - Use preview Supabase values unless a branch-specific dataset is explicitly required.
- **Do not commit secrets or environment files with credentials.**

## Services / Accounts
- **Supabase**
  - PostgreSQL database host.
  - Auth provider for future admin allowlist.
- **Cloudinary**
  - Hosted plant image storage/delivery.
- **Netlify**
  - Primary deployment platform for SSR/Hybrid Next.js runtime.
  - Deploy previews enabled on pull requests.
  - Production deploys from `main`.

## Deployment Status
- Status date: `2026-02-22`
- Product owner confirmed:
  - Repository is linked to Netlify.
  - Netlify deployment has completed successfully.
- Canonical production URL: `https://catsafe.robertluo.dev/`

## Data Sources & Constraints

### Data Model (MVP)
- `plants`
  - `id` (uuid)
  - `names[]` (common/scientific/aka names)
  - `photo_urls[]`
  - `flower_colors[]` (from fixed allowed list)
  - `safety_status` (`non_toxic | mildly_toxic | highly_toxic | unknown`)
  - `symptoms`
  - `toxic_parts`
- `alternatives`
  - `id`
  - `toxic_plant_id` (FK -> plants)
  - `safe_plant_id` (FK -> plants)
- `citations`
  - `id`
  - `plant_id` (FK -> plants)
  - `source_url`
  - `source_name`

### Data Constraints
- Seed minimum of **50 plants** for MVP launch.
- Every plant record must include at least one citation before it is considered complete.
- Every citation URL must resolve to the intended source page (HTTP `200` or valid redirect to the same source).
- Broken citation links block publish; unresolved citations must be treated as `unknown` until corrected.
- Chosen policy for missing required evidence: keep records visible but clearly label them as **Evidence incomplete**, and force safety display to `Unknown` with caution language.
- Flower color values must come from a fixed controlled list (no free text).
- Directory responses should prioritize performance:
  - Return primary image in list responses.
  - Load full gallery on detail pages.
- If safety evidence is missing, mark status/content as `unknown`; avoid strong claims.

### Seed Workflow (Top-50 Popular Catalog)
- Canonical method doc: `docs/data/top50-popularity-method.md`
- Canonical ranked seed summary: `docs/data/top50-seed-summary.json`
- SQL seed file: `scripts/sql/seed-mvp-top50-popular.sql`
- Seed behavior:
  - Full reset of `plants`, `citations`, and `alternatives` tables before insert.
  - Rebuild with 50 popular indoor plants/potted flowers.
  - Add one ASPCA citation per plant.
  - Add 3-5 safe alternatives for each toxic plant.
- Verification order after seed:
  1. `npm run audit:citations`
  2. `npm run test:run`
  3. `npm run lint`
  4. `npm run build`
  5. `npm run smoke:deploy -- --base-url=<netlify-preview-or-production-url>`
  6. Manual browser spot-check on Netlify preview or production URL.

### Safety/Trust Constraints
- This product is safety-adjacent; avoid unverified medical certainty language.
- Always present source-backed toxicity information.
- Validate citation link health during QA/release checks, not just at data entry time.
- Include a visible disclaimer that this tool is informational and not a replacement for veterinary care.

## MVP Definition of Done
MVP is done when all conditions below are met:
- Users can search plants and get accurate safety results.
- Users can browse directory pages with safety + color filters and pagination.
- Users can open detail pages with gallery, safety details, toxic parts/symptoms, and safe alternatives.
- Every published plant record has citation data.
- At least 50 plants are available in production data.
- Landing page clearly presents the sage/slate + soft-neutral brand style with cat-safe trust cues.
- Overall UI style is consistently calm/cute while preserving readability and trust cues.
- UI is responsive and includes loading, empty, and error states for all MVP flows.
- Performance is acceptable for image-heavy pages (lazy loading and list/detail payload split).
- Lint/build checks pass using repo commands.
- Deploy smoke check passes for preview and production URLs.

## Notes for Post-MVP
- Implement hidden `/admin` with allowlist auth and `404` behavior for unauthorized access.
- Add internal content management workflows for plants, photos, alternatives, and citations.
