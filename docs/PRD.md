# CatSafe Plants PRD

## Overview
CatSafe Plants is a high-trust utility that helps cat owners quickly verify whether an indoor plant or flower is safe or toxic for cats, then offers safer alternatives.

### Product Goal
- Build strong trust and authority from day one.

### Primary Persona (MVP)
- Anxious cat owner checking a specific plant quickly.

### MVP Scope Snapshot
- Search-first experience is top priority.
- Safety + flower color filtering supported in directory.
- Minimum launch catalog: 50 plants.
- Every public plant record must include citation-backed evidence.
- Toxic plant pages must include 3-5 safe alternatives.
- Multiple images per plant are required before public listing.
- If evidence is uncertain/conflicting, classify as `Unknown` with caution language and no safe claim.
- Admin dashboard is out of MVP (post-launch).

### Success Criteria (MVP)
- Users can get a clear safety result quickly and confidently.
- First search result renders in under 2 seconds on normal mobile/desktop connections.
- Public data quality is consistent with trust standards (citations, alternatives, images).

## Core Features
### 1) Search-First Safety Check
- Users type a plant name (common or scientific) and receive an immediate safety verdict.
- Verdict states: `Safe`, `Mildly Toxic`, `Highly Toxic`, `Unknown`.
- Search is the primary entry flow and must be fast and clear.

### 2) Plant Directory (Browse + Filter)
- Paginated catalog to browse plants.
- Filters required in MVP:
  - Safety status (`Safe` / `Toxic` / `Unknown` as applicable)
  - Flower color (from controlled values)
- Designed for users who do not know exact plant names.

### 3) Plant Detail View
- Dedicated page for each plant with:
  - Safety status badge
  - Symptoms (if toxic)
  - Toxic parts (if toxic)
  - Citation-backed evidence section
  - Multiple plant images (required)

### 4) Safe Alternatives (Smart Swaps)
- For toxic plants, show 3-5 safe alternatives.
- Alternatives should be visually/aesthetically similar when possible.
- This feature is mandatory for toxic plant pages at MVP.

## User Experience
### UX Principles
- Trust-first clarity: binary safety signals should be easy to understand at a glance.
- Calm urgency: tone should be supportive, not alarmist.
- Fast decision support: users should quickly move from “Is this safe?” to “What should I buy instead?”
- Visual voice: pastel and cute, while remaining professional and medically credible.

### Visual Direction
- Landing page background: soft pastel yellow base with the cat-pattern background artwork.
- UI tone: playful warmth with clean, readable data presentation.
- Safety signaling must remain high-contrast and unambiguous over pastel surfaces.
- Decorative elements must never reduce readability of safety badges, symptoms, or citations.

### Primary User Flow (Highest Priority)
1. User lands on home/search.
2. User types a plant name.
3. User sees safety verdict immediately.
4. User opens detail page for evidence and symptoms/toxic parts.
5. If toxic, user sees 3-5 safe alternatives.

### Secondary User Flow
1. User opens directory.
2. User applies `Safe` + color filters.
3. User browses matching plants.
4. User opens detail page to verify.

### Content and Trust Requirements
- Every public plant must show source-backed citations.
- Uncertain evidence is shown as `Unknown` with caution guidance.
- Include clear informational disclaimer that the tool does not replace veterinary care.

### Performance Requirement
- First search result target: under 2 seconds on normal mobile/desktop connections.

## Risks / Mitigations
### 1) Inconsistent or weak safety evidence
- Risk: Conflicting sources reduce trust.
- Mitigation:
  - Require citation(s) for every public plant.
  - Use `Unknown` status when evidence is not conclusive.
  - Avoid strong “safe” claims without clear support.

### 2) Subjective flower color tagging
- Risk: Users disagree with color labels and filter results feel wrong.
- Mitigation:
  - Use a fixed controlled color set.
  - Standardize tagging guidance for data entry.

### 3) Image-heavy pages hurting performance
- Risk: Slow load harms confidence and conversion.
- Mitigation:
  - Optimize image delivery and lazy loading.
  - Prioritize primary image in list views.
  - Load full galleries on detail pages only.

### 4) Gaps in alternatives coverage
- Risk: Toxic pages without clear alternatives create dead ends.
- Mitigation:
  - Make 3-5 alternatives mandatory for toxic plants before publication.
  - Add launch QA checks for alternatives completeness.

### 5) Scope creep before launch
- Risk: Adding admin and non-core features delays MVP.
- Mitigation:
  - Keep admin dashboard post-launch.
  - Protect MVP around search, directory filters, detail trust content, and alternatives.
