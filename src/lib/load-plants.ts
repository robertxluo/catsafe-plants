import type { Plant } from '@/src/lib/plants';

const LOAD_PLANTS_ERROR = 'Unable to load plant data. Please try again.';

export async function loadPlants(): Promise<Plant[]> {
  try {
    const plantsModule = await import('@/src/lib/plants');
    if (!Array.isArray(plantsModule.plants)) {
      throw new Error('Invalid plant data.');
    }
    return plantsModule.plants;
  } catch {
    throw new Error(LOAD_PLANTS_ERROR);
  }
}
