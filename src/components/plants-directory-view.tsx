'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Leaf, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import type { FlowerColor, Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, getStatusColor, getStatusLabel, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';

const PAGE_SIZE = 20;
type SafetyFilter = 'all' | 'safe_only' | 'toxic_only';
const FLOWER_COLOR_OPTIONS: FlowerColor[] = ['white', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'green'];
const PILL_BASE_CLASS =
  'inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200';
const PILL_INACTIVE_CLASS = 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50';
const FLOWER_COLOR_STYLES: Record<FlowerColor, { active: string; dot: string }> = {
  white: {
    active: 'border-slate-300 bg-slate-50 text-slate-900 shadow-sm',
    dot: 'border border-slate-300 bg-white',
  },
  yellow: {
    active: 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm',
    dot: 'bg-amber-400',
  },
  orange: {
    active: 'border-orange-300 bg-orange-50 text-orange-900 shadow-sm',
    dot: 'bg-orange-400',
  },
  red: {
    active: 'border-rose-300 bg-rose-50 text-rose-900 shadow-sm',
    dot: 'bg-rose-400',
  },
  pink: {
    active: 'border-pink-300 bg-pink-50 text-pink-900 shadow-sm',
    dot: 'bg-pink-400',
  },
  purple: {
    active: 'border-violet-300 bg-violet-50 text-violet-900 shadow-sm',
    dot: 'bg-violet-400',
  },
  blue: {
    active: 'border-sky-300 bg-sky-50 text-sky-900 shadow-sm',
    dot: 'bg-sky-400',
  },
  green: {
    active: 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm',
    dot: 'bg-emerald-400',
  },
};

function parsePageParam(value: string | null): number {
  if (!value) return 1;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

export function PlantsDirectoryView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [safetyFilter, setSafetyFilter] = useState<SafetyFilter>('all');
  const [flowerColorFilter, setFlowerColorFilter] = useState<'all' | FlowerColor>('all');

  const requestedPage = parsePageParam(searchParams.get('page'));

  const fetchPlants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedPlants = await loadPlants();
      setPlants(loadedPlants);
    } catch (err) {
      setPlants([]);
      setError(err instanceof Error ? err.message : 'Unable to load plant data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlants();
  }, [fetchPlants]);

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const displaySafetyStatus = getDisplaySafetyStatus(plant);
      const matchesSafety =
        safetyFilter === 'all'
          ? true
          : safetyFilter === 'safe_only'
            ? displaySafetyStatus === 'non_toxic'
            : displaySafetyStatus === 'mildly_toxic' || displaySafetyStatus === 'highly_toxic';
      const matchesFlowerColor =
        flowerColorFilter === 'all' ? true : plant.flower_colors.includes(flowerColorFilter);
      return matchesSafety && matchesFlowerColor;
    });
  }, [flowerColorFilter, plants, safetyFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredPlants.length / PAGE_SIZE)), [filteredPlants.length]);
  const currentPage = useMemo(() => Math.min(requestedPage, totalPages), [requestedPage, totalPages]);

  const visiblePlants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPlants.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredPlants]);
  const hasActiveFilters = safetyFilter !== 'all' || flowerColorFilter !== 'all';

  function pushPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-yellow-50 min-h-screen">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <LoaderCircle className="w-4 h-4 animate-spin" />
          Loading plants...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-yellow-50 px-4 min-h-screen">
        <div className="bg-white shadow-sm p-6 border border-rose-200 rounded-xl w-full max-w-md text-center">
          <div className="inline-flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
          <button
            type="button"
            onClick={() => void fetchPlants()}
            className="block bg-rose-50 hover:bg-rose-100 mx-auto mt-4 px-3 py-2 border border-rose-200 rounded-lg text-rose-700 text-sm transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="flex justify-center items-center bg-yellow-50 px-4 min-h-screen">
        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-xl w-full max-w-md text-center">
          <p className="text-gray-600 text-sm">No plants available in the directory yet.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative bg-yellow-50 min-h-screen overflow-hidden">
      <div
        className="top-0 right-0 absolute bg-[radial-gradient(circle_at_center,_rgba(253,224,71,0.25),_transparent_65%)] w-[38rem] h-[38rem] -translate-y-1/3 translate-x-1/3 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="bottom-0 left-0 absolute bg-[radial-gradient(circle_at_center,_rgba(110,231,183,0.18),_transparent_65%)] w-[34rem] h-[34rem] translate-y-1/3 -translate-x-1/3 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative mx-auto px-4 py-8 sm:py-10 max-w-6xl">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 bg-white/95 hover:bg-white mb-5 px-4 py-2 border border-yellow-200 rounded-full font-medium text-gray-700 text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        <header className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-3 mb-5">
          <div>
            <p className="font-semibold text-emerald-700 text-xs uppercase tracking-[0.18em]">Curated For Cat Safety</p>
            <h1 className="mt-1 font-bold text-gray-900 text-3xl sm:text-4xl leading-tight">Plant Directory</h1>
            <p className="mt-1.5 text-gray-600 text-sm sm:text-base">Browse all plants and check cat safety status.</p>
          </div>
          <div className="inline-flex items-center bg-white/95 shadow-sm px-3 py-1.5 border border-yellow-200 rounded-full font-medium text-gray-700 text-xs sm:text-sm">
            {filteredPlants.length} result{filteredPlants.length === 1 ? '' : 's'}
          </div>
        </header>

        <section
          aria-label="Directory filters"
          className="gap-3 grid sm:grid-cols-2 bg-gradient-to-br from-white via-yellow-50/70 to-emerald-50/40 shadow-sm mb-4 p-3 sm:p-4 border border-yellow-200/80 rounded-2xl"
        >
          <fieldset className="bg-white/75 p-2.5 border border-white rounded-xl">
            <legend className="mb-1.5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Safety filter</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Safety filter options">
              <button
                type="button"
                aria-pressed={safetyFilter === 'all'}
                onClick={() => setSafetyFilter('all')}
                className={`${PILL_BASE_CLASS} ${
                  safetyFilter === 'all'
                    ? 'border-gray-400 bg-gray-100 text-gray-900 shadow-sm'
                    : PILL_INACTIVE_CLASS
                }`}
              >
                All
              </button>
              <button
                type="button"
                aria-pressed={safetyFilter === 'safe_only'}
                onClick={() => setSafetyFilter('safe_only')}
                className={`${PILL_BASE_CLASS} ${
                  safetyFilter === 'safe_only'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
                    : PILL_INACTIVE_CLASS
                }`}
              >
                Safe only
              </button>
              <button
                type="button"
                aria-pressed={safetyFilter === 'toxic_only'}
                onClick={() => setSafetyFilter('toxic_only')}
                className={`${PILL_BASE_CLASS} ${
                  safetyFilter === 'toxic_only'
                    ? 'border-rose-300 bg-rose-50 text-rose-900 shadow-sm'
                    : PILL_INACTIVE_CLASS
                }`}
              >
                Toxic only
              </button>
            </div>
          </fieldset>

          <fieldset className="bg-white/75 p-2.5 border border-white rounded-xl">
            <legend className="mb-1.5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Flower color filter</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Flower color filter options">
              <button
                type="button"
                aria-pressed={flowerColorFilter === 'all'}
                onClick={() => setFlowerColorFilter('all')}
                className={`${PILL_BASE_CLASS} ${
                  flowerColorFilter === 'all'
                    ? 'border-gray-400 bg-gray-100 text-gray-900 shadow-sm'
                    : PILL_INACTIVE_CLASS
                }`}
              >
                All
              </button>
              {FLOWER_COLOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={flowerColorFilter === option}
                  onClick={() => setFlowerColorFilter(option)}
                  className={`${PILL_BASE_CLASS} capitalize ${
                    flowerColorFilter === option ? FLOWER_COLOR_STYLES[option].active : PILL_INACTIVE_CLASS
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${FLOWER_COLOR_STYLES[option].dot}`} aria-hidden="true" />
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 mb-5">
          <p className="text-gray-500 text-xs sm:text-sm">Viewing {currentPage} of {totalPages} pages</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSafetyFilter('all');
                setFlowerColorFilter('all');
              }}
              className="self-start sm:self-auto inline-flex items-center bg-white hover:bg-gray-50 px-2.5 py-1.5 border border-gray-200 rounded-full text-gray-700 text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          ) : null}
        </div>

        {filteredPlants.length === 0 ? (
          <section className="bg-white p-6 border border-gray-200 rounded-xl text-center">
            <p className="text-gray-600 text-sm">No plants match the selected safety and flower color filters.</p>
            <button
              type="button"
              onClick={() => {
                setSafetyFilter('all');
                setFlowerColorFilter('all');
              }}
              className="bg-emerald-50 hover:bg-emerald-100 mt-4 px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 text-sm transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          </section>
        ) : (
          <>
            <section aria-label="Plant directory results" className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePlants.map((plant) => {
                const displaySafetyStatus = getDisplaySafetyStatus(plant);
                const color = getStatusColor(displaySafetyStatus);
                const isEvidenceIncomplete = hasIncompleteEvidence(plant);
                return (
                  <button
                    key={plant.id}
                    type="button"
                    onClick={() => router.push(`/plants/${plant.id}`)}
                    aria-label={`Open details for ${plant.common_name}`}
                    className="group bg-white/95 shadow-sm hover:shadow-lg p-4 border border-yellow-100 hover:border-emerald-200 rounded-2xl text-left transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                  >
                    {plant.primary_image_url ? (
                      <Image
                        src={plant.primary_image_url}
                        alt={`${plant.common_name} photo`}
                        width={480}
                        height={360}
                        className="mb-3 rounded-xl w-full object-cover aspect-[4/3] group-hover:scale-[1.01] transition-transform"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={`w-full aspect-[4/3] rounded-xl flex items-center justify-center mb-3 ${color.bg}`}
                        data-testid={`directory-placeholder-${plant.id}`}
                        aria-hidden="true"
                      >
                        <Leaf className={`w-8 h-8 ${color.text} opacity-70`} />
                      </div>
                    )}
                    <div className="font-semibold text-gray-900 text-base tracking-tight">{plant.common_name}</div>
                    <div className="text-gray-500 text-sm italic">{plant.scientific_name}</div>
                    {isEvidenceIncomplete ? (
                      <div className="mt-2 text-amber-700 text-xs">Evidence incomplete</div>
                    ) : null}
                    <span
                      className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                      {getStatusLabel(displaySafetyStatus)}
                    </span>
                  </button>
                );
              })}
            </section>

            <nav
              className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 mt-8 bg-white/90 p-3 border border-yellow-100 rounded-2xl"
              aria-label="Pagination"
            >
              <button
                type="button"
                onClick={() => pushPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-full font-medium text-gray-700 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <p className="font-medium text-gray-600 text-sm text-center">
                Page {currentPage} of {totalPages}
              </p>
              <button
                type="button"
                onClick={() => pushPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-full font-medium text-gray-700 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </div>
    </main>
  );
}
