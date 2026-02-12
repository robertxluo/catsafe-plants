'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

export function HomeView({ onSelectPlant }: HomeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const thumbnailClassName = 'rounded-lg w-10 h-10 shrink-0 border border-gray-200';
  const navButtonClass =
    'cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97]';

  const [plants, setPlants] = useState<Plant[]>([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="relative bg-slate-100 min-h-screen overflow-hidden text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: "url('/cat_landing_page.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-transparent" aria-hidden="true" />

      <div className="z-10 relative flex flex-col min-h-screen">
        <header className="mx-auto px-4 sm:px-6 pt-5 sm:pt-7 w-full max-w-6xl">
          <div className="flex justify-between items-center gap-3 bg-white/85 shadow-sm backdrop-blur px-4 py-2.5 border border-white/60 rounded-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex justify-center items-center bg-green-100 rounded-full w-9 h-9 text-green-800">
                <Cat className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm sm:text-base truncate tracking-tight">CatSafe Plants</span>
            </div>

            <nav aria-label="Primary" className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => router.push('/')}
                aria-current={pathname === '/' ? 'page' : undefined}
                className={`${navButtonClass} ${pathname === '/' ? 'bg-green-100 text-green-900 shadow-sm' : 'text-slate-600 hover:text-green-800 hover:bg-green-50 hover:shadow-sm'}`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => router.push('/plants')}
                aria-current={pathname.startsWith('/plants') ? 'page' : undefined}
                className={`${navButtonClass} ${
                  pathname.startsWith('/plants')
                    ? 'bg-green-100 text-green-900 shadow-sm'
                    : 'text-slate-600 hover:text-green-800 hover:bg-green-50 hover:shadow-sm'
                }`}
              >
                Plant Directory
              </button>
            </nav>
          </div>
        </header>

        <main className="relative flex flex-col items-center mx-auto px-4 sm:px-6 pt-10 sm:pt-14 md:pt-16 pb-8 w-full max-w-5xl text-center">
          <h1 className="font-semibold text-[2.5rem] sm:text-6xl lg:text-7xl text-balance leading-[1.05] tracking-tight animate-fade-up">
            Keep your cat safe.
          </h1>
          <p
            className="mx-auto mt-4 max-w-2xl text-gray-600 text-base sm:text-xl text-pretty animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            Search any houseplant to instantly check if it is safe for your feline friend.
          </p>

          <div
            className="flex flex-wrap justify-center items-center gap-2 mt-7 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            <span className="inline-flex items-center gap-1.5 bg-emerald-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-emerald-700">
              <ShieldCheck className="w-3 h-3" />
              Toxicity checker
            </span>
            <span className="inline-flex items-center gap-1.5 bg-violet-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-violet-700">
              <Leaf className="w-3 h-3" />
              Safe alternatives
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-amber-700">
              <Stethoscope className="w-3 h-3" />
              Vet-sourced data
            </span>
            <span className="inline-flex items-center gap-1.5 bg-sky-100/90 px-3 py-1 rounded-full font-medium text-[11px] text-sky-700">
              <Sparkles className="w-3 h-3" />
              50+ plants cataloged
            </span>
          </div>

          <div
            ref={containerRef}
            className="relative mx-auto mt-8 w-full max-w-[54rem] text-left animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <label htmlFor="home-plant-search" className="sr-only">
              Search plants by name
            </label>
            <div className="relative">
              <Search className="top-1/2 left-5 absolute w-6 h-6 text-gray-400 -translate-y-1/2" />
              <input
                id="home-plant-search"
                type="text"
                aria-label="Search plants by name"
                placeholder="Search by common name, scientific name, or alias..."
                className="bg-white/95 shadow-lg py-4 pr-5 pl-14 rounded-4xl outline-none focus:ring-2 focus:ring-slate-300 w-full text-gray-900 placeholder:text-gray-400 text-base sm:text-xl transition-all"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => {
                  if (query.trim().length > 0) setIsOpen(true);
                }}
              />
            </div>

            {isDataLoading && (
              <div className="top-full z-50 absolute bg-white/95 shadow-xl backdrop-blur mt-3 border border-green-200 rounded-3xl w-full overflow-hidden">
                <div className="flex justify-center items-center gap-2 px-4 py-6 text-gray-500 text-sm">
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Loading plants...
                </div>
              </div>
            )}

            {error && (
              <div className="top-full z-50 absolute bg-white/95 shadow-xl backdrop-blur mt-3 border border-rose-200 rounded-3xl w-full overflow-hidden">
                <div className="px-4 py-5 text-center">
                  <div className="inline-flex items-center gap-2 text-rose-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={() => void fetchPlants()}
                    className="block bg-rose-50 hover:bg-rose-100 mx-auto mt-2 px-3 py-2 border border-rose-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 text-rose-700 text-xs transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!isDataLoading && !error && isOpen && query.trim().length > 0 && (
              <div className="top-full z-50 absolute bg-white/95 shadow-xl backdrop-blur mt-3 rounded-3xl w-full max-h-80 overflow-y-auto">
                {isSearchLoading ? (
                  <div className="flex justify-center items-center gap-2 px-4 py-6 text-gray-500 text-sm">
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="px-4 py-6 text-gray-500 text-sm text-center">
                    No plants found matching &quot;{query}&quot;
                  </div>
                ) : (
                  <ul role="listbox" aria-label="Plant search results">
                    {filtered.map((plant) => {
                      const displaySafetyStatus = getDisplaySafetyStatus(plant);
                      const color = getStatusColor(displaySafetyStatus);
                      const isEvidenceIncomplete = hasIncompleteEvidence(plant);
                      return (
                        <li key={plant.id}>
                          <button
                            type="button"
                            className="flex items-center gap-3 hover:bg-emerald-50/45 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset w-full text-left transition-colors cursor-pointer"
                            onClick={() => {
                              onSelectPlant(plant.id);
                              setQuery('');
                              setIsOpen(false);
                            }}
                          >
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
                              <div
                                className={`${thumbnailClassName} flex items-center justify-center ${color.bg}`}
                                aria-hidden="true"
                              >
                                <Leaf className={`w-5 h-5 ${color.text}`} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{plant.common_name}</div>
                              <div className="text-gray-500 text-sm truncate italic">{plant.scientific_name}</div>
                              {isEvidenceIncomplete ? (
                                <div className="mt-1 text-amber-700 text-xs">Evidence incomplete</div>
                              ) : null}
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-sm ${color.bg} ${color.text} border ${color.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                              {getStatusLabel(displaySafetyStatus)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 animate-fade-up" style={{ animationDelay: '320ms' }}>
            <button
              type="button"
              onClick={() => router.push('/plants')}
              className="inline-flex items-center gap-2 bg-white/80 hover:bg-green-50 shadow-sm hover:shadow-md px-6 py-3 border border-green-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 font-medium text-green-800 hover:text-green-900 text-sm sm:text-base active:scale-[0.97] transition-all duration-200 cursor-pointer"
            >
              Browse all {isDataLoading ? 'plants' : `${plants.length} plants`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {!isDataLoading && !error && plants.length > 0 && (
            <section className="mx-auto mt-14 w-full max-w-3xl animate-fade-up" style={{ animationDelay: '400ms' }}>
              <h2 className="mb-5 font-semibold text-slate-800 text-lg sm:text-xl tracking-tight">Popular Plants</h2>
              <div className="gap-3 sm:gap-4 grid grid-cols-2 sm:grid-cols-4">
                {plants.slice(0, 4).map((plant) => {
                  const displaySafetyStatus = getDisplaySafetyStatus(plant);
                  const color = getStatusColor(displaySafetyStatus);
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => onSelectPlant(plant.id)}
                      className="group flex flex-col bg-white/85 hover:bg-white shadow-sm hover:shadow-md backdrop-blur p-3 border border-slate-200 hover:border-green-200 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-left active:scale-[0.97] transition-all duration-200 cursor-pointer"
                    >
                      {plant.primary_image_url ? (
                        <Image
                          src={plant.primary_image_url}
                          alt={`${plant.common_name} photo`}
                          width={160}
                          height={120}
                          className="mb-2 rounded-xl w-full h-24 sm:h-28 object-cover"
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`mb-2 rounded-xl w-full h-24 sm:h-28 flex items-center justify-center ${color.bg}`}
                        >
                          <Leaf className={`w-8 h-8 ${color.text}`} />
                        </div>
                      )}
                      <span className="font-medium text-slate-900 text-sm truncate">{plant.common_name}</span>
                      <span className="mt-0.5 text-slate-500 text-xs truncate italic">{plant.scientific_name}</span>
                      <span
                        className={`mt-2 inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                        {getStatusLabel(displaySafetyStatus)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <footer
            className="mx-auto mt-16 mb-6 px-4 w-full max-w-3xl text-center animate-fade-up"
            style={{ animationDelay: '480ms' }}
          >
            <div className="bg-white/70 shadow-sm backdrop-blur-sm px-6 py-5 border border-slate-200/80 rounded-2xl">
              <p className="text-slate-600 text-xs leading-relaxed">
                This tool is for informational purposes only. Always consult your veterinarian for advice about your
                pet&apos;s health and safety.
              </p>
              <p className="mt-2 text-slate-500 text-xs">Made with 🐱 by CatSafe Plants</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
