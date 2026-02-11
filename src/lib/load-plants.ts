import type { Plant } from '@/src/lib/plants';
import { loadPlantsFromSupabase, SUPABASE_CONFIG_ERROR } from '@/src/lib/supabase/plants';

const LOAD_PLANTS_ERROR = 'Unable to load plant data. Please try again.';

export async function loadPlants(): Promise<Plant[]> {
  try {
    return await loadPlantsFromSupabase();
  } catch (err) {
    if (err instanceof Error && err.message === SUPABASE_CONFIG_ERROR) {
      throw err;
    }
    throw new Error(LOAD_PLANTS_ERROR);
  }
}
