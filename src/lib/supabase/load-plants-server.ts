import type { Plant } from '@/src/lib/plants';
import { createClient } from '@/src/lib/supabase/server';
import {
  ensurePublicSupabaseConfig,
  mapCitationsByPlant,
  mapAlternativesByPlant,
  mapPlantRow,
  type GenericRow,
} from '@/src/lib/supabase/plants';

/**
 * Server-side plant loader. Uses the server Supabase client so data is
 * already available in the initial HTML — no client-side fetch needed.
 */
export async function loadPlantsServer(): Promise<Plant[]> {
  ensurePublicSupabaseConfig();

  const supabase = await createClient();

  const [
    { data: plantRows, error: plantsError },
    { data: citationRows, error: citationsError },
    { data: alternativesRows, error: alternativesError },
  ] = await Promise.all([
    supabase.from('plants').select('*'),
    supabase.from('citations').select('plant_id, source_name, source_url'),
    supabase.from('alternatives').select('toxic_plant_id, safe_plant_id'),
  ]);

  if (plantsError || citationsError || alternativesError) {
    const firstError = plantsError ?? citationsError ?? alternativesError;
    throw new Error(firstError?.message ?? 'Unknown database error');
  }

  const citationsByPlant = mapCitationsByPlant((citationRows ?? []) as GenericRow[]);
  const alternativesByPlant = mapAlternativesByPlant((alternativesRows ?? []) as GenericRow[]);

  return ((plantRows ?? []) as GenericRow[])
    .map((row) => mapPlantRow(row, citationsByPlant, alternativesByPlant))
    .filter((plant): plant is Plant => plant !== null);
}
