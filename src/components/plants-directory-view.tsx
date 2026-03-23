'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, ArrowRight, ArrowUp, Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import type { FlowerColor, Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';
import { buildPlantDetailHref } from '@/src/lib/plant-detail-navigation';
import { SiteFooter } from '@/src/components/ui/site-footer';
import { SiteHeader } from '@/src/components/ui/site-header';
import { SafetyBadge } from '@/src/components/ui/safety-badge';
import { PlantImage } from '@/src/components/ui/plant-image';
import { Skeleton, SkeletonCard } from '@/src/components/ui/skeleton';

const PAGE_SIZE = 20;
type SafetyFilter = 'all' | 'safe_only' | 'toxic_only';
const FLOWER_COLOR_OPTIONS: FlowerColor[] = ['white', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'green'];
const DIRECTORY_PLANT_NAME_COLLATOR = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
});
const PILL_BASE_CLASS =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97] sm:px-3.5 sm:text-sm';
const PILL_INACTIVE_CLASS = 'border-stone-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60';
const PAGINATION_BUTTON_CLASS =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50';
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

function comparePlantsForDirectory(a: Plant, b: Plant): number {
  const commonNameCompare = DIRECTORY_PLANT_NAME_COLLATOR.compare(a.common_name, b.common_name);
  if (commonNameCompare !== 0) {
    return commonNameCompare;
  }

  const scientificNameCompare = DIRECTORY_PLANT_NAME_COLLATOR.compare(a.scientific_name, b.scientific_name);
  if (scientificNameCompare !== 0) {
    return scientificNameCompare;
  }

  return DIRECTORY_PLANT_NAME_COLLATOR.compare(a.id, b.id);
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
  const [isPhoneViewport, setIsPhoneViewport] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);

  const searchSectionRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const stickyInputRef = useRef<HTMLInputElement>(null);

  const requestedPage = parsePageParam(searchParams.get('page'));
  const searchParamsString = searchParams.toString();
  const committedQuery = searchParams.get('q')?.trim() ?? '';
  const [searchInput, setSearchInput] = useState(committedQuery);
  const deferredSearchInput = useDeferredValue(searchInput);
  const activeSearchQuery = deferredSearchInput.trim();
  const normalizedDeferredQuery = activeSearchQuery.toLowerCase();
  const previousCommittedQueryRef = useRef(committedQuery);

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

  useEffect(() => {
    function handleResize() {
      setIsPhoneViewport(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sticky search bar: observe when the main search section scrolls out of view
  useEffect(() => {
    const node = searchSectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSearchSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading, error, plants.length]);

  // Auto-scroll to results area when mobile user types a search query
  useEffect(() => {
    if (!isPhoneViewport || activeSearchQuery.length === 0) return;

    const target = resultsRef.current;
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }, [activeSearchQuery, isPhoneViewport]);

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
    if (!isPhoneViewport) {
      setIsMobileFiltersOpen(false);
    }
  }, [isPhoneViewport]);

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
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [committedQuery, pushWithUpdatedParams, searchInput]);

  const clearRefinements = useCallback(() => {
    setSafetyFilter('all');
    setFlowerColorFilter('all');
    setSearchInput('');
    setIsMobileFiltersOpen(false);

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
        normalizedDeferredQuery.length === 0
          ? true
          : plant.common_name.toLowerCase().includes(normalizedDeferredQuery) ||
            plant.scientific_name.toLowerCase().includes(normalizedDeferredQuery) ||
            plant.aka_names.some((alias) => alias.toLowerCase().includes(normalizedDeferredQuery));
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
  }, [flowerColorFilter, normalizedDeferredQuery, plants, safetyFilter]);

  const sortedFilteredPlants = useMemo(
    () => [...filteredPlants].sort(comparePlantsForDirectory),
    [filteredPlants]
  );

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedFilteredPlants.length / PAGE_SIZE)), [sortedFilteredPlants.length]);
  const currentPage = useMemo(() => Math.min(requestedPage, totalPages), [requestedPage, totalPages]);

  const visiblePlants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedFilteredPlants.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedFilteredPlants]);
  const hasActiveFilters = safetyFilter !== 'all' || flowerColorFilter !== 'all' || activeSearchQuery.length > 0;
  const activeRefinements = useMemo(() => {
    const refinements: Array<{ label: string; tone: string; capitalize?: boolean }> = [];

    if (activeSearchQuery.length > 0) {
      refinements.push({
        label: `Search: "${activeSearchQuery}"`,
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      });
    }

    if (safetyFilter === 'safe_only') {
      refinements.push({
        label: 'Safe only',
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      });
    }

    if (safetyFilter === 'toxic_only') {
      refinements.push({
        label: 'Toxic only',
        tone: 'border-rose-200 bg-rose-50 text-rose-900',
      });
    }

    if (flowerColorFilter !== 'all') {
      refinements.push({
        label: `Flower: ${flowerColorFilter}`,
        tone: 'border-sky-200 bg-sky-50 text-sky-900',
        capitalize: true,
      });
    }

    return refinements;
  }, [activeSearchQuery, flowerColorFilter, safetyFilter]);

  useEffect(() => {
    if (!isPhoneViewport) {
      previousCommittedQueryRef.current = committedQuery;
      return;
    }

    if (previousCommittedQueryRef.current === committedQuery) {
      return;
    }

    previousCommittedQueryRef.current = committedQuery;
    setIsMobileFiltersOpen(false);
  }, [committedQuery, isPhoneViewport]);

  function pushPage(nextPage: number) {
    pushWithUpdatedParams((params) => {
      if (nextPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(nextPage));
      }
    });
  }

  const resultCountLabel = `${filteredPlants.length} plant${filteredPlants.length === 1 ? '' : 's'}`;
  const resultsStatusLabel =
    activeSearchQuery.length > 0 ? `${resultCountLabel} matching "${activeSearchQuery}"` : resultCountLabel;
  const currentDirectoryUrl = searchParamsString.length > 0 ? `${pathname}?${searchParamsString}` : pathname;
  const gridRemainder = visiblePlants.length % 3;
  const showRemainderCard = filteredPlants.length > 0 && visiblePlants.length > 6 && gridRemainder !== 0;
  const activeRefinementCount = activeRefinements.length;

  const filterControls = (
    <div className="grid gap-4 lg:grid-cols-2">
      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Safety</legend>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Safety filter options">
          <button
            type="button"
            aria-pressed={safetyFilter === 'all'}
            onClick={() => setSafetyFilter('all')}
            className={`${PILL_BASE_CLASS} ${
              safetyFilter === 'all' ? 'border-stone-400 bg-stone-100 text-slate-900 shadow-sm' : PILL_INACTIVE_CLASS
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

      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          Flower color
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Flower color filter options">
          <button
            type="button"
            aria-pressed={flowerColorFilter === 'all'}
            onClick={() => setFlowerColorFilter('all')}
            className={`${PILL_BASE_CLASS} ${
              flowerColorFilter === 'all'
                ? 'border-stone-400 bg-stone-100 text-slate-900 shadow-sm'
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
    </div>
  );

  const refinementSummary = hasActiveFilters ? (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-200/80 pt-4">
      {activeRefinements.map((refinement) => (
        <span
          key={refinement.label}
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
            refinement.tone
          } ${refinement.capitalize ? 'capitalize' : ''}`}
        >
          {refinement.label}
        </span>
      ))}
      <button
        type="button"
        onClick={clearRefinements}
        className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        Clear all
      </button>
    </div>
  ) : null;

  return (
    <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/86 via-stone-100/70 to-stone-100/96" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/28 via-transparent to-amber-100/32" aria-hidden="true" />
      <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-amber-100/45 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader
          pathname={pathname}
          onGoHome={() => router.push('/')}
          onGoDirectory={() => router.push('/plants')}
          activeNav="directory"
        />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-9">
          <header className="mb-4 grid gap-4 sm:mb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="editorial-kicker hidden text-[11px] font-semibold text-emerald-700 sm:block">Curated for cat safety</p>
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:mt-2 sm:text-5xl">
                Plant directory
              </h1>
              <p className="mt-1 hidden max-w-2xl text-sm leading-relaxed text-slate-700 sm:mt-2 sm:block sm:text-base">
                Browse the catalog, filter by risk and flower color, and move from search to confident decisions without guesswork.
              </p>
            </div>
            {!isLoading && !error && plants.length > 0 ? (
              <div className="botanical-card hidden w-full max-w-sm rounded-[1.6rem] p-4 sm:block lg:ml-auto">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Catalog snapshot</p>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div>
                    <p className="font-display text-2xl font-semibold text-slate-950">{plants.length}</p>
                    <p className="text-xs text-slate-600">reviewed plants</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold text-slate-950">{filteredPlants.length}</p>
                    <p className="text-xs text-slate-600">matching now</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold text-slate-950">{totalPages}</p>
                    <p className="text-xs text-slate-600">result pages</p>
                  </div>
                </div>
              </div>
            ) : null}
          </header>

          {isLoading ? (
            <>
              {/* Skeleton search bar area */}
              <section className="botanical-card-strong mb-4 rounded-[1.9rem] px-4 py-3 sm:px-5 sm:py-3.5 animate-fade-up-soft">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)] lg:items-start">
                  <div className="max-w-3xl">
                    <Skeleton className="h-3 w-28 rounded-lg" />
                    <Skeleton className="mt-3 h-8 w-64 rounded-xl" />
                    <Skeleton className="mt-3 h-4 w-full max-w-md rounded-lg" />
                    <Skeleton className="mt-4 h-12 w-full rounded-[1.5rem]" />
                  </div>
                  <div className="rounded-[1.5rem] border border-stone-200/90 bg-white/70 p-4">
                    <Skeleton className="h-3 w-24 rounded-lg" />
                    <Skeleton className="mt-3 h-4 w-full rounded-lg" />
                    <Skeleton className="mt-1.5 h-4 w-3/4 rounded-lg" />
                  </div>
                </div>
                <div className="mt-4 border-t border-stone-200/80 pt-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <Skeleton className="mb-2 h-3 w-16 rounded-lg" />
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={`saf-skel-${i}`} className="h-10 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Skeleton className="mb-2 h-3 w-24 rounded-lg" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={`clr-skel-${i}`} className="h-10 w-20 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Skeleton result count */}
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="mt-1.5 h-3 w-56 rounded-lg" />
                </div>
              </div>

              {/* Skeleton card grid */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={`dir-skel-${i}`} />
                ))}
              </section>
            </>
          ) : error ? (
            <section className="flex flex-1 items-start justify-center pt-10">
              <div role="alert" className="botanical-card-strong w-full max-w-md rounded-3xl border border-rose-200 p-6 text-center animate-scale-in">
                <div className="inline-flex items-center gap-2 text-sm text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => void fetchPlants()}
                  className="mx-auto mt-4 block cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                  Retry
                </button>
              </div>
            </section>
          ) : plants.length === 0 ? (
            <section className="flex flex-1 items-start justify-center pt-10">
              <div className="botanical-card w-full max-w-md rounded-3xl p-6 text-center animate-scale-in">
                <p className="text-sm text-slate-600">No plants available in the directory yet.</p>
              </div>
            </section>
          ) : null}

          {!isLoading && !error && plants.length > 0 ? (
            <>
              <section ref={searchSectionRef} className="botanical-card-strong mb-4 rounded-[1.9rem] px-4 py-3 sm:px-5 sm:py-3.5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)] lg:items-start">
                  <div className="max-w-3xl">
                    <p className="editorial-kicker hidden text-[11px] font-semibold text-emerald-700 sm:block">Search plants</p>
                    <h2 className="font-display hidden text-2xl font-semibold tracking-tight text-slate-950 sm:mt-2 sm:block sm:text-3xl">
                      Find a match fast
                    </h2>
                    <p id="directory-search-hint" className="hidden text-xs text-slate-600 sm:mt-2 sm:block sm:text-sm">
                      Search by common name, scientific name, or alias, then refine only when you need a narrower result set.
                    </p>
                    <div className="relative sm:mt-4">
                      <Search
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        id="directory-search"
                        type="search"
                        aria-label="Search plant directory"
                        aria-describedby="directory-search-hint"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onFocus={() => {
                          if (isPhoneViewport) {
                            setIsMobileFiltersOpen(false);
                          }
                        }}
                        placeholder="Search plants..."
                        enterKeyHint="search"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className="min-h-12 w-full rounded-[1.5rem] border border-stone-200 bg-white px-4 pl-11 text-base text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                      />
                    </div>
                  </div>

                  {/* Current view card — desktop only */}
                  <div className="hidden rounded-[1.5rem] border border-stone-200/90 bg-white/70 p-4 sm:block">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Current view</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {hasActiveFilters
                        ? `${activeRefinementCount} active refinement${activeRefinementCount === 1 ? '' : 's'} shaping the results.`
                        : 'Showing the full reviewed catalog with no active refinements.'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t border-stone-200/80 pt-3 sm:mt-4 sm:pt-4">
                  {isPhoneViewport ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        {hasActiveFilters ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {activeRefinements.map((refinement) => (
                              <span
                                key={refinement.label}
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${refinement.tone} ${refinement.capitalize ? 'capitalize' : ''}`}
                              >
                                {refinement.label}
                              </span>
                            ))}
                            <button
                              type="button"
                              onClick={clearRefinements}
                              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-stone-50"
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">No filters active</p>
                        )}
                        <button
                          type="button"
                          aria-expanded={isMobileFiltersOpen}
                          aria-controls="directory-mobile-filters"
                          onClick={() => setIsMobileFiltersOpen((current) => !current)}
                          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 transition-colors duration-200 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                          {activeRefinementCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                              {activeRefinementCount}
                            </span>
                          )}
                          <span className="sr-only">{isMobileFiltersOpen ? 'Hide filters' : 'Show filters'}</span>
                        </button>
                      </div>

                      {isMobileFiltersOpen ? (
                        <div id="directory-mobile-filters" className="mt-3 animate-fade-up-soft">
                          {filterControls}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {filterControls}
                      {refinementSummary}
                    </>
                  )}
                </div>
              </section>

              <div ref={resultsRef} className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{resultsStatusLabel}</p>
                  <p className="text-xs text-slate-500">Tap a card for evidence, symptoms, and safe alternatives.</p>
                </div>
                {totalPages > 1 ? (
                  <p className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>
                ) : null}
              </div>

              {filteredPlants.length === 0 ? (
                <section className="botanical-card rounded-[1.7rem] p-6 text-center">
                  <p className="text-sm text-slate-600">No plants match your current search and filter selections.</p>
                  <button
                    type="button"
                    onClick={clearRefinements}
                    className="mt-4 cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    Reset filters
                  </button>
                </section>
              ) : (
                <>
                  <section aria-label="Plant directory results" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
                    {visiblePlants.map((plant, index) => {
                      const displaySafetyStatus = getDisplaySafetyStatus(plant);
                      const isEvidenceIncomplete = hasIncompleteEvidence(plant);
                      return (
                        <button
                          key={plant.id}
                          type="button"
                          onClick={() => {
                            setNavigatingId(plant.id);
                            router.push(buildPlantDetailHref(plant.id, currentDirectoryUrl));
                          }}
                          aria-label={`Open details for ${plant.common_name}`}
                          className="group relative botanical-card-strong flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.6rem] p-3 text-left transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97] animate-fade-up-stagger motion-reduce:animate-none"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {navigatingId === plant.id && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[1.6rem]">
                              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                            </div>
                          )}
                          <PlantImage
                            src={plant.primary_image_url}
                            alt={`${plant.common_name} photo`}
                            status={displaySafetyStatus}
                            width={480}
                            height={360}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            fetchPriority={index < 2 ? 'high' : 'auto'}
                            priority={index < 2}
                            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 94vw"
                            className="mb-3 aspect-[4/3] w-full rounded-[1.2rem]"
                            imageClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            placeholderTestId={`directory-placeholder-${plant.id}`}
                          />
                          <div className="flex flex-1 flex-col px-1 pb-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-base font-semibold leading-tight tracking-tight text-slate-900 sm:text-lg">
                                  {plant.common_name}
                                </div>
                                <div className="mt-1 truncate text-xs italic text-slate-600 sm:text-sm">
                                  {plant.scientific_name}
                                </div>
                              </div>
                              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <SafetyBadge status={displaySafetyStatus} compact />
                              {isEvidenceIncomplete ? (
                                <span className="text-[11px] font-medium text-amber-700 sm:text-xs">Evidence incomplete</span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {showRemainderCard ? (
                      <article
                        data-testid="directory-remainder-card"
                        className={`hidden h-full flex-col justify-center items-center text-center rounded-[1.6rem] p-8 bg-emerald-50/50 border-2 border-dashed border-emerald-200/60 shadow-inner xl:flex ${
                          gridRemainder === 1 ? 'xl:col-span-2' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <p className="editorial-kicker text-xs font-bold text-emerald-800 tracking-widest uppercase">
                            {hasActiveFilters ? 'Want broader results?' : 'Need a specific plant?'}
                          </p>
                          <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-900/80">
                            {hasActiveFilters
                              ? 'Clear the current search or filters to reopen the full catalog.'
                              : "Can't find what you're looking for? Let us know what we should add next."}
                          </p>
                        </div>
                        <div className="mt-5">
                          {hasActiveFilters ? (
                            <button
                              type="button"
                              onClick={clearRefinements}
                              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 shadow-sm"
                            >
                              Clear all filters
                            </button>
                          ) : (
                            <a
                              href="mailto:robertxluo@gmail.com?subject=CatSafe Plants - Plant Request"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors group"
                            >
                              Request a plant 
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                          )}
                        </div>
                      </article>
                    ) : null}
                  </section>

                  {totalPages > 1 ? (
                    <nav className="botanical-card mt-8 rounded-[1.7rem] p-4" aria-label="Pagination footer">
                      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => pushPage(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className={PAGINATION_BUTTON_CLASS}
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          <span>Previous</span>
                        </button>
                        <p className="text-center text-sm font-medium text-slate-700">
                          Page {currentPage} of {totalPages}
                        </p>
                        <button
                          type="button"
                          onClick={() => pushPage(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className={PAGINATION_BUTTON_CLASS}
                        >
                          <span>Next</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </nav>
                  ) : null}
                </>
              )}
            </>
          ) : null}
        </main>
        <SiteFooter />

        {/* Sticky mobile search bar */}
        {isPhoneViewport && (
          <div
            className={`fixed left-0 right-0 top-0 z-40 border-b border-stone-200/80 bg-(--catsafe-tone-bg)/95 px-4 py-2.5 shadow-md backdrop-blur-lg transition-all duration-300 ${
              isSearchSticky ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
            }`}
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                ref={stickyInputRef}
                type="search"
                aria-label="Search plant directory"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search plants..."
                enterKeyHint="search"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="min-h-11 w-full rounded-full border border-stone-200 bg-white pl-10 pr-10 text-[15px] text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              />
              {searchInput.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    stickyInputRef.current?.focus();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scroll to top button */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-slate-600 shadow-lg backdrop-blur transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${showScrollTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
