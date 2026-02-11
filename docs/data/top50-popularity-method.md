# Top-50 Popularity Method (MVP Seed)

## Objective
Seed the launch catalog with a mixed safety profile of the most commonly sold and discussed indoor plants and potted indoor flowers in the U.S., while keeping every record citation-backed.

## Source Inputs (sampled February 11, 2026)
- Retail signal (weighted 70%):
  - Home Depot house plants category: https://www.homedepot.com/b/Outdoors-Garden-Center-Plants-Garden-Flowers-House-Plants/N-5yc1vZc8tc
  - The Sill best sellers: https://www.thesill.com/collections/best-sellers
  - Bloomscape best sellers: https://bloomscape.com/product-category/best-sellers/
- Editorial consensus (weighted 30%):
  - Better Homes & Gardens houseplants hub: https://www.bhg.com/gardening/houseplants/
  - Better Homes & Gardens care guides: https://www.bhg.com/gardening/houseplants/care/
  - The Spruce houseplants hub: https://www.thespruce.com/houseplants-4127760

## Enrichment Rules
- Aliases (aka_names) are sourced from ASPCA A-Z entries tied to the same scientific key; when exact scientific matches are sparse, genus-level ASPCA matches are used.
- Small manual alias fallbacks are applied for unique plants with sparse ASPCA variants to keep directory search quality high.
- Images follow this ASPCA-first quality chain:
  - prefer ASPCA original image path (`/sites/default/files/...`) when the same image also exists as `styles/medium_image_300x200`,
  - keep ASPCA listing thumbnail as a secondary `photo_urls` entry when needed,
  - if a record has a placeholder/missing image on its own ASPCA page, use same-scientific ASPCA alias pages first,
  - if still unresolved, use approved closest ASPCA-relative indoor substitute and document it below.
- Toxic detail fields map from ASPCA record content:
  - Clinical Signs -> symptoms
  - Toxic Principles -> toxic_parts (except Unknown, which stays NULL).

## Image Fallback Substitutions (Approved)
- `majesty-palm` -> reused ASPCA palm imagery from `areca-palm` + `parlor-palm` pages because the target page image is placeholder-only.
- `nerve-plant` -> reused ASPCA ornamental foliage imagery from `polka-dot-plant` + `prayer-plant` pages because the target page image is placeholder-only.
- `baby-rubber-plant` -> replaced placeholder image with ASPCA alias-page image assets (`american-rubber-plant`, `blunt-leaf-peperomia`).
- `emerald-ripple-peperomia` -> replaced placeholder image with ASPCA alias-page image assets (`metallic-peperomia`, `silver-heart`).

## Current Completeness Snapshot
- Records: 50
- Records with non-empty aka_names: 50/50
- Records with non-placeholder HTTPS primary image: 50/50
- Records with `primary_image_url` using ASPCA original path (not `styles/medium_image_300x200`): 50/50
- Records with 2+ HTTPS image URLs: 50/50
- Records requiring closest ASPCA-relative fallback: 2/50 (`majesty-palm`, `nerve-plant`)

## Final Ranked Seed List
The canonical machine-readable list is stored in docs/data/top50-seed-summary.json.

1. Golden Pothos (mildly toxic)
2. Snake Plant (mildly toxic)
3. Swiss Cheese Plant (mildly toxic)
4. Heartleaf Philodendron (mildly toxic)
5. Peace Lily (mildly toxic)
6. Spider Plant (non toxic)
7. Dracaena (mildly toxic)
8. Money Tree (non toxic)
9. Corn Plant (mildly toxic)
10. Chinese Evergreen (mildly toxic)
11. English Ivy (mildly toxic)
12. Jade Plant (mildly toxic)
13. Calathea (non toxic)
14. Parlor Palm (non toxic)
15. Areca Palm (non toxic)
16. Majesty Palm (non toxic)
17. Bamboo Palm (non toxic)
18. Boston Fern (non toxic)
19. Christmas Cactus (non toxic)
20. Aloe (mildly toxic)
21. Kalanchoe (mildly toxic)
22. Schefflera (mildly toxic)
23. Yucca (mildly toxic)
24. Dieffenbachia (mildly toxic)
25. Madagascar Dragon Tree (mildly toxic)
26. Satin Pothos (mildly toxic)
27. Baby Rubber Plant (non toxic)
28. Emerald Ripple Peperomia (non toxic)
29. Prayer Plant (non toxic)
30. Flamingo Flower (mildly toxic)
31. Phalaenopsis Orchid (non toxic)
32. Dancing Doll Orchid (non toxic)
33. African Violet (non toxic)
34. Blushing Bromeliad (non toxic)
35. Hibiscus (non toxic)
36. Gerber Daisy (non toxic)
37. Begonia (mildly toxic)
38. Chrysanthemum (mildly toxic)
39. Cyclamen (highly toxic)
40. Amaryllis (mildly toxic)
41. Tulip (mildly toxic)
42. Hyacinth (mildly toxic)
43. Daffodil (highly toxic)
44. Lily (highly toxic)
45. Cast Iron Plant (non toxic)
46. Aluminum Plant (non toxic)
47. Friendship Plant (non toxic)
48. Polka Dot Plant (non toxic)
49. Nerve Plant (non toxic)
50. Asparagus Fern (mildly toxic)
