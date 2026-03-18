'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react';
import { Search, Leaf, LoaderCircle, AlertCircle, ArrowRight, Stethoscope, Sparkles, X } from 'lucide-react';
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
        className="opacity-[0.6] object-[66%_10%] object-cover lg:object-[84%_4%] 2xl:object-[80%_2%] xl:object-[82%_2%] lg:scale-[1.18] 2xl:scale-[1.18] xl:scale-[1.2] lg:-translate-y-[18%] animate-slow-drift motion-reduce:animate-none pointer-events-none mix-blend-multiply"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
        }}
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

        <main className="flex flex-col flex-1 items-center mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-10 w-full max-w-4xl text-center">
          <div className="relative w-full animate-fade-up motion-reduce:animate-none">
            <h1 className="mx-auto max-w-3xl font-display font-semibold text-[3rem] text-slate-950 sm:text-[4.5rem] lg:text-[5.25rem] text-balance leading-[0.9] tracking-tighter">
              Is this plant safe for your cat?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-light text-slate-600 sm:text-[1.35rem] text-base text-balance leading-relaxed">
              Search any houseplant and get a clear answer: safe, toxic, or caution advised, backed by veterinary
              guidance.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-4 mt-8">
              <span className="inline-flex items-center gap-2 bg-white/95 shadow-sm backdrop-blur-sm px-4 py-1.5 border border-stone-200/80 rounded-full font-medium text-[12px] text-slate-900 sm:text-[13px]">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {isDataLoading ? 'Loading catalog' : `50+ plants reviewed`}
              </span>
              <span className="inline-flex items-center gap-2 bg-white/95 shadow-sm backdrop-blur-sm px-4 py-1.5 border border-stone-200/80 rounded-full font-medium text-[12px] text-slate-900 sm:text-[13px]">
                <Stethoscope className="w-4 h-4 text-emerald-600" /> Vet-sourced
              </span>
              <span className="inline-flex items-center gap-2 bg-white/95 shadow-sm backdrop-blur-sm px-4 py-1.5 border border-stone-200/80 rounded-full font-medium text-[12px] text-slate-900 sm:text-[13px]">
                <Leaf className="w-4 h-4 text-emerald-600" /> Safe alternatives
              </span>
              <span className="inline-flex items-center gap-2 bg-white/95 shadow-sm backdrop-blur-sm px-4 py-1.5 border border-stone-200/80 rounded-full font-medium text-[12px] text-slate-900 sm:text-[13px]">
                <Search className="w-4 h-4 text-emerald-600" /> Instant search
              </span>
            </div>
          </div>

          <section
            ref={containerRef}
            data-mobile-search-mode={isMobileSearchModeOpen ? 'open' : 'closed'}
            className={`w-full max-w-2xl mt-4 sm:mt-8 animate-fade-up-soft motion-reduce:animate-none ${
              isMobileSearchModeOpen
                ? 'botanical-card-strong bg-stone-50/98 backdrop-blur-xl fixed inset-0 sm:inset-x-4 sm:bottom-4 sm:top-8 z-50 flex flex-col rounded-none sm:rounded-[2.5rem] px-4 pt-10 pb-4 sm:p-5 text-left shadow-2xl'
                : 'text-left relative z-20 px-2 sm:px-0'
            }`}
            style={{ animationDelay: '80ms' }}
          >
            <div className={`relative ${isMobileSearchModeOpen ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
              {isMobileSearchModeOpen ? (
                <div className="flex justify-between items-center gap-3 shrink-0">
                  <div>
                    <p className="font-semibold text-[11px] text-emerald-700 editorial-kicker">Quick mobile search</p>
                    <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                      Search and scan results instantly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="inline-flex justify-center items-center bg-white hover:bg-stone-50 p-2 sm:px-3 sm:py-2 border border-stone-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 min-h-10 min-w-10 text-slate-600 transition-colors duration-200 shrink-0"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              ) : null}

              <label htmlFor="home-plant-search" className="sr-only">
                Search plants by name
              </label>
              <div className={`relative group ${isMobileSearchModeOpen ? 'mt-4 shrink-0' : ''}`}>
                <Search className="top-1/2 left-5 sm:left-6 absolute w-6 h-6 sm:w-8 sm:h-8 text-emerald-800/80 group-hover:text-emerald-800 transition-colors -translate-y-1/2 pointer-events-none" />
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
                  className={`w-full rounded-[2rem] sm:rounded-[2.5rem] border py-4 sm:py-7 pl-14 sm:pl-16 pr-6 sm:pr-8 text-lg sm:text-[1.35rem] md:text-2xl text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-500/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/20 shadow-xl shadow-emerald-900/5 hover:shadow-2xl hover:shadow-emerald-900/10 ${
                    shouldShowResults || isOpen
                      ? 'border-emerald-400 bg-white shadow-2xl'
                      : 'border-stone-300 bg-white/98 hover:border-emerald-400 hover:bg-white'
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

              {showQuickSuggestions ? (
                <div
                  className={`flex items-center justify-center flex-wrap gap-2 sm:gap-3 shrink-0 ${isMobileSearchModeOpen ? 'mt-4' : 'mt-4 sm:mt-5'}`}
                >
                  <span className="hidden sm:inline-block mr-1 font-medium text-[10px] text-slate-500 uppercase tracking-widest">
                    Try:
                  </span>
                  {quickSuggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setQuery(name);
                        setIsOpen(true);
                        setActiveIndex(-1);
                      }}
                      className="inline-flex items-center bg-white/95 hover:bg-white shadow-sm hover:shadow-md px-3 sm:px-4 py-1.5 border border-stone-200 hover:border-emerald-300 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-slate-800 font-medium text-[13px] sm:text-[14px] hover:text-emerald-900 transition-all duration-200 cursor-pointer"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : null}

              <div
                className={
                  isMobileSearchModeOpen
                    ? `mt-4 flex min-h-0 justify-center flex-1 overflow-hidden rounded-3xl sm:rounded-4xl border bg-white/98 ${
                        shouldShowResults ? 'border-stone-300 shadow-inner' : 'border-stone-200'
                      }`
                    : `mt-2 sm:mt-4 overflow-hidden rounded-3xl sm:rounded-4xl border bg-white/98 transition-all duration-300 ease-in-out absolute left-0 right-0 top-full shadow-2xl shadow-stone-900/10 z-50 ${
                        isOpen
                          ? isSearchPanelExpanded
                            ? 'h-88 opacity-100 border-stone-300'
                            : 'h-0 opacity-0 border-transparent'
                          : 'h-0 opacity-0 border-transparent pointer-events-none'
                      }`
                }
              >
                {isDataLoading ? (
                  <div className="flex justify-center items-center gap-2 px-4 h-full text-slate-500 text-sm">
                    <LoaderCircle className="w-5 h-5 animate-spin" />
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
                      <LoaderCircle className="w-5 h-5 animate-spin" />
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
                              className={`min-h-20 sm:min-h-24 w-full cursor-pointer px-4 sm:px-6 py-3 sm:py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset border-b border-stone-100 last:border-b-0 ${
                                isActiveOption ? 'bg-emerald-50/70' : 'hover:bg-stone-50/80'
                              }`}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => handleSelectPlant(plant)}
                            >
                              <span className="flex items-center gap-3 sm:gap-4">
                                <PlantImage
                                  src={plant.primary_image_url}
                                  alt={`${plant.common_name} photo`}
                                  status={displaySafetyStatus}
                                  width={48}
                                  height={48}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  className="border border-stone-200 rounded-lg w-10 h-10 sm:w-12 sm:h-12 shrink-0"
                                  imageClassName="h-full w-full object-cover"
                                />
                                <span className="flex-1 min-w-0">
                                  <span className="block font-medium text-slate-900 text-base sm:text-[1.15rem] truncate leading-tight">
                                    {plant.common_name}
                                  </span>
                                  <span className="block text-slate-500 text-xs sm:text-sm truncate italic mt-0.5">
                                    {plant.scientific_name}
                                  </span>
                                  {isEvidenceIncomplete ? (
                                    <span className="block mt-1 text-amber-700 text-[10px] sm:text-xs">Evidence incomplete</span>
                                  ) : null}
                                </span>
                                <SafetyBadge status={displaySafetyStatus} className="scale-[0.85] sm:scale-100 transform origin-right shrink-0" />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )
                ) : null}
              </div>
            </div>
          </section>

          {!error && plants.length > 0 ? (
            <section
              className="mt-16 sm:mt-24 w-full p-4 sm:p-6 rounded-[2rem] animate-fade-up-soft motion-reduce:animate-none"
              style={{ animationDelay: '160ms' }}
            >
              <div className="flex justify-between items-end gap-3 mb-6">
                <div className="flex flex-col items-start">
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

              <div className="gap-4 sm:gap-5 grid grid-cols-2 lg:grid-cols-4">
                {isDataLoading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonPopularCard key={`pop-skel-${i}`} />)
                  : popularPlants.map((plant, index) => {
                      const displaySafetyStatus = getDisplaySafetyStatus(plant);
                      return (
                        <button
                          key={plant.id}
                          type="button"
                          onClick={() => onSelectPlant(plant.id)}
                          className="group flex flex-col bg-white/95 hover:bg-white shadow-sm hover:shadow-stone-200/60 hover:shadow-xl p-4 sm:p-5 border border-stone-200/80 hover:border-emerald-300/80 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-left active:scale-[0.98] transition-all lg:hover:-translate-y-1.5 hover:-translate-y-1 animate-fade-up-stagger motion-reduce:animate-none duration-300 cursor-pointer"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <PlantImage
                            src={plant.primary_image_url}
                            alt={`${plant.common_name} photo`}
                            status={displaySafetyStatus}
                            width={200}
                            height={160}
                            loading={index < 4 ? 'eager' : 'lazy'}
                            fetchPriority={index < 2 ? 'high' : 'auto'}
                            priority={index < 2}
                            className="shadow-inner mb-3 rounded-[1.25rem] w-full h-32 sm:h-40"
                            imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          />
                          <span className="font-medium text-slate-900 sm:text-[1.1rem] text-base truncate tracking-tight">
                            {plant.common_name}
                          </span>
                          <span className="mt-1 text-[13px] text-slate-500 truncate italic">
                            {plant.scientific_name}
                          </span>
                          <SafetyBadge status={displaySafetyStatus} className="self-start mt-3" compact />
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
