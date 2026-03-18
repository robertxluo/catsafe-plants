# Top-50 Popularity Method (Historical Filename, Expanded Catalog)

## Objective
Seed the launch catalog with a mixed safety profile of the most commonly sold and discussed indoor plants, potted indoor flowers, and common bouquet flowers in the U.S., while keeping every record citation-backed.

## Source Inputs (sampled February 11 and March 5, 2026)
- Retail signal (weighted 70%):
  - Home Depot house plants category: https://www.homedepot.com/b/Outdoors-Garden-Center-Plants-Garden-Flowers-House-Plants/N-5yc1vZc8tc
  - The Sill best sellers: https://www.thesill.com/collections/best-sellers
  - Bloomscape best sellers: https://bloomscape.com/product-category/best-sellers/
  - 1-800-Flowers mixed bouquets: https://www.1800flowers.com/mixedbouquets
  - 1-800-Flowers mixed roses and blooms bouquet: https://www.1800flowers.com/mixed-roses-and-blooms-12550
  - Costco floral landing page: https://www.costco.com/floral.html
  - Costco hydrangea and rose bouquets: https://www.costco.com/opt/hydrangea-and-rose-bouquets
  - Kroger flowers and plants hub: https://www.kroger.com/pr/flowers-plants
  - Trader Joe's flower search: https://www.traderjoes.com/home/search?q=flowers
- Editorial consensus (weighted 30%):
  - Better Homes & Gardens houseplants hub: https://www.bhg.com/gardening/houseplants/
  - Better Homes & Gardens care guides: https://www.bhg.com/gardening/houseplants/care/
  - The Spruce houseplants hub: https://www.thespruce.com/houseplants-4127760
- Excluded during the bouquet refresh:
  - Amazon and Walmart surfaced mostly ads, JS-heavy pages, or unstable search result URLs during the March 5, 2026 validation pass, so they were not treated as ranking inputs.

## Enrichment Rules
- Aliases (aka_names) are sourced from ASPCA A-Z entries tied to the same scientific key; when exact scientific matches are sparse, genus-level ASPCA matches are used.
- Small manual alias fallbacks are applied for unique plants with sparse ASPCA variants to keep directory search quality high.
- Images follow a dynamic source quality chain:
  - We exclusively use high-quality Wikimedia Commons and Unsplash URLs (3 per plant) to avoid placeholder issues or broken internal links from ASPCA records.
  - Using direct CDNs like `images.unsplash.com` provides verified high-quality media for public testing and development.
- Toxic detail fields map from ASPCA record content:
  - Clinical Signs -> symptoms
  - Toxic Principles -> toxic_parts (except Unknown, which stays NULL).

## Image Replacements and Sync
- The initial ASPCA-first imagery proved unreliable, often referencing missing resources or low-quality thumbnails. 
- All seed records were updated to use three high-quality `upload.wikimedia.org` or `images.unsplash.com` images per plant.
- `rose` uses high-quality raw assets from Unsplash.
- `rose` and `peony` -> used small manual alias fallbacks to keep search quality acceptable because the matching ASPCA entries did not expose additional common names.

## Current Completeness Snapshot
- Records: 58
- Records with non-empty aka_names: 58/58
- Records with non-placeholder HTTPS primary image (Wikimedia or Unsplash): 58/58
- Records with 3+ HTTPS high-quality image URLs: 58/58

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
51. Rose (non toxic)
52. Carnation (mildly toxic)
53. Peruvian Lily (non toxic)
54. Sunflower (non toxic)
55. Hydrangea (mildly toxic)
56. Common Snapdragon (non toxic)
57. Peony (mildly toxic)
58. Baby's Breath (non toxic)
