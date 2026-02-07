# CatSafe Plants - Implementation Tasks

## 1. DB schema + migrations

**Outcome:** Tables: `plants`, `citations`, `plant_alternatives`, `ai_suggestions_queue` (+ enums, FKs, indexes).

**Acceptance:**

- Migrations run clean
- FKs enforce referential integrity
- Indexes exist for search fields (`common_name`, `scientific_name`, `aka_names`)
- `safety_status` enum works with values `non_toxic`, `mildly_toxic`, `highly_toxic`, `unknown`

---

## 2. Seed pipeline: 50 plants + 2–3 citations each

**Outcome:** Script/migration to load initial dataset into DB (idempotent).

**Acceptance:**

- `plants` has ≥50 rows
- Each plant has ≥1 citation (target 2–3)
- Mix of all safety statuses
- Toxic plants include symptoms + toxic_parts
- Photo URLs for at least 20 plants

---

## 3. Public API: search endpoint

**Outcome:** `GET /api/search?query=` returning `{id, common_name, scientific_name, safety_status}[]`.

**Acceptance:**

- Supports prefix + contains matching across `common_name`, `scientific_name`, `aka_names`
- Results capped at 20
- Empty query returns empty array
- Stable ordering

---

## 4. Public API: plant detail endpoint

**Outcome:** `GET /api/plants/:id` returns plant fields + citations + approved alternatives.

**Acceptance:**

- Alternatives only from `plant_alternatives`
- Citations array included
- 404 on missing plant
- Derived severity from status

---

## 5. Public UI: Home + search + autocomplete

**Outcome:** `/` with hero + search input, debounced (300ms) autocomplete dropdown, click navigates to plant page.

**Acceptance:**

- Typing shows suggestions from API
- Selecting a result navigates to `/plants/:id`
- Empty query hides dropdown
- Loading state shown during fetch

---

## 6. Public UI: Plant detail page

**Outcome:** `/plants/:id` renders common/scientific name, status badge, derived severity, photo (if any), citations (2–3 links).

**Acceptance:**

- Toxic fields conditional (symptoms/toxic_parts only displayed if toxic)
- Unknown shows caution note
- "Back to Search" navigation works

---

## 7. Alternatives rendering (public)

**Outcome:** On toxic plant pages, show 3–5 alternatives as clickable cards linking to real plant pages.

**Acceptance:**

- Only shown when plant is toxic AND alternatives exist in DB
- All links resolve to valid plant pages
- No duplicates
- Alternatives display "Safe" badge

---

## 8. Auth + allowlist gate for admin

**Outcome:** Protect `/admin/*` routes + `/api/admin/*` endpoints with server-side allowlist check for `robertxluo@gmail.com`.

**Acceptance:**

- Non-allowlisted users blocked (401/redirect)
- Allowlisted user can access
- Middleware runs server-side (not bypassable via client)

---

## 9. Admin CRUD: plants + citations

**Outcome:** Admin screens + endpoints to create/edit plants and add/edit/remove citations with validation.

**Acceptance:**

- Required fields validated (common_name, scientific_name, safety_status)
- Citation URLs validated
- Edits persist to DB
- Plant list refreshes after changes

---

## 10. Admin AI alternatives workflow (queue + approve/reject)

**Outcome:** Admin can trigger `POST /api/admin/plants/:id/ai-suggest` → creates pending queue items; admin can approve/reject from review UI.

**Acceptance:**

- Approve creates `plant_alternatives` row (only when suggested plant exists in DB)
- Approved alternatives appear on public pages immediately
- Rejected never appears publicly
- AI rationale stored in `ai_suggestions_queue`
