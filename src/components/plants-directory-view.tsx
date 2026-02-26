'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, ArrowRight, LoaderCircle, Search, SlidersHorizontal } from 'lucide-react';
import type { FlowerColor, Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';
import { SiteHeader } from '@/src/components/ui/site-header';
import { SafetyBadge } from '@/src/components/ui/safety-badge';
import { PlantImage } from '@/src/components/ui/plant-image';

const PAGE_SIZE = 20;
type SafetyFilter = 'all' | 'safe_only' | 'toxic_only';
const FLOWER_COLOR_OPTIONS: FlowerColor[] = ['white', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'green'];
const PILL_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 min-h-9 sm:min-h-10 px-3 sm:px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97]';
const PILL_INACTIVE_CLASS = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
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
  const committedQuery = searchParams.get('q')?.trim() ?? '';
  const normalizedCommittedQuery = committedQuery.toLowerCase();
  const [searchInput, setSearchInput] = useState(committedQuery);

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

  const pushWithUpdatedParams = useCallback(
    (updateParams: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updateParams(params);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchInput(committedQuery);
  }, [committedQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextQuery = searchInput.trim();
      if (nextQuery === committedQuery) return;

      pushWithUpdatedParams((params) => {
        if (nextQuery.length > 0) {
          params.set('q', nextQuery);
        } else {
          params.delete('q');
        }
        params.delete('page');
      });
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [committedQuery, pushWithUpdatedParams, searchInput]);

  const clearRefinements = useCallback(() => {
    setSafetyFilter('all');
    setFlowerColorFilter('all');
    setSearchInput('');

    if (committedQuery.length > 0) {
      pushWithUpdatedParams((params) => {
        params.delete('q');
        params.delete('page');
      });
    }
  }, [committedQuery, pushWithUpdatedParams]);

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const matchesSearch =
        normalizedCommittedQuery.length === 0
          ? true
          : plant.common_name.toLowerCase().includes(normalizedCommittedQuery) ||
            plant.scientific_name.toLowerCase().includes(normalizedCommittedQuery) ||
            plant.aka_names.some((alias) => alias.toLowerCase().includes(normalizedCommittedQuery));
      const displaySafetyStatus = getDisplaySafetyStatus(plant);
      const matchesSafety =
        safetyFilter === 'all'
          ? true
          : safetyFilter === 'safe_only'
            ? displaySafetyStatus === 'non_toxic'
            : displaySafetyStatus === 'mildly_toxic' || displaySafetyStatus === 'highly_toxic';
      const matchesFlowerColor = flowerColorFilter === 'all' ? true : plant.flower_colors.includes(flowerColorFilter);
      return matchesSearch && matchesSafety && matchesFlowerColor;
    });
  }, [flowerColorFilter, normalizedCommittedQuery, plants, safetyFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredPlants.length / PAGE_SIZE)), [filteredPlants.length]);
  const currentPage = useMemo(() => Math.min(requestedPage, totalPages), [requestedPage, totalPages]);

  const visiblePlants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPlants.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredPlants]);
  const hasActiveFilters = safetyFilter !== 'all' || flowerColorFilter !== 'all' || committedQuery.length > 0;

  function pushPage(nextPage: number) {
    pushWithUpdatedParams((params) => {
      if (nextPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(nextPage));
      }
    });
  }

  const resultsLabel = `${filteredPlants.length} result${filteredPlants.length === 1 ? '' : 's'}`;

  return (
    <div className="relative bg-slate-100 min-h-screen overflow-hidden text-slate-900">
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-100 to-emerald-50/40"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 via-transparent to-slate-100/30"
        aria-hidden="true"
      />
      <div
        className="-top-24 -right-16 absolute bg-emerald-100/60 blur-3xl rounded-full w-72 h-72 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="-bottom-24 -left-16 absolute bg-slate-200/60 blur-3xl rounded-full w-72 h-72 pointer-events-none"
        aria-hidden="true"
      />

      <div className="z-10 relative flex flex-col min-h-screen">
        <SiteHeader
          pathname={pathname}
          onGoHome={() => router.push('/')}
          onGoDirectory={() => router.push('/plants')}
          onGoBack={() => router.push('/')}
        />

        <main className="flex flex-col flex-1 mx-auto px-4 sm:px-6 pt-7 sm:pt-9 pb-8 sm:pb-10 w-full max-w-6xl">
          <header className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-3 mb-6">
            <div className="max-w-2xl">
              <p className="font-semibold text-emerald-700 text-xs uppercase tracking-[0.18em]">
                Curated For Cat Safety
              </p>
              <h1 className="mt-1 font-semibold text-slate-900 text-3xl sm:text-4xl leading-tight tracking-tight">
                Plant Directory
              </h1>
              <p className="mt-1.5 text-slate-700 text-sm sm:text-base">
                Browse all plants and check cat safety status.
              </p>
            </div>
            <div className="inline-flex items-center bg-white/80 px-3 py-1.5 border border-slate-200 rounded-full font-medium text-slate-600 text-xs sm:text-sm">
              {resultsLabel}
            </div>
          </header>

          {isLoading ? (
            <section className="flex flex-1 justify-center items-start pt-10">
              <div className="inline-flex items-center gap-2 bg-white/95 shadow-sm backdrop-blur px-4 py-3 border border-white rounded-2xl text-slate-600 text-sm">
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Loading plants...
              </div>
            </section>
          ) : error ? (
            <section className="flex flex-1 justify-center items-start pt-10">
              <div
                role="alert"
                className="bg-white/95 shadow-xl backdrop-blur p-6 border border-rose-200 rounded-3xl w-full max-w-md text-center"
              >
                <div className="inline-flex items-center gap-2 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => void fetchPlants()}
                  className="block bg-rose-50 hover:bg-rose-100 mx-auto mt-4 px-3 py-2 border border-rose-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 text-rose-700 text-sm transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </section>
          ) : plants.length === 0 ? (
            <section className="flex flex-1 justify-center items-start pt-10">
              <div className="bg-white/95 shadow-sm backdrop-blur p-6 border border-slate-200 rounded-3xl w-full max-w-md text-center">
                <p className="text-slate-600 text-sm">No plants available in the directory yet.</p>
              </div>
            </section>
          ) : null}

          {!isLoading && !error && plants.length > 0 ? (
            <>
              <section className="bg-white/88 shadow-sm backdrop-blur mb-4 p-4 sm:p-5 border border-white/85 rounded-3xl">
                <div className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Search plants</div>
                <p id="directory-search-hint" className="mt-1 text-slate-500 text-xs sm:text-sm">
                  Filter by common name, scientific name, or known alias.
                </p>
                <div className="relative mt-3">
                  <Search
                    className="top-1/2 left-3 absolute w-4 h-4 text-slate-400 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="directory-search"
                    type="search"
                    aria-label="Search plant directory"
                    aria-describedby="directory-search-hint"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by plant name, scientific name, or alias..."
                    className="bg-white pr-4 pl-10 border border-slate-200 focus:border-emerald-300 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 w-full min-h-11 text-slate-800 placeholder:text-slate-400 text-sm sm:text-base transition-colors"
                  />
                </div>
              </section>

              <section
                aria-label="Directory filters"
                className="bg-white/88 shadow-lg backdrop-blur mb-5 p-4 sm:p-6 border border-white/85 rounded-3xl"
              >
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-2 sm:gap-3 mb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                      Filter plants
                    </div>
                    <p className="mt-1 text-slate-500 text-xs sm:text-sm">
                      Refine results by safety status and flower color.
                    </p>
                  </div>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearRefinements}
                      className="inline-flex items-center self-start sm:self-auto gap-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 font-medium text-slate-700 text-xs transition-colors cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  ) : null}
                </div>

                <div className="gap-4 grid sm:grid-cols-2">
                  <fieldset className="bg-emerald-50/45 p-3.5 border border-emerald-100 rounded-2xl">
                    <legend className="mb-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Safety filter
                    </legend>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Safety filter options">
                      <button
                        type="button"
                        aria-pressed={safetyFilter === 'all'}
                        onClick={() => setSafetyFilter('all')}
                        className={`${PILL_BASE_CLASS} ${
                          safetyFilter === 'all'
                            ? 'border-slate-400 bg-slate-100 text-slate-900 shadow-sm'
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

                  <fieldset className="bg-sky-50/45 p-3.5 border border-sky-100 rounded-2xl">
                    <legend className="mb-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Flower color filter
                    </legend>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Flower color filter options">
                      <button
                        type="button"
                        aria-pressed={flowerColorFilter === 'all'}
                        onClick={() => setFlowerColorFilter('all')}
                        className={`${PILL_BASE_CLASS} ${
                          flowerColorFilter === 'all'
                            ? 'border-slate-400 bg-slate-100 text-slate-900 shadow-sm'
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
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${FLOWER_COLOR_STYLES[option].dot}`}
                            aria-hidden="true"
                          />
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </section>

              <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 mb-6">
                <p className="text-slate-500 text-xs sm:text-sm">
                  Viewing {currentPage} of {totalPages} pages
                </p>
                <nav className="flex items-center self-start sm:self-auto gap-2" aria-label="Pagination top">
                  <button
                    type="button"
                    onClick={() => pushPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex justify-center items-center gap-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 px-3.5 py-2 border border-slate-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 min-h-10 font-medium text-slate-700 text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => pushPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex justify-center items-center gap-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 px-3.5 py-2 border border-slate-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 min-h-10 font-medium text-slate-700 text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </nav>
              </div>

              {filteredPlants.length === 0 ? (
                <section className="bg-white/90 p-6 border border-slate-200 rounded-2xl text-center">
                  <p className="text-slate-600 text-sm">No plants match your current search and filter selections.</p>
                  <button
                    type="button"
                    onClick={clearRefinements}
                    className="bg-emerald-50 hover:bg-emerald-100 mt-4 px-3 py-2 border border-emerald-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-emerald-700 text-sm transition-colors cursor-pointer"
                  >
                    Reset filters
                  </button>
                </section>
              ) : (
                <>
                  <section
                    aria-label="Plant directory results"
                    className="gap-3 sm:gap-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {visiblePlants.map((plant, index) => {
                      const displaySafetyStatus = getDisplaySafetyStatus(plant);
                      const isEvidenceIncomplete = hasIncompleteEvidence(plant);
                      return (
                        <button
                          key={plant.id}
                          type="button"
                          onClick={() => router.push(`/plants/${plant.id}`)}
                          aria-label={`Open details for ${plant.common_name}`}
                          className="group flex flex-col bg-white/85 hover:bg-white shadow-sm hover:shadow-md backdrop-blur p-2.5 sm:p-3.5 border border-slate-200 hover:border-green-200 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-left active:scale-[0.97] transition-all duration-200 cursor-pointer"
                        >
                          <PlantImage
                            src={plant.primary_image_url}
                            alt={`${plant.common_name} photo`}
                            status={displaySafetyStatus}
                            width={480}
                            height={360}
                            loading={index < 8 ? 'eager' : 'lazy'}
                            fetchPriority={index < 2 ? 'high' : 'auto'}
                            sizes="(min-width: 1280px) 21vw, (min-width: 1024px) 30vw, (min-width: 640px) 48vw, 50vw"
                            className="mb-2 sm:mb-3 rounded-xl w-full aspect-[4/3]"
                            imageClassName="h-full w-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
                            placeholderTestId={`directory-placeholder-${plant.id}`}
                          />
                          <div className="min-h-10 font-semibold text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
                            {plant.common_name}
                          </div>
                          <div className="mt-0.5 text-slate-600 text-[11px] sm:text-sm italic truncate">
                            {plant.scientific_name}
                          </div>
                          {isEvidenceIncomplete ? (
                            <div className="mt-1.5 text-amber-700 text-[11px] sm:text-xs">Evidence incomplete</div>
                          ) : null}
                          <SafetyBadge status={displaySafetyStatus} className="self-start mt-2.5" compact />
                        </button>
                      );
                    })}
                  </section>

                  <nav
                    className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-white/90 backdrop-blur mt-8 p-3 border border-slate-200 rounded-2xl"
                    aria-label="Pagination footer"
                  >
                    <button
                      type="button"
                      onClick={() => pushPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="inline-flex justify-center items-center gap-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 px-4 py-2 border border-slate-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 min-h-10 font-medium text-slate-700 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Previous</span>
                    </button>
                    <p className="font-medium text-slate-600 text-sm text-center">
                      Viewing {currentPage} of {totalPages} pages
                    </p>
                    <button
                      type="button"
                      onClick={() => pushPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="inline-flex justify-center items-center gap-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 px-4 py-2 border border-slate-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 min-h-10 font-medium text-slate-700 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </nav>
                </>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
