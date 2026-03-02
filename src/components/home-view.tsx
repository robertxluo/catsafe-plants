'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react';
import { Search, Leaf, ShieldCheck, LoaderCircle, AlertCircle, ArrowRight, Stethoscope, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';
import { SiteHeader } from '@/src/components/ui/site-header';
import { SafetyBadge } from '@/src/components/ui/safety-badge';
import { PlantImage } from '@/src/components/ui/plant-image';

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
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const shouldShowResults = isOpen && query.trim().length > 0;
  const isSearchPanelExpanded = isDataLoading || Boolean(error) || shouldShowResults;
  const showInteractiveResults =
    shouldShowResults && !isSearchLoading && filtered.length > 0 && !isDataLoading && !error;

  const handleSelectPlant = useCallback(
    (plant: Plant) => {
      onSelectPlant(plant.id);
      setQuery('');
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onSelectPlant]
  );

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
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
    [activeIndex, filtered, handleSelectPlant, showInteractiveResults]
  );

  return (
    <div className="relative min-h-screen overflow-hidden home-editorial-shell">
      <Image
        src="/cat_landing_page.png"
        alt=""
        fill
        priority
        className="object-cover lg:object-[82%_4%] 2xl:object-[78%_2%] xl:object-[80%_2%] lg:scale-[1.24] 2xl:scale-[1.20] xl:scale-[1.22] origin-top lg:-translate-y-[22%] 2xl:-translate-y-[18%] xl:-translate-y-[20%] animate-slow-drift motion-reduce:animate-none pointer-events-none"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-100/70 via-slate-100/40 to-slate-100/86"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-emerald-100/25 via-transparent to-slate-100/80"
        aria-hidden="true"
      />
      <div className="-top-20 -left-16 absolute bg-emerald-100/60 blur-3xl rounded-full w-72 h-72" aria-hidden="true" />
      <div
        className="-right-16 -bottom-20 absolute bg-slate-200/55 blur-3xl rounded-full w-72 h-72"
        aria-hidden="true"
      />
      <p
        className="hidden xl:block top-36 right-0 absolute font-semibold text-emerald-200/65 text-xs uppercase tracking-[0.52em] rotate-90 select-none"
        aria-hidden="true"
      ></p>

      <div className="z-10 relative flex flex-col min-h-screen">
        <SiteHeader
          pathname={pathname}
          onGoHome={() => router.push('/')}
          onGoDirectory={() => router.push('/plants')}
          activeNav="home"
        />

        <main className="flex flex-col flex-1 mx-auto px-4 sm:px-6 pt-7 sm:pt-11 pb-8 sm:pb-10 w-full max-w-6xl">
          <section className="lg:items-start gap-5 sm:gap-6 grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="relative bg-white/82 shadow-xl backdrop-blur p-5 sm:p-8 border border-white/90 rounded-[2rem] overflow-hidden animate-fade-up motion-reduce:animate-none">
              <div
                className="-top-20 -right-12 absolute bg-emerald-100/55 blur-3xl rounded-full w-48 h-48"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-emerald-700">
                    <ShieldCheck className="w-3 h-3" />
                    Source-backed plant safety
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-slate-600">
                    <Sparkles className="w-3 h-3" />
                    {isDataLoading ? 'Loading catalog' : `${plants.length}+ entries reviewed`}
                  </span>
                </div>

                <h1 className="mt-4 font-semibold text-[2.5rem] sm:text-6xl lg:text-6xl text-balance leading-[1.05] tracking-tight">
                  Keep your cat safe.
                </h1>
                <p className="mt-3.5 max-w-2xl text-slate-700 text-base sm:text-xl text-pretty leading-relaxed">
                  Search by plant name, check toxicity fast, and browse safer alternatives before plants come home.
                </p>

                <div className="gap-2 grid sm:grid-cols-2 mt-5 max-w-2xl">
                  <span className="inline-flex justify-start items-center gap-2 bg-slate-50/90 px-3 py-2 border border-slate-200 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-slate-200 rounded-full w-5 h-5 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    </span>
                    Toxicity checker
                  </span>
                  <span className="inline-flex justify-start items-center gap-2 bg-slate-50/90 px-3 py-2 border border-slate-200 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-slate-200 rounded-full w-5 h-5 shrink-0">
                      <Leaf className="w-3 h-3 text-emerald-700" />
                    </span>
                    Safe alternatives
                  </span>
                  <span className="inline-flex justify-start items-center gap-2 bg-slate-50/90 px-3 py-2 border border-slate-200 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-slate-200 rounded-full w-5 h-5 shrink-0">
                      <Stethoscope className="w-3 h-3 text-emerald-700" />
                    </span>
                    Vet-sourced data
                  </span>
                  <span className="inline-flex justify-start items-center gap-2 bg-slate-50/90 px-3 py-2 border border-slate-200 rounded-2xl font-medium text-[11px] text-slate-700 sm:text-xs leading-none">
                    <span className="inline-flex justify-center items-center bg-white border border-slate-200 rounded-full w-5 h-5 shrink-0">
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                    </span>
                    Search-first flow
                  </span>
                </div>

                <div className="gap-2.5 sm:gap-3 grid sm:grid-cols-3 mt-5">
                  <article className="bg-emerald-50/60 p-3 sm:p-3.5 border border-emerald-100 rounded-2xl">
                    <p className="font-semibold text-[11px] text-emerald-700 uppercase tracking-[0.14em]">Trust</p>
                    <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Evidence required</p>
                    <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                      Every plant entry carries source citations.
                    </p>
                  </article>
                  <article className="bg-amber-50/60 p-3 sm:p-3.5 border border-amber-100 rounded-2xl">
                    <p className="font-semibold text-[11px] text-amber-700 uppercase tracking-[0.14em]">Safety</p>
                    <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Unknown stays unknown</p>
                    <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                      Unverified records are clearly caution-labeled.
                    </p>
                  </article>
                  <article className="bg-sky-50/60 p-3 sm:p-3.5 border border-sky-100 rounded-2xl">
                    <p className="font-semibold text-[11px] text-sky-700 uppercase tracking-[0.14em]">Speed</p>
                    <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Lookup in seconds</p>
                    <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                      Answers appear quickly as you type.
                    </p>
                  </article>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-7">
                  <button
                    type="button"
                    onClick={() => router.push('/plants')}
                    className="inline-flex items-center gap-2 bg-white/85 hover:bg-green-50 shadow-sm hover:shadow-md px-6 py-3 border border-green-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 font-medium text-green-800 hover:text-green-900 text-sm sm:text-base active:scale-[0.97] transition-all duration-200 cursor-pointer"
                  >
                    Browse all {isDataLoading ? 'plants' : `${plants.length} plants`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Designed for fast checks before purchases, gifts, or new plant arrivals.
                  </p>
                </div>
              </div>
            </div>

            <section
              ref={containerRef}
              className="relative bg-white/92 shadow-xl backdrop-blur p-5 sm:p-6 border border-white/90 rounded-[2rem] overflow-hidden text-left animate-fade-up-soft motion-reduce:animate-none"
              style={{ animationDelay: '80ms' }}
            >
              <div
                className="-top-16 -left-10 absolute bg-emerald-100/45 blur-2xl rounded-full w-36 h-36"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="font-semibold text-[11px] text-emerald-700 uppercase tracking-[0.2em]">Field lookup</p>
                <h2 className="mt-2 font-semibold text-slate-900 text-2xl tracking-tight">Search the catalog</h2>
                <p className="mt-1 text-slate-600 sm:text-[15px] text-sm leading-relaxed">
                  Find a plant by common name, scientific name, or alias.
                </p>

                <label htmlFor="home-plant-search" className="sr-only">
                  Search plants by name
                </label>
                <div className="relative mt-4">
                  <Search className="top-1/2 left-5 absolute w-6 h-6 text-slate-500 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="home-plant-search"
                    type="text"
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
                    className={`w-full focus:border-emerald-300 rounded-4xl border py-4 pr-5 pl-14 text-base sm:text-xl text-slate-900 outline-none transition-all duration-200 ${
                      shouldShowResults
                        ? 'border-slate-300 bg-white shadow-xl'
                        : 'border-slate-200 bg-white/95 shadow-md'
                    } focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300 focus:shadow-xl placeholder:text-slate-500/85`}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setIsOpen(true);
                      setActiveIndex(-1);
                    }}
                    onFocus={() => {
                      if (query.trim().length > 0) {
                        setIsOpen(true);
                      }
                    }}
                    onKeyDown={handleSearchInputKeyDown}
                  />
                </div>

                <p className="flex items-center gap-1.5 mt-3 text-slate-700 text-xs sm:text-sm leading-relaxed">
                  <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                  Informational only. For urgent concerns, contact your veterinarian.
                </p>

                {!isDataLoading && !error && quickSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setQuery(name);
                          setIsOpen(true);
                          setActiveIndex(-1);
                        }}
                        className="bg-white hover:bg-emerald-50 px-3 py-1.5 border border-slate-200 hover:border-emerald-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-slate-700 sm:text-[13px] hover:text-emerald-800 text-xs transition-colors duration-200 cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div
                  className={`mt-4 overflow-hidden rounded-2xl border bg-white/95 transition-all duration-300 ease-in-out ${
                    isOpen
                      ? isSearchPanelExpanded
                        ? 'h-80 opacity-100'
                        : 'h-32 opacity-100'
                      : 'h-0 opacity-0 border-none'
                  } ${shouldShowResults ? 'border-slate-300 shadow-md' : 'border-slate-200'}`}
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
                        className="h-full overflow-y-auto"
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
                                className={`w-full min-h-[5.25rem] cursor-pointer px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset ${
                                  isActiveOption ? 'bg-emerald-50/60' : 'hover:bg-emerald-50/45'
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
                                    className="border border-slate-200 rounded-lg w-10 h-10 shrink-0"
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

          {!isDataLoading && !error && plants.length > 0 && (
            <section
              className="bg-white/78 shadow-lg backdrop-blur mt-12 sm:mt-14 p-4 sm:p-6 border border-white/85 rounded-[2rem] animate-fade-up-soft motion-reduce:animate-none"
              style={{ animationDelay: '160ms' }}
            >
              <div className="flex justify-between items-end gap-3 mb-4">
                <div>
                  <p className="font-semibold text-[11px] text-emerald-700 uppercase tracking-[0.18em]">
                    Starter Picks
                  </p>
                  <h2 className="mt-1 font-semibold text-slate-800 text-lg sm:text-xl tracking-tight">
                    Popular plants
                  </h2>
                  <p className="mt-1 text-slate-600 text-xs sm:text-sm">Open any card to jump straight to details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/plants')}
                  className="inline-flex items-center gap-1 bg-white hover:bg-green-50 px-3 py-1.5 border border-slate-200 hover:border-green-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 font-medium text-slate-700 hover:text-green-800 text-xs sm:text-sm transition-colors duration-200 cursor-pointer"
                >
                  View directory
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="gap-3 sm:gap-4 grid grid-cols-2 lg:grid-cols-4">
                {popularPlants.map((plant, index) => {
                  const displaySafetyStatus = getDisplaySafetyStatus(plant);
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => onSelectPlant(plant.id)}
                      className="group flex flex-col bg-white/90 hover:bg-white hover:shadow-lg p-3 border border-slate-200 hover:border-green-200 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-left active:scale-[0.97] transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
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
                        className="mb-2 rounded-xl w-full h-24 sm:h-28"
                        imageClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
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
          )}

          <footer
            className="bg-white/82 shadow-sm backdrop-blur mx-auto mt-10 mb-2 px-5 py-4 border border-slate-200/80 rounded-2xl w-full max-w-4xl text-center animate-fade-up-soft motion-reduce:animate-none"
            style={{ animationDelay: '240ms' }}
          >
            <p className="text-slate-600 sm:text-[13px] text-xs leading-relaxed">
              Safety guidance is informational and should not replace professional veterinary advice.
            </p>
            <p className="inline-flex items-center gap-1.5 mt-2 text-slate-500 sm:text-[13px] text-xs">
              <Image src="/icon.svg" alt="" width={14} height={14} className="w-3.5 h-3.5" aria-hidden="true" />
              For cat owners, by a cat lover.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
