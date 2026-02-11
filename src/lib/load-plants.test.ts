import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPlants } from '@/src/lib/load-plants';
import { loadPlantsFromSupabase, SUPABASE_CONFIG_ERROR } from '@/src/lib/supabase/plants';
import { createClient } from '@/src/lib/supabase/client';

vi.mock('@/src/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);
const ORIGINAL_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ORIGINAL_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

interface MockQueryResult {
  data: unknown;
  error: { message: string } | null;
}

function makeMockSupabaseClient(results: Record<string, MockQueryResult>) {
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(async () => results[table] ?? { data: [], error: null }),
    })),
  };
}

describe('loadPlants + Supabase mapping', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
    mockedCreateClient.mockReset();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ORIGINAL_SUPABASE_KEY;
  });

  it('maps Supabase rows into the UI Plant model with fallbacks', async () => {
    mockedCreateClient.mockReturnValue(
      makeMockSupabaseClient({
        plants: {
          data: [
            {
              id: 'lilium',
              common_name: 'Lily',
              scientific_name: 'Lilium spp.',
              aka_names: ['Tiger Lily'],
              flower_colors: ['white', 'orange', 'invalid-color'],
              primary_image_url: '/flower_placeholder.png',
              safety_status: 'highly_toxic',
              symptoms: 'Vomiting',
              toxic_parts: 'All parts',
            },
            {
              id: 'fallback-plant',
              names: ['Fallback Plant', 'Fallbackus plantus', 'Alias One'],
              flower_colors: ['blue'],
              photo_urls: ['https://example.com/fallback.jpg'],
              safety_status: 'not-a-real-status',
              symptoms: '',
              toxic_parts: null,
            },
            {
              id: '',
              common_name: 'No Id',
              scientific_name: 'Noidus',
            },
          ],
          error: null,
        },
        citations: {
          data: [
            {
              plant_id: 'lilium',
              source_name: 'ASPCA',
              source_url: 'https://www.aspca.org/example',
            },
          ],
          error: null,
        },
        alternatives: {
          data: [
            {
              toxic_plant_id: 'lilium',
              safe_plant_id: 'fallback-plant',
            },
          ],
          error: null,
        },
      }) as never
    );

    const plants = await loadPlantsFromSupabase();

    expect(plants).toHaveLength(2);

    expect(plants[0]).toEqual({
      id: 'lilium',
      common_name: 'Lily',
      scientific_name: 'Lilium spp.',
      aka_names: ['Tiger Lily'],
      flower_colors: ['white', 'orange'],
      primary_image_url: '/flower_placeholder.png',
      safety_status: 'highly_toxic',
      symptoms: 'Vomiting',
      toxic_parts: 'All parts',
      alternatives: ['fallback-plant'],
      citations: [
        {
          source_name: 'ASPCA',
          source_url: 'https://www.aspca.org/example',
        },
      ],
    });

    expect(plants[1]).toEqual({
      id: 'fallback-plant',
      common_name: 'Fallback Plant',
      scientific_name: 'Fallbackus plantus',
      aka_names: ['Alias One'],
      flower_colors: ['blue'],
      primary_image_url: 'https://example.com/fallback.jpg',
      safety_status: 'unknown',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    });
  });

  it('shows a clear configuration error when required env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(loadPlants()).rejects.toThrow(SUPABASE_CONFIG_ERROR);
  });

  it('converts Supabase query failures into a generic load error', async () => {
    mockedCreateClient.mockReturnValue(
      makeMockSupabaseClient({
        plants: {
          data: null,
          error: { message: 'permission denied' },
        },
        citations: {
          data: [],
          error: null,
        },
        alternatives: {
          data: [],
          error: null,
        },
      }) as never
    );

    await expect(loadPlants()).rejects.toThrow('Unable to load plant data. Please try again.');
  });
});
