'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react';
import {
  Search,
  Leaf,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Sparkles,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';
import { SiteFooter } from '@/src/components/ui/site-footer';
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
  const [isPhoneViewport, setIsPhoneViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
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
    <div className="relative min-h-screen overflow-hidden home-editorial-shell botanical-page">
      <Image
        src="/cat_landing_page.png"
        alt=""
        fill
        priority
        className="opacity-90 object-[66%_10%] object-cover lg:object-[84%_4%] 2xl:object-[80%_2%] xl:object-[82%_2%] lg:scale-[1.18] 2xl:scale-[1.18] xl:scale-[1.2] lg:-translate-y-[18%] animate-slow-drift motion-reduce:animate-none pointer-events-none"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-stone-100/86 via-stone-100/62 to-stone-100/96"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-emerald-100/35 via-stone-100/12 to-stone-100/78"
        aria-hidden="true"
      />
      <div className="-top-20 -left-16 absolute bg-emerald-100/60 blur-3xl rounded-full w-72 h-72" aria-hidden="true" />
      <div
        className="-right-16 -bottom-20 absolute bg-amber-100/55 blur-3xl rounded-full w-72 h-72 animate-float-bob"
        aria-hidden="true"
      />
      <p
        className="hidden xl:block top-36 right-0 absolute font-semibold text-[11px] text-emerald-300/80 uppercase tracking-[0.52em] rotate-90 select-none"
        aria-hidden="true"
      >
        Indoor plant intelligence
      </p>

      <div className="z-10 relative flex flex-col min-h-screen">
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
            className="md:hidden z-40 fixed inset-0 bg-slate-900/15 backdrop-blur-sm"
          />
        ) : null}

        <main className="flex flex-col flex-1 mx-auto px-4 sm:px-6 pt-7 sm:pt-11 pb-8 sm:pb-10 w-full max-w-6xl">
          <section className="lg:items-start gap-5 sm:gap-6 grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="relative order-2 p-5 sm:p-8 rounded-[2rem] overflow-hidden animate-fade-up motion-reduce:animate-none botanical-card-strong">
              <div
                className="-top-20 -right-12 absolute bg-emerald-100/60 blur-3xl rounded-full w-48 h-48"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100/90 px-3 py-1 border border-emerald-200/80 rounded-full font-medium text-[11px] text-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    Source-backed plant safety
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/82 px-3 py-1 border border-stone-200 rounded-full font-medium text-[11px] text-slate-600">
                    <Sparkles className="w-3 h-3" />
                    {isDataLoading ? 'Loading catalog' : `${plants.length}+ entries reviewed`}
                  </span>
                </div>

                <p className="mt-6 font-semibold text-[11px] text-emerald-800 editorial-kicker">
                  Plants you can trust around your cat
                </p>
                <h1 className="mt-3 max-w-3xl font-display font-semibold text-[3rem] text-slate-950 sm:text-[4.5rem] lg:text-[5rem] text-balance leading-[0.95] tracking-tight">
                  Is this plant safe for your cat?
                </h1>
                <p className="mt-4 max-w-2xl text-slate-700 text-base sm:text-xl text-pretty leading-relaxed">
                  Search any houseplant and get a clear answer: safe, toxic, or caution advised, with cat-safe
                  alternatives.
                </p>

                <div className="gap-2 grid sm:grid-cols-2 mt-6 max-w-3xl">
                  <span className="inline-flex justify-start items-center gap-2 bg-white/78 px-3 py-2 border border-stone-200/90 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-stone-200 rounded-full w-5 h-5 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    </span>
                    Toxicity checker
                  </span>
                  <span className="inline-flex justify-start items-center gap-2 bg-white/78 px-3 py-2 border border-stone-200/90 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-stone-200 rounded-full w-5 h-5 shrink-0">
                      <Leaf className="w-3 h-3 text-emerald-700" />
                    </span>
                    Safe alternatives
                  </span>
                  <span className="inline-flex justify-start items-center gap-2 bg-white/78 px-3 py-2 border border-stone-200/90 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-stone-200 rounded-full w-5 h-5 shrink-0">
                      <Stethoscope className="w-3 h-3 text-emerald-700" />
                    </span>
                    Vet-sourced data
                  </span>
                  <span className="inline-flex justify-start items-center gap-2 bg-white/78 px-3 py-2 border border-stone-200/90 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-stone-200 rounded-full w-5 h-5 shrink-0">
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                    </span>
                    Instant peace of mind
                  </span>
                </div>

                <div className="gap-2.5 sm:gap-3 grid sm:grid-cols-3 mt-7">
                  <article className="bg-emerald-50/70 p-3 sm:p-3.5 border border-emerald-200/80 rounded-[1.5rem]">
                    <p className="font-semibold text-[11px] text-emerald-700 editorial-kicker">Trust</p>
                    <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Every plant is cited</p>
                    <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                      Backed by ASPCA guidance, veterinary databases, and published references.
                    </p>
                  </article>
                  <article className="bg-amber-50/70 p-3 sm:p-3.5 border border-amber-200/80 rounded-[1.5rem]">
                    <p className="font-semibold text-[11px] text-amber-700 editorial-kicker">Safety</p>
                    <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">
                      If we&apos;re unsure, we&apos;ll say so
                    </p>
                    <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                      Uncertain plants are clearly marked, with no false &quot;safe&quot; labels.
                    </p>
                  </article>
                  <article className="bg-sky-50/70 p-3 sm:p-3.5 border border-sky-200/80 rounded-[1.5rem]">
                    <p className="font-semibold text-[11px] text-sky-700 editorial-kicker">Speed</p>
                    <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Lookup in seconds</p>
                    <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                      Results appear as you type.
                    </p>
                  </article>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => router.push('/plants')}
                    className="inline-flex items-center gap-2 bg-white/88 hover:bg-emerald-50 hover:shadow-md px-6 py-3 border border-emerald-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 font-medium text-emerald-900 text-sm sm:text-base active:scale-[0.97] transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
                  >
                    Browse all {isDataLoading ? 'plants' : `${plants.length} plants`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="max-w-md text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Before you buy, gift, or bring a new plant home.
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
              <div
                className="-top-16 -left-10 absolute bg-emerald-100/45 blur-2xl rounded-full w-36 h-36"
                aria-hidden="true"
              />

              <div className={`relative ${isMobileSearchModeOpen ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
                {isMobileSearchModeOpen ? (
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <p className="font-semibold text-[11px] text-emerald-700 editorial-kicker">Quick mobile search</p>
                      <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                        Search and scan results without leaving the page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeSearch}
                      className="inline-flex justify-center items-center bg-white hover:bg-stone-50 px-3 py-2 border border-stone-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 min-h-10 text-slate-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-[11px] text-emerald-700 editorial-kicker">Field lookup</p>
                    <h2 className="mt-2 font-display font-semibold text-slate-950 text-3xl tracking-tight">
                      Search the catalog
                    </h2>
                    <p className="mt-1 text-slate-600 sm:text-[15px] text-sm leading-relaxed">
                      Find a plant by common name, scientific name, or alias.
                    </p>
                  </>
                )}

                <label htmlFor="home-plant-search" className="sr-only">
                  Search plants by name
                </label>
                <div className={`relative ${isMobileSearchModeOpen ? 'mt-3' : 'mt-4'}`}>
                  <Search className="top-1/2 left-5 absolute w-6 h-6 text-slate-500 -translate-y-1/2 pointer-events-none" />
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
                      shouldShowResults
                        ? 'border-stone-300 bg-white shadow-xl'
                        : 'border-stone-200 bg-white/95 shadow-md'
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

                <p
                  className={`flex items-center gap-1.5 text-xs leading-relaxed text-slate-700 sm:text-sm ${isMobileSearchModeOpen ? 'mt-2.5' : 'mt-3'}`}
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
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
                        className="inline-flex items-center bg-white hover:bg-emerald-50 px-3 py-1.5 border border-stone-200 hover:border-emerald-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-slate-700 sm:text-[13px] hover:text-emerald-800 text-xs transition-colors duration-200 cursor-pointer"
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
                          isOpen
                            ? isSearchPanelExpanded
                              ? 'h-80 opacity-100'
                              : 'h-32 opacity-100'
                            : 'h-0 border-none opacity-0'
                        } ${shouldShowResults ? 'border-stone-300 shadow-md' : 'border-stone-200'}`
                  }
                >
                  {isDataLoading ? (
                    <div className="flex justify-center items-center gap-2 px-4 h-full text-slate-500 text-sm">
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Loading plants...
                    </div>
                  ) : error ? (
                    <div className="flex flex-col justify-center items-center px-4 h-full text-center">
                      <div className="inline-flex items-center gap-2 text-rose-700 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                      <button
                        type="button"
                        onClick={() => void fetchPlants()}
                        className="block bg-rose-50 hover:bg-rose-100 mx-auto mt-3 px-3 py-2 border border-rose-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 text-rose-700 text-xs transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : shouldShowResults ? (
                    isSearchLoading ? (
                      <div className="flex justify-center items-center gap-2 px-4 h-full text-slate-500 text-sm">
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="flex justify-center items-center px-4 h-full text-slate-600 text-sm text-center">
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
                                    className="border border-stone-200 rounded-lg w-10 h-10 shrink-0"
                                    imageClassName="h-full w-full object-cover"
                                  />
                                  <span className="flex-1 min-w-0">
                                    <span className="block font-medium text-slate-900 truncate">
                                      {plant.common_name}
                                    </span>
                                    <span className="block text-slate-500 text-sm truncate italic">
                                      {plant.scientific_name}
                                    </span>
                                    {isEvidenceIncomplete ? (
                                      <span className="block mt-1 text-amber-700 text-xs">Evidence incomplete</span>
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
                    <div className="flex flex-col justify-center items-center px-8 h-full text-slate-600 text-sm text-center leading-relaxed">
                      Start typing to search by common name, scientific name, or alias.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </section>

          {!error && plants.length > 0 ? (
            <section
              className="mt-12 sm:mt-14 p-4 sm:p-6 rounded-[2rem] animate-fade-up-soft motion-reduce:animate-none botanical-card"
              style={{ animationDelay: '160ms' }}
            >
              <div className="flex justify-between items-end gap-3 mb-4">
                <div>
                  <p className="font-semibold text-[11px] text-emerald-700 editorial-kicker">Starter Picks</p>
                  <h2 className="mt-1 font-display font-semibold text-slate-900 text-xl sm:text-2xl tracking-tight">
                    Popular plants
                  </h2>
                  <p className="mt-1 text-slate-600 text-xs sm:text-sm">Open any card to jump straight to details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/plants')}
                  className="inline-flex items-center gap-1 bg-white hover:bg-emerald-50 px-3 py-1.5 border border-stone-200 hover:border-emerald-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 font-medium text-slate-700 hover:text-emerald-800 text-xs sm:text-sm transition-colors duration-200 cursor-pointer"
                >
                  View directory
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="gap-3 sm:gap-4 grid grid-cols-2 lg:grid-cols-4">
                {isDataLoading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonPopularCard key={`pop-skel-${i}`} />)
                  : popularPlants.map((plant, index) => {
                      const displaySafetyStatus = getDisplaySafetyStatus(plant);
                      return (
                        <button
                          key={plant.id}
                          type="button"
                          onClick={() => onSelectPlant(plant.id)}
                          className="group flex flex-col bg-white/92 hover:bg-white hover:shadow-lg p-3 border border-stone-200 hover:border-emerald-200 rounded-[1.4rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-left active:scale-[0.97] transition-all hover:-translate-y-0.5 animate-fade-up-stagger motion-reduce:animate-none duration-200 cursor-pointer"
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
                            className="mb-3 rounded-[1rem] w-full h-24 sm:h-28"
                            imageClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <span className="font-medium text-slate-900 sm:text-[15px] text-sm truncate">
                            {plant.common_name}
                          </span>
                          <span className="mt-0.5 text-[11px] text-slate-500 sm:text-xs truncate italic">
                            {plant.scientific_name}
                          </span>
                          <SafetyBadge status={displaySafetyStatus} className="self-start mt-2" compact />
                        </button>
                      );
                    })}
              </div>
            </section>
          ) : null}

        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
