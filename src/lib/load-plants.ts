import type { Plant } from '@/src/lib/plants';
import { loadPlantsFromSupabase, SUPABASE_CONFIG_ERROR } from '@/src/lib/supabase/plants';

const LOAD_PLANTS_ERROR = 'Unable to load plant data. Please try again.';
const CACHE_KEY = 'catsafe-plants-data';
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

let cachedPlantsPromise: Promise<Plant[]> | null = null;

async function fetchAndCachePlants(): Promise<Plant[]> {
  const plants = await loadPlantsFromSupabase();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          plants,
        })
      );
    } catch {
      // Ignore storage errors (e.g. quota exceeded)
    }
  }
  return plants;
}

export async function loadPlants(): Promise<Plant[]> {
  if (cachedPlantsPromise) {
    return cachedPlantsPromise;
  }

  cachedPlantsPromise = (async () => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;
            if (isFresh && Array.isArray(parsed.plants)) {
              // Trigger a background refresh (stale-while-revalidate)
              fetchAndCachePlants().catch(console.error);
              return parsed.plants as Plant[];
            }
          } catch {
            // Invalid JSON, fallback to fetch
          }
        }
      }

      return await fetchAndCachePlants();
    } catch (err) {
      cachedPlantsPromise = null;
      if (err instanceof Error && err.message === SUPABASE_CONFIG_ERROR) {
        throw err;
      }
      throw new Error(LOAD_PLANTS_ERROR);
    }
  })();

  return cachedPlantsPromise;
}
