'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react';
import {
  Search,
  Leaf,
  ShieldCheck,
  Cat,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, getStatusColor, getStatusLabel, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';

interface HomeViewProps {
  onSelectPlant: (id: string) => void;
}

const navButtonClass =
  'cursor-pointer rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97]';

export function HomeView({ onSelectPlant }: HomeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const thumbnailClassName = 'h-10 w-10 shrink-0 rounded-lg border border-slate-200';
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
    <div className="relative bg-slate-100 min-h-screen overflow-hidden text-slate-900">
      <Image
        src="/cat_landing_page.png"
        alt=""
        fill
        priority
        className="object-cover lg:object-[82%_4%] 2xl:object-[78%_2%] xl:object-[80%_2%] lg:scale-[1.24] 2xl:scale-[1.20] xl:scale-[1.22] origin-top lg:-translate-y-[22%] 2xl:-translate-y-[18%] xl:-translate-y-[20%] pointer-events-none"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-100/66 via-slate-100/32 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-emerald-100/16 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="z-10 relative flex flex-col min-h-screen">
        <header className="mx-auto px-4 sm:px-6 pt-5 sm:pt-7 w-full max-w-6xl">
          <div className="flex justify-between items-center gap-2 sm:gap-3 bg-white/86 shadow-sm backdrop-blur px-3 sm:px-4 py-2 border border-white/70 rounded-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex justify-center items-center bg-green-100 rounded-full w-8 sm:w-9 h-8 sm:h-9 text-green-800 shrink-0">
                <Cat className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <span className="font-semibold text-xs sm:text-base truncate tracking-tight">CatSafe Plants</span>
            </div>

            <nav aria-label="Primary" className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => router.push('/')}
                aria-current={pathname === '/' ? 'page' : undefined}
                className={`${navButtonClass} ${
                  pathname === '/'
                    ? 'bg-green-100 text-green-900 shadow-sm'
                    : 'text-slate-600 hover:bg-green-50 hover:text-green-800 hover:shadow-sm'
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => router.push('/plants')}
                aria-label="Plant Directory"
                aria-current={pathname.startsWith('/plants') ? 'page' : undefined}
                className={`${navButtonClass} ${
                  pathname.startsWith('/plants')
                    ? 'bg-green-100 text-green-900 shadow-sm'
                    : 'text-slate-600 hover:bg-green-50 hover:text-green-800 hover:shadow-sm'
                }`}
              >
                <span className="sm:hidden">Directory</span>
                <span className="hidden sm:inline">Plant Directory</span>
              </button>
            </nav>
          </div>
        </header>

        <main className="flex flex-col flex-1 mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-10 w-full max-w-6xl">
          <section className="lg:items-start gap-5 sm:gap-6 grid lg:grid-cols-[1.03fr_0.97fr]">
            <div className="bg-white/82 shadow-lg backdrop-blur p-5 sm:p-8 border border-white/85 rounded-[2rem] animate-fade-up motion-reduce:animate-none">
              <span className="inline-flex items-center gap-1.5 bg-emerald-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-emerald-700">
                <ShieldCheck className="w-3 h-3" />
                Source-backed plant safety
              </span>
              <h1 className="mt-4 font-semibold text-[2.5rem] sm:text-6xl lg:text-6xl text-balance leading-[1.05] tracking-tight">
                Keep your cat safe.
              </h1>
              <p className="mt-3.5 max-w-2xl text-slate-700 text-base sm:text-xl text-pretty leading-relaxed">
                Search by plant name, check toxicity fast, and browse safer alternatives before plants come home.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-5">
                <span className="inline-flex items-center gap-1.5 bg-emerald-100/80 px-2.5 py-1 rounded-full font-medium text-[10px] text-emerald-700 sm:text-[11px]">
                  <ShieldCheck className="w-3 h-3" />
                  Toxicity checker
                </span>
                <span className="inline-flex items-center gap-1.5 bg-violet-100/80 px-2.5 py-1 rounded-full font-medium text-[10px] text-violet-700 sm:text-[11px]">
                  <Leaf className="w-3 h-3" />
                  Safe alternatives
                </span>
                <span className="inline-flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-1 rounded-full font-medium text-[10px] text-amber-700 sm:text-[11px]">
                  <Stethoscope className="w-3 h-3" />
                  Vet-sourced data
                </span>
                <span className="inline-flex items-center gap-1.5 bg-sky-100/80 px-2.5 py-1 rounded-full font-medium text-[10px] text-sky-700 sm:text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  50+ plants cataloged
                </span>
              </div>

              <div className="gap-2.5 sm:gap-3 grid sm:grid-cols-3 mt-5">
                <article className="bg-emerald-50/55 p-3 sm:p-3.5 border border-emerald-100 rounded-2xl">
                  <p className="font-semibold text-[11px] text-emerald-700 uppercase tracking-[0.14em]">Trust</p>
                  <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Evidence required</p>
                  <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                    Every plant entry carries source citations.
                  </p>
                </article>
                <article className="bg-amber-50/55 p-3 sm:p-3.5 border border-amber-100 rounded-2xl">
                  <p className="font-semibold text-[11px] text-amber-700 uppercase tracking-[0.14em]">Safety</p>
                  <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Unknown stays unknown</p>
                  <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                    Unverified records are clearly caution-labeled.
                  </p>
                </article>
                <article className="bg-sky-50/60 p-3 sm:p-3.5 border border-sky-100 rounded-2xl">
                  <p className="font-semibold text-[11px] text-sky-700 uppercase tracking-[0.14em]">Speed</p>
                  <p className="mt-1 font-medium text-slate-800 sm:text-[15px] text-sm">Search-first flow</p>
                  <p className="mt-1 text-slate-600 sm:text-[13px] text-xs leading-relaxed">
                    Find answers in a few keystrokes.
                  </p>
                </article>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => router.push('/plants')}
                  className="inline-flex items-center gap-2 bg-white/80 hover:bg-green-50 shadow-sm hover:shadow-md px-6 py-3 border border-green-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 font-medium text-green-800 hover:text-green-900 text-sm sm:text-base active:scale-[0.97] transition-all duration-200 cursor-pointer"
                >
                  Browse all {isDataLoading ? 'plants' : `${plants.length} plants`}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Designed for fast checks before purchases, gifts, or new plant arrivals.
                </p>
              </div>
            </div>

            <section
              ref={containerRef}
              className="bg-white/91 shadow-xl backdrop-blur p-5 sm:p-6 border border-white/90 rounded-[2rem] text-left animate-fade-up motion-reduce:animate-none"
              style={{ animationDelay: '80ms' }}
            >
              <h2 className="font-semibold text-slate-900 text-xl tracking-tight">Search the catalog</h2>
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
                  className={`w-full rounded-4xl border py-4 pr-5 pl-14 text-base sm:text-xl text-slate-900 outline-none transition-all duration-200 ${
                    shouldShowResults ? 'border-slate-300 bg-white shadow-xl' : 'border-slate-200 bg-white/95 shadow-md'
                  } focus:border-slate-300 focus:ring-2 focus:ring-slate-300 focus:shadow-xl placeholder:text-slate-500/85`}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
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
                        const color = getStatusColor(displaySafetyStatus);
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
                                {plant.primary_image_url ? (
                                  <Image
                                    src={plant.primary_image_url}
                                    alt={`${plant.common_name} photo`}
                                    width={40}
                                    height={40}
                                    className={`${thumbnailClassName} object-cover`}
                                    unoptimized
                                  />
                                ) : (
                                  <span
                                    className={`${thumbnailClassName} flex items-center justify-center ${color.bg}`}
                                    aria-hidden="true"
                                  >
                                    <Leaf className={`h-5 w-5 ${color.text}`} />
                                  </span>
                                )}
                                <span className="flex-1 min-w-0">
                                  <span className="block font-medium text-slate-900 truncate">{plant.common_name}</span>
                                  <span className="block text-slate-500 text-sm truncate italic">
                                    {plant.scientific_name}
                                  </span>
                                  {isEvidenceIncomplete ? (
                                    <span className="block mt-1 text-amber-700 text-xs">Evidence incomplete</span>
                                  ) : null}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm ${color.bg} ${color.text} ${color.border}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                  {getStatusLabel(displaySafetyStatus)}
                                </span>
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
            </section>
          </section>

          {!isDataLoading && !error && plants.length > 0 && (
            <section
              className="bg-white/76 shadow-sm backdrop-blur mt-12 sm:mt-14 p-4 sm:p-5 border border-white/85 rounded-3xl animate-fade-up motion-reduce:animate-none"
              style={{ animationDelay: '160ms' }}
            >
              <div className="flex justify-between items-end gap-3 mb-4">
                <div>
                  <h2 className="font-semibold text-slate-800 text-lg sm:text-xl tracking-tight">Popular plants</h2>
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
                {plants.slice(0, 4).map((plant) => {
                  const displaySafetyStatus = getDisplaySafetyStatus(plant);
                  const color = getStatusColor(displaySafetyStatus);
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => onSelectPlant(plant.id)}
                      className="group flex flex-col bg-white/85 hover:bg-white hover:shadow-md p-3 border border-slate-200 hover:border-green-200 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-left active:scale-[0.97] transition-all duration-200 cursor-pointer"
                    >
                      {plant.primary_image_url ? (
                        <Image
                          src={plant.primary_image_url}
                          alt={`${plant.common_name} photo`}
                          width={160}
                          height={120}
                          className="mb-2 rounded-xl w-full h-24 sm:h-28 object-cover group-hover:scale-[1.01] transition-transform duration-200"
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`mb-2 flex h-24 w-full items-center justify-center rounded-xl sm:h-28 ${color.bg}`}
                          aria-hidden="true"
                        >
                          <Leaf className={`h-8 w-8 ${color.text}`} />
                        </div>
                      )}
                      <span className="font-medium text-slate-900 sm:text-[15px] text-sm truncate">
                        {plant.common_name}
                      </span>
                      <span className="mt-0.5 text-[11px] text-slate-500 sm:text-xs truncate italic">
                        {plant.scientific_name}
                      </span>
                      <span
                        className={`mt-2 inline-flex self-start rounded-full border px-2 py-0.5 text-xs font-medium ${color.bg} ${color.text} ${color.border}`}
                      >
                        {getStatusLabel(displaySafetyStatus)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <footer
            className="bg-white/82 shadow-sm backdrop-blur mx-auto mt-10 mb-2 px-5 py-4 border border-slate-200/80 rounded-2xl w-full max-w-4xl text-center animate-fade-up motion-reduce:animate-none"
            style={{ animationDelay: '240ms' }}
          >
            <p className="text-slate-600 sm:text-[13px] text-xs leading-relaxed">
              Safety guidance is informational and should not replace professional veterinary advice.
            </p>
            <p className="inline-flex items-center gap-1.5 mt-2 text-slate-500 sm:text-[13px] text-xs">
              <Cat className="w-3.5 h-3.5" />
              For cat owners, by a cat lover.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
