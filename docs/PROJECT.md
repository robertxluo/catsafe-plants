# CatSafe Plants Project Brief

## Product Snapshot
- **Product:** CatSafe Plants
- **One-liner:** CatSafe Plants helps cat owners quickly check whether indoor plants and flowers are safe for cats, and discover safer alternatives before they buy.
- **Launch intent:** Public launch (real product, not prototype).
- **Visual direction:** Pastel and cute, but still professional and trustworthy.
- **Landing page style requirement:** Soft pastel yellow base (bg-yellow-50) with cat-pattern background image.
- **Primary users:**
  - Cat owners who need fast safety checks.
  - Cat owners browsing for safe plants by look/aesthetic.

## MVP Scope

### MVP In
- Search plants by common name or scientific name.
- Plant directory with pagination (20 per page).
- Filter directory by safety status (`safe only`, `toxic only`) and flower color.
- Landing page uses soft pastel yellow background with cat-pattern artwork.
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

## Environment Variables
Current required variables (already used by code):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Planned/additional variables (when image ingestion and/or admin tooling is implemented):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never exposed to client)

## Services / Accounts
- **Supabase**
  - PostgreSQL database host.
  - Auth provider for future admin allowlist.
- **Cloudinary**
  - Hosted plant image storage/delivery.
- **Deployment platform**
  - TBD (Vercel is the default recommendation for this Next.js stack unless changed).

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
- Flower color values must come from a fixed controlled list (no free text).
- Directory responses should prioritize performance:
  - Return primary image in list responses.
  - Load full gallery on detail pages.
- If safety evidence is missing, mark status/content as `unknown`; avoid strong claims.

### Safety/Trust Constraints
- This product is safety-adjacent; avoid unverified medical certainty language.
- Always present source-backed toxicity information.
- Include a visible disclaimer that this tool is informational and not a replacement for veterinary care.

## MVP Definition of Done
MVP is done when all conditions below are met:
- Users can search plants and get accurate safety results.
- Users can browse directory pages with safety + color filters and pagination.
- Users can open detail pages with gallery, safety details, toxic parts/symptoms, and safe alternatives.
- Every published plant record has citation data.
- At least 50 plants are available in production data.
- Landing page clearly presents the pastel yellow + cat-pattern brand style.
- Overall UI style is consistently pastel/cute while preserving readability and trust cues.
- UI is responsive and includes loading, empty, and error states for all MVP flows.
- Performance is acceptable for image-heavy pages (lazy loading and list/detail payload split).
- Lint/build checks pass using repo commands.

## Notes for Post-MVP
- Implement hidden `/admin` with allowlist auth and `404` behavior for unauthorized access.
- Add internal content management workflows for plants, photos, alternatives, and citations.
