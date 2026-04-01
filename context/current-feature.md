# Current Feature

## Status

<!-- Not Started | In Progress | Complete -->

## Goals

<!-- Add goals for the next feature here -->

## Notes

<!-- Add notes, constraints, and links for the next feature here -->

## History

- `2026-02-06 to 2026-02-13` - Built the MVP foundation: initial Next.js app setup, Supabase wiring, searchable home experience, loading/empty/error states, primary plant imagery, detail routes, disclaimer + citation-backed safety content, safe alternatives, paginated `/plants` directory, color/safety filters, and the first Supabase-backed read path.
- `2026-02-12` - Added design-system and UI review foundations: design principles docs, a practical style guide, a reusable design review workflow, DM Sans as the primary font, and a more polished animated landing-page layout.
- `2026-02-13 to 2026-02-16` - Improved discovery UX: keyboard navigation and quick suggestions on home search, popular plants on the landing page, directory search and accessibility improvements, stronger mobile navigation, a redesigned detail image gallery, and expanded image support for Wikimedia Commons-hosted plant photos.
- `2026-02-21` - Established deployment and release safeguards: pinned the repo to Node `24.x`, added CI and deploy smoke testing, updated deployment/runbook documentation, and shipped production metadata plus `sitemap`/`robots` coverage.
- `2026-02-25 to 2026-03-05` - Refined directory architecture and browsing UX: modularized UI components, tightened pagination/filter behavior, added `returnTo` navigation support for detail pages, improved search input styling, shipped mobile search mode, and refined filter interactions/documentation.
- `2026-03-17` - Expanded the catalog and browsing polish: removed the outdated unit-test suite, added more non-toxic and mildly toxic flowers to the seed catalog, improved sorting, and added directory scroll-to-top behavior plus loading skeletons.
- `2026-03-18` - Shipped a broad UI/content polish pass: refreshed homepage, detail, and directory layouts; improved wording and safety presentation; added a reusable `SiteFooter` with plant-request CTA; added touch gestures for the gallery; added Amazon affiliate purchase links; improved loading/navigation feedback; optimized data/image loading with caching; integrated `useDeferredValue` for search responsiveness; and filled safe-alternative coverage across the plant catalog.
- `2026-03-23 to 2026-03-24` - Finalized the latest directory improvements: added a sticky search bar, mobile filter refinement tags with a clear action, iOS/mobile scroll fixes, and migrated the plants directory to server-side rendering with a dedicated loading UI.
