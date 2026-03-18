'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react';
import { Search, Leaf, ShieldCheck, LoaderCircle, AlertCircle, ArrowRight, Stethoscope, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';
import { SiteHeader } from '@/src/components/ui/site-header';
import { SafetyBadge } from '@/src/components/ui/safety-badge';
import { PlantImage } from '@/src/components/ui/plant-image';
import { SkeletonPopularCard } from '@/src/components/ui/skeleton';

interface HomeViewProps {
  onSelectPlant: (id: string) => void;
}

const POPULAR_PLANT_ORDER = ['Parlor Palm', 'Spider Plant', 'Boston Fern', 'Prayer Plant'] as const;

export function HomeView({ onSelectPlant }: HomeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const listboxId = 'home-search-results-listbox';

  const [plants, setPlants] = useState<Plant[]>([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isPhoneViewport, setIsPhoneViewport] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered: Plant[] = useMemo(() => {
    if (query.trim().length === 0) {
      return [];
    }
    const q = query.toLowerCase();
    return plants.filter((p) => {
      return (
        p.common_name.toLowerCase().includes(q) ||
        p.scientific_name.toLowerCase().includes(q) ||
        p.aka_names.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [plants, query]);

  const quickSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const suggestions: string[] = [];

    for (const plant of plants) {
      const normalized = plant.common_name.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      suggestions.push(plant.common_name);
      if (suggestions.length === 5) {
        break;
      }
    }

    return suggestions;
  }, [plants]);

  const popularPlants = useMemo(() => {
    const selected = POPULAR_PLANT_ORDER.map((name) =>
      plants.find((plant) => plant.common_name.toLowerCase() === name.toLowerCase())
    ).filter((plant): plant is Plant => Boolean(plant));

    if (selected.length === POPULAR_PLANT_ORDER.length) {
      return selected;
    }

    const selectedIds = new Set(selected.map((plant) => plant.id));
    const fallbacks = plants
      .filter((plant) => !selectedIds.has(plant.id))
      .slice(0, POPULAR_PLANT_ORDER.length - selected.length);
    return [...selected, ...fallbacks];
  }, [plants]);

  const fetchPlants = useCallback(async () => {
    try {
      setIsDataLoading(true);
      setError(null);
      const loadedPlants = await loadPlants();
      setPlants(loadedPlants);
    } catch (err) {
      setPlants([]);
      setError(err instanceof Error ? err.message : 'Unable to load plant data. Please try again.');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlants();
  }, [fetchPlants]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsPhoneViewport(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen || query.trim().length === 0 || isDataLoading || error) {
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    const timer = window.setTimeout(() => {
      setIsSearchLoading(false);
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [error, isDataLoading, isOpen, query]);

  useEffect(() => {
    if (!isOpen || query.trim().length === 0 || filtered.length === 0 || isDataLoading || error || isSearchLoading) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((current) => {
      if (current >= filtered.length) {
        return filtered.length - 1;
      }
      return current;
    });
  }, [error, filtered.length, isDataLoading, isOpen, isSearchLoading, query]);

  const isMobileSearchModeOpen = isPhoneViewport && isOpen;
  const shouldShowResults = isOpen && query.trim().length > 0;
  const isSearchPanelExpanded = isDataLoading || Boolean(error) || shouldShowResults || isMobileSearchModeOpen;
  const showInteractiveResults =
    shouldShowResults && !isSearchLoading && filtered.length > 0 && !isDataLoading && !error;
  const showQuickSuggestions =
    !isDataLoading && !error && quickSuggestions.length > 0 && (!isMobileSearchModeOpen || query.trim().length === 0);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!isMobileSearchModeOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMobileSearchModeOpen]);

  const handleSelectPlant = useCallback(
    (plant: Plant) => {
      onSelectPlant(plant.id);
      setQuery('');
      closeSearch();
    },
    [closeSearch, onSelectPlant]
  );

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        closeSearch();
        return;
      }

      if (!showInteractiveResults) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => (current < filtered.length - 1 ? current + 1 : 0));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => (current > 0 ? current - 1 : filtered.length - 1));
        return;
      }

      if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < filtered.length) {
        event.preventDefault();
        handleSelectPlant(filtered[activeIndex]);
      }
    },
    [activeIndex, closeSearch, filtered, handleSelectPlant, showInteractiveResults]
  );

  return (
    <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
      <Image
        src="/cat_landing_page.png"
        alt=""
        fill
        priority
        className="pointer-events-none object-cover object-[66%_10%] opacity-90 animate-slow-drift motion-reduce:animate-none lg:object-[84%_4%] lg:scale-[1.18] lg:-translate-y-[18%] xl:object-[82%_2%] xl:scale-[1.2] 2xl:object-[80%_2%] 2xl:scale-[1.18]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/86 via-stone-100/62 to-stone-100/96" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/35 via-stone-100/12 to-stone-100/78" aria-hidden="true" />
      <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" aria-hidden="true" />
      <div className="animate-float-bob absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-amber-100/55 blur-3xl" aria-hidden="true" />
      <p className="absolute right-0 top-36 hidden rotate-90 select-none text-[11px] font-semibold uppercase tracking-[0.52em] text-emerald-300/80 xl:block" aria-hidden="true">
        Indoor plant intelligence
      </p>

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader
          pathname={pathname}
          onGoHome={() => router.push('/')}
          onGoDirectory={() => router.push('/plants')}
          activeNav="home"
        />

        {isMobileSearchModeOpen ? (
          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="fixed inset-0 z-40 bg-slate-900/15 backdrop-blur-sm md:hidden"
          />
        ) : null}

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-11">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start sm:gap-6">
            <div className="botanical-card-strong order-2 relative overflow-hidden rounded-[2rem] p-5 animate-fade-up motion-reduce:animate-none sm:p-8">
              <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl" aria-hidden="true" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-100/90 px-3 py-1 text-[11px] font-medium text-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    Source-backed plant safety
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/82 px-3 py-1 text-[11px] font-medium text-slate-600">
                    <Sparkles className="h-3 w-3" />
                    {isDataLoading ? 'Loading catalog' : `${plants.length}+ entries reviewed`}
                  </span>
                </div>

                <p className="editorial-kicker mt-6 text-[11px] font-semibold text-emerald-800">Indoor jungle, minus the risk</p>
                <h1 className="font-display mt-3 max-w-3xl text-balance text-[3rem] font-semibold leading-[0.95] tracking-tight text-slate-950 sm:text-[4.5rem] lg:text-[5rem]">
                  Is your houseplant safe for your cat?
                </h1>
                <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-700 sm:text-xl">
                  Fast search, clear risk labels, and safer alternatives designed for real purchase decisions, surprise gifts, and everyday houseplant curiosity.
                </p>

                <div className="mt-6 grid max-w-3xl gap-2 sm:grid-cols-2">
                  <span className="inline-flex items-center justify-start gap-2 rounded-2xl border border-stone-200/90 bg-white/78 px-3 py-2 text-[11px] font-medium leading-none text-slate-700 sm:text-xs">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white">
                      <ShieldCheck className="h-3 w-3 text-emerald-700" />
                    </span>
                    Toxicity checker
                  </span>
                  <span className="inline-flex items-center justify-start gap-2 rounded-2xl border border-stone-200/90 bg-white/78 px-3 py-2 text-[11px] font-medium leading-none text-slate-700 sm:text-xs">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white">
                      <Leaf className="h-3 w-3 text-emerald-700" />
                    </span>
                    Safe alternatives
                  </span>
                  <span className="inline-flex items-center justify-start gap-2 rounded-2xl border border-stone-200/90 bg-white/78 px-3 py-2 text-[11px] font-medium leading-none text-slate-700 sm:text-xs">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white">
                      <Stethoscope className="h-3 w-3 text-emerald-700" />
                    </span>
                    Vet-sourced data
                  </span>
                  <span className="inline-flex items-center justify-start gap-2 rounded-2xl border border-stone-200/90 bg-white/78 px-3 py-2 text-[11px] font-medium leading-none text-slate-700 sm:text-xs">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white">
                      <Sparkles className="h-3 w-3 text-emerald-700" />
                    </span>
                    Calm, urgent-friendly UX
                  </span>
                </div>

                <div className="mt-7 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
                  <article className="rounded-[1.5rem] border border-emerald-200/80 bg-emerald-50/70 p-3 sm:p-3.5">
                    <p className="editorial-kicker text-[11px] font-semibold text-emerald-700">Trust</p>
                    <p className="mt-1 text-sm font-medium text-slate-800 sm:text-[15px]">Evidence required</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                      Every plant entry carries source citations.
                    </p>
                  </article>
                  <article className="rounded-[1.5rem] border border-amber-200/80 bg-amber-50/70 p-3 sm:p-3.5">
                    <p className="editorial-kicker text-[11px] font-semibold text-amber-700">Safety</p>
                    <p className="mt-1 text-sm font-medium text-slate-800 sm:text-[15px]">Unknown stays unknown</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                      Unverified records are clearly caution-labeled.
                    </p>
                  </article>
                  <article className="rounded-[1.5rem] border border-sky-200/80 bg-sky-50/70 p-3 sm:p-3.5">
                    <p className="editorial-kicker text-[11px] font-semibold text-sky-700">Speed</p>
                    <p className="mt-1 text-sm font-medium text-slate-800 sm:text-[15px]">Lookup in seconds</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                      Answers appear quickly as you type.
                    </p>
                  </article>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/plants')}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-white/88 px-6 py-3 text-sm font-medium text-emerald-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97] sm:text-base"
                  >
                    Browse all {isDataLoading ? 'plants' : `${plants.length} plants`}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Designed for real-world decisions before purchases, gifts, or new plant arrivals.
                  </p>
                </div>
              </div>
            </div>

            <section
              ref={containerRef}
              data-mobile-search-mode={isMobileSearchModeOpen ? 'open' : 'closed'}
              className={`order-1 overflow-hidden text-left ${
                isMobileSearchModeOpen
                  ? 'botanical-card-strong fixed inset-x-4 bottom-4 top-4 z-50 flex flex-col rounded-[2rem] p-4'
                  : 'botanical-card relative rounded-[2rem] p-5 animate-fade-up-soft motion-reduce:animate-none sm:p-6 lg:order-2'
              }`}
              style={{ animationDelay: '80ms' }}
            >
              <div className="absolute -left-10 -top-16 h-36 w-36 rounded-full bg-emerald-100/45 blur-2xl" aria-hidden="true" />

              <div className={`relative ${isMobileSearchModeOpen ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
                {isMobileSearchModeOpen ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="editorial-kicker text-[11px] font-semibold text-emerald-700">Quick mobile search</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">Search and scan results without leaving the page.</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeSearch}
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-stone-200 bg-white px-3 py-2 text-slate-600 transition-colors duration-200 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="editorial-kicker text-[11px] font-semibold text-emerald-700">Field lookup</p>
                    <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-slate-950">Search the catalog</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      Find a plant by common name, scientific name, or alias.
                    </p>
                  </>
                )}

                <label htmlFor="home-plant-search" className="sr-only">
                  Search plants by name
                </label>
                <div className={`relative ${isMobileSearchModeOpen ? 'mt-3' : 'mt-4'}`}>
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-500" />
                  <input
                    id="home-plant-search"
                    type="search"
                    role="combobox"
                    aria-label="Search plants by name"
                    aria-expanded={shouldShowResults}
                    aria-controls={showInteractiveResults ? listboxId : undefined}
                    aria-activedescendant={
                      showInteractiveResults && activeIndex >= 0
                        ? `home-search-option-${filtered[activeIndex]?.id}`
                        : undefined
                    }
                    placeholder="Search plant name or alias..."
                    className={`w-full rounded-[1.75rem] border py-4 pl-14 pr-5 text-base text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-500/85 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300 sm:text-xl ${
                      shouldShowResults ? 'border-stone-300 bg-white shadow-xl' : 'border-stone-200 bg-white/95 shadow-md'
                    }`}
                    enterKeyHint="search"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setIsOpen(true);
                      setActiveIndex(-1);
                    }}
                    onFocus={() => {
                      if (isPhoneViewport || query.trim().length > 0) {
                        setIsOpen(true);
                      }
                    }}
                    onKeyDown={handleSearchInputKeyDown}
                  />
                </div>

                <p className={`flex items-center gap-1.5 text-xs leading-relaxed text-slate-700 sm:text-sm ${isMobileSearchModeOpen ? 'mt-2.5' : 'mt-3'}`}>
                  <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-700" />
                  Informational only. For urgent concerns, contact your veterinarian.
                </p>

                {showQuickSuggestions ? (
                  <div className={`flex flex-wrap gap-2 ${isMobileSearchModeOpen ? 'mt-2.5' : 'mt-3'}`}>
                    {quickSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setQuery(name);
                          setIsOpen(true);
                          setActiveIndex(-1);
                        }}
                        className="inline-flex cursor-pointer items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:text-[13px]"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div
                  className={
                    isMobileSearchModeOpen
                      ? `mt-3 flex min-h-0 justify-center flex-1 overflow-hidden rounded-[1.75rem] border bg-white/95 ${
                          shouldShowResults ? 'border-stone-300 shadow-md' : 'border-stone-200'
                        }`
                      : `mt-4 overflow-hidden rounded-[1.6rem] border bg-white/95 transition-all duration-300 ease-in-out ${
                          isOpen ? (isSearchPanelExpanded ? 'h-80 opacity-100' : 'h-32 opacity-100') : 'h-0 border-none opacity-0'
                        } ${shouldShowResults ? 'border-stone-300 shadow-md' : 'border-stone-200'}`
                  }
                >
                  {isDataLoading ? (
                    <div className="flex h-full items-center justify-center gap-2 px-4 text-sm text-slate-500">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Loading plants...
                    </div>
                  ) : error ? (
                    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                      <div className="inline-flex items-center gap-2 text-sm text-rose-700">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                      <button
                        type="button"
                        onClick={() => void fetchPlants()}
                        className="mx-auto mt-3 block cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                      >
                        Retry
                      </button>
                    </div>
                  ) : shouldShowResults ? (
                    isSearchLoading ? (
                      <div className="flex h-full items-center justify-center gap-2 px-4 text-sm text-slate-500">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Searching...
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-600">
                        No plants found matching &quot;{query}&quot;
                      </div>
                    ) : (
                      <ul
                        id={listboxId}
                        role="listbox"
                        aria-label="Plant search results"
                        className="h-full overflow-y-auto overscroll-contain"
                      >
                        {filtered.map((plant, index) => {
                          const displaySafetyStatus = getDisplaySafetyStatus(plant);
                          const isEvidenceIncomplete = hasIncompleteEvidence(plant);
                          const isActiveOption = activeIndex === index;
                          return (
                            <li
                              key={plant.id}
                              id={`home-search-option-${plant.id}`}
                              role="option"
                              aria-selected={isActiveOption}
                            >
                              <button
                                type="button"
                                className={`min-h-[5.25rem] w-full cursor-pointer px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset ${
                                  isActiveOption ? 'bg-emerald-50/70' : 'hover:bg-stone-50'
                                }`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => handleSelectPlant(plant)}
                              >
                                <span className="flex items-center gap-3">
                                  <PlantImage
                                    src={plant.primary_image_url}
                                    alt={`${plant.common_name} photo`}
                                    status={displaySafetyStatus}
                                    width={40}
                                    height={40}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    className="h-10 w-10 shrink-0 rounded-lg border border-stone-200"
                                    imageClassName="h-full w-full object-cover"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium text-slate-900">
                                      {plant.common_name}
                                    </span>
                                    <span className="block truncate text-sm italic text-slate-500">
                                      {plant.scientific_name}
                                    </span>
                                    {isEvidenceIncomplete ? (
                                      <span className="mt-1 block text-xs text-amber-700">Evidence incomplete</span>
                                    ) : null}
                                  </span>
                                  <SafetyBadge status={displaySafetyStatus} />
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-8 text-center text-sm leading-relaxed text-slate-600">
                      Start typing to search by common name, scientific name, or alias.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </section>

          {!error && plants.length > 0 ? (
            <section
              className="botanical-card mt-12 rounded-[2rem] p-4 animate-fade-up-soft motion-reduce:animate-none sm:mt-14 sm:p-6"
              style={{ animationDelay: '160ms' }}
            >
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="editorial-kicker text-[11px] font-semibold text-emerald-700">Starter Picks</p>
                  <h2 className="font-display mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    Popular plants
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 sm:text-sm">Open any card to jump straight to details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/plants')}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:text-sm"
                >
                  View directory
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {isDataLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonPopularCard key={`pop-skel-${i}`} />
                    ))
                  : popularPlants.map((plant, index) => {
                      const displaySafetyStatus = getDisplaySafetyStatus(plant);
                      return (
                        <button
                          key={plant.id}
                          type="button"
                          onClick={() => onSelectPlant(plant.id)}
                          className="group flex cursor-pointer flex-col rounded-[1.4rem] border border-stone-200 bg-white/92 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97] animate-fade-up-stagger motion-reduce:animate-none"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <PlantImage
                            src={plant.primary_image_url}
                            alt={`${plant.common_name} photo`}
                            status={displaySafetyStatus}
                            width={160}
                            height={120}
                            loading={index < 4 ? 'eager' : 'lazy'}
                            fetchPriority={index < 2 ? 'high' : 'auto'}
                            priority={index < 2}
                            className="mb-3 h-24 w-full rounded-[1rem] sm:h-28"
                            imageClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <span className="truncate text-sm font-medium text-slate-900 sm:text-[15px]">
                            {plant.common_name}
                          </span>
                          <span className="mt-0.5 truncate text-[11px] italic text-slate-500 sm:text-xs">
                            {plant.scientific_name}
                          </span>
                          <SafetyBadge status={displaySafetyStatus} className="mt-2 self-start" compact />
                        </button>
                      );
                    })}
              </div>
            </section>
          ) : null}

          <footer
            className="botanical-card mx-auto mb-2 mt-10 w-full max-w-4xl rounded-[1.6rem] px-5 py-4 text-center animate-fade-up-soft motion-reduce:animate-none"
            style={{ animationDelay: '240ms' }}
          >
            <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
              Safety guidance is informational and should not replace professional veterinary advice.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 sm:text-[13px]">
              <Image src="/icon.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" aria-hidden="true" />
              For cat owners, by a cat lover.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
