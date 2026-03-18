# CatSafe Plants

CatSafe Plants helps cat owners quickly verify whether common houseplants are safe for cats, view source-backed evidence, and discover safer alternatives.

## Canonical Project Docs
- Project brief and technical constraints: `docs/PROJECT.md`
- Atomic launch backlog: `docs/TASKS.md`
- Product requirements: `docs/PRD.md`

## Runtime Policy
- Required Node version: `24.x`
- Runtime is pinned in:
  - `package.json` (`engines.node`)
  - `.nvmrc`

## Local Setup
1. Install Node `24.x`.
2. Install dependencies:
   - `npm install`
3. Create `.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Start the app:
   - `npm run dev`
5. Open:
   - `http://localhost:3000`

## Repo Commands
- `npm run dev` -> start local dev server
- `npm run build` -> create production build
- `npm run start` -> run built app
- `npm run lint` -> run ESLint
- `npm run audit:citations` -> verify citation completeness + URL health
- `npm run smoke:deploy -- --base-url=<url>` -> browser smoke check for deploy URLs

## Netlify Deployment Setup (SSR/Hybrid)
1. Connect repository to Netlify.
2. Verify build settings in the Netlify dashboard:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Confirm plugin:
   - `@netlify/plugin-nextjs`
4. Confirm branch strategy:
   - `main` -> Production
   - Pull requests -> Deploy Preview

## Deployment Status
- As of `2026-02-22`, the product owner confirmed:
  - Repository is linked to Netlify.
  - At least one Netlify deployment completed successfully.
- Production URL: `https://catsafe.robertluo.dev/`

## Required Environment Variables By Context

| Context | `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| --- | --- | --- |
| Production | Production Supabase URL | Production Supabase publishable key |
| Deploy Preview | Preview Supabase URL | Preview Supabase publishable key |

Optional:
- `CITATION_AUDIT_TIMEOUT_MS` (defaults to `10000`)

## Release Checklist
Run this sequence before production publish:
1. `npm run audit:citations`
2. `npm run lint`
3. `npm run build`
4. `npm run smoke:deploy -- --base-url=<netlify-preview-url>`
5. Open the Netlify deploy preview URL and spot-check:
   - Home search happy path + empty state
   - Detail evidence + alternatives
   - Directory filters + pagination

After production deploy:
1. `npm run smoke:deploy -- --base-url=https://catsafe.robertluo.dev/`
2. Spot-check the same critical path on production:
   - Home search happy path + empty state
   - Detail evidence + alternatives
   - Directory filters + pagination

## Rollback / Incident Basics
If production smoke fails:
1. Roll back to the last known-good Netlify deploy from the Netlify dashboard.
2. Re-run smoke checks on the rolled-back deploy URL.
3. Validate Production env variables were not changed unintentionally.
4. Open a follow-up task in `docs/TASKS.md` with exact failure details.
