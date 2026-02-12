# CatSafe Plants Style Guide (Practical V1)

## 1) Purpose and Principles
- Build trust fast: users should understand safety outcomes quickly and confidently.
- Keep tone calm and clear: support urgent decisions without alarmist styling.
- Prioritize consistency: repeated patterns should look and behave the same.
- Maintain readability first: decorative choices must never reduce clarity.
- Accessibility is required, not optional: keyboard focus, labels, and contrast are baseline.
- This guide is the **canonical design reference**. `docs/design-principles.md` is aspirational/reference-only and does not override this guide.

## 2) Brand Direction
- Canonical visual identity: sage/slate with soft neutral surfaces.
- Hero approach: full-page plant/cat imagery with subtle overlays to preserve legibility.
- Voice: approachable and professional, with clear trust cues.
- Dark mode is **not supported** in V1. Do not use `dark:` variant utilities.
- This guide replaces the older pastel-yellow landing style direction.

## 3) Color System (Tailwind CSS v4 Only)

> This project uses **Tailwind CSS v4**. Theme tokens are declared in `globals.css` using `@theme inline`. Do not use `tailwind.config.js` (v3 pattern).

### Approved families
- Base/UI neutrals: `slate-*`, `gray-*`, `white`, `black`
- Brand/action: `green-*`, `emerald-*`
- Alerts and caution: `rose-*`, `amber-*`
- Informational links or secondary states: `sky-*` or `blue-*` only when needed
- Hero info tags: `violet-*` (scoped to hero tag pills)

### Scoped exceptions
- Flower-color filter pills may use any Tailwind named color family that maps to the physical flower color being represented (e.g. `orange-*`, `pink-*`, `violet-*`). These are scoped to the directory filter UI only and should not be used elsewhere.

### Hard rules
- Use Tailwind named color classes only in components.
- Do not use custom color literals in class strings:
  - no `bg-[#...]`
  - no `text-[#...]`
  - no `border-[#...]`
  - no `shadow-[...rgba...]`
- Do not use inline color literals for gradients or masks in component code.

### Allowed exceptions
- Tailwind opacity modifiers are allowed (example: `bg-green-100/95`).
- Non-color arbitrary utilities are allowed for layout/size only (example: `rounded-[2rem]`).

## 4) Typography
- Font family: DM Sans stack from app layout/globals.
- Hero heading: `font-semibold text-[2.5rem] sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight`
- Section/body default: `text-base sm:text-xl` for lead text and `text-sm` for supporting copy.
- Keep heading hierarchy clear:
  - H1: one primary message per page
  - H2/H3: support sections only

## 5) Spacing, Radius, Elevation
### Spacing rhythm
- Use Tailwind spacing scale (`p-2`, `p-4`, `mt-8`, `gap-3`, etc.).
- Favor consistent vertical rhythm in hero/search flows.

### Radius standards
- Inputs/cards: `rounded-lg` to `rounded-3xl`
- Pills/chips/nav tabs: `rounded-full`
- Avoid ad hoc radius values unless explicitly justified.

### Elevation standards
- Use Tailwind shadows only:
  - `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- Do not define custom RGBA shadow values.

## 6) Animation & Motion
### Transitions
- Default transition utility: `transition-all` or `transition-colors`
- Default duration: `duration-200`
- Press feedback on clickable cards and CTAs: `active:scale-[0.97]`

### Entrance animations
- Use the custom `animate-fade-up` class (defined in `globals.css`) for staggered content reveals.
- Stagger via inline `animationDelay` style in increments of ~80ms (e.g. `80ms`, `160ms`, `240ms`, `320ms`).

### Loading spinners
- Use `animate-spin` on the `LoaderCircle` icon for in-flight states.

### Rules
- Animations must enhance usability, not distract. Keep durations under 500ms.
- Do not define custom `@keyframes` in component files; add them to `globals.css`.

## 7) Icons
- Icon library: **`lucide-react`** only. Do not introduce other icon sets.
- Default inline icon size: `w-4 h-4`
- Search input icon: `w-6 h-6`
- Placeholder/decorative icon: `w-8 h-8`
- Hero info-tag icons: `w-3 h-3`

## 8) Core Component Patterns (Homepage V1)
### Header and nav pills
- Active and inactive pills must be visually consistent across pages.
- Active nav uses brand family (`green-*`) and clear focus ring.
- Base class: `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97]`

### Info tag pills (hero)
- Pattern: `inline-flex items-center gap-1.5 bg-{color}-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-{color}-700`

### Search input surface
- Required: leading icon, clear placeholder, focus ring, readable contrast.
- Default surface: `bg-white/95 shadow-lg rounded-4xl`
- Focus state: `focus:ring-2 focus:ring-slate-300`

### Dropdown panels (search results)
- Must support loading, empty, and error states.
- Surface: `bg-white/95 shadow-xl backdrop-blur rounded-3xl`
- Rows should preserve scanability:
  - plant name
  - scientific name
  - evidence status when relevant
  - safety badge

### Plant cards
- Default: `bg-white/85 hover:bg-white shadow-sm hover:shadow-md backdrop-blur border border-slate-200 hover:border-green-200 rounded-2xl p-3 transition-all duration-200`
- Press feedback: `active:scale-[0.97]`
- Image corner radius: `rounded-xl`
- Focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300`

### CTA button
- Pattern: `inline-flex items-center gap-2 bg-white/80 hover:bg-green-50 shadow-sm hover:shadow-md border border-green-200 rounded-full px-6 py-3 font-medium text-green-800 hover:text-green-900 active:scale-[0.97] transition-all duration-200`

### Link/button emphasis
- Use underline and hover/focus feedback for inline action links.
- Do not rely on color alone for interactivity.

### Error state pattern
- Error card: `bg-white/95 shadow-xl backdrop-blur border border-rose-200 rounded-3xl`
- Error text: `text-rose-700 text-sm` paired with `AlertCircle` icon (`w-4 h-4`)
- Retry button: `bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700 text-xs transition-colors`

## 9) State and Accessibility Rules
- Required UI states for touched flows:
  - loading
  - empty
  - error
  - success/happy path
- Keyboard/focus:
  - All interactive controls must have visible `focus-visible` states.
  - Prefer `focus-visible:` for buttons, links, and cards (keyboard-only ring).
  - Use `focus:` for text inputs where focus styling should appear on click as well.
  - Standard focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300`
  - Error-context focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300`
- Labeling:
  - form inputs must have associated labels or valid `aria-label`.
- Contrast:
  - target WCAG AA contrast intent for text and interactive elements.

## 10) Imagery and Background Layering
- Layer order standard:
  1. base background
  2. photo background
  3. soft gradient overlays
  4. content
- Use Tailwind gradient utilities (`bg-gradient-to-b`, `from-*`, `via-*`, `to-*`) with named colors.
- Avoid hard visual seams where overlays end; transitions must be soft.

### Do / Don't
- Do: `bg-gradient-to-b from-white/40 via-white/20 to-transparent`
- Don't: custom literal gradients with `rgba(...)` in class strings or inline styles

## 11) Implementation Guardrails
- If present, `docs/style-guide.md` is mandatory for UI work.
- The **homepage** (`home-view.tsx`) is the canonical style reference. Other pages are pending redesign and may not yet conform.
- UI task completion checklist:
  - uses approved palette families
  - no custom color literals in component styling
  - responsive checks passed (desktop/tablet/mobile)
  - browser console free of relevant warnings/errors
  - screenshot evidence captured for changed views

## 12) Quick Reference Appendix
### Approved class pairings
- Active nav pill: `bg-green-100 text-green-900 shadow-sm`
- Inactive nav pill: `text-slate-600 hover:text-green-800 hover:bg-green-50 hover:shadow-sm`
- Search input default: `bg-white/95 shadow-lg rounded-4xl`
- Search input focus: `focus:ring-2 focus:ring-slate-300`
- CTA button: `bg-white/80 hover:bg-green-50 shadow-sm hover:shadow-md border border-green-200 rounded-full text-green-800`
- Plant card: `bg-white/85 hover:bg-white shadow-sm hover:shadow-md border border-slate-200 hover:border-green-200 rounded-2xl`
- Inline action link: `text-green-800 hover:text-green-900 underline`
- Error text: `text-rose-700 text-sm` + `AlertCircle`
- Retry button: `bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700`
- Focus ring (default): `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300`
- Focus ring (error): `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300`

### Disallowed patterns
- `bg-[#xxxxxx]`, `text-[#xxxxxx]`, `border-[#xxxxxx]`
- `shadow-[...rgba(...)]`
- Inline style color literals for gradients, masks, or overlays in components
- `dark:` variant utilities (V1 is light-only)
- Icon libraries other than `lucide-react`
