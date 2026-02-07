'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Leaf, ShieldCheck, Cat } from 'lucide-react';
import type { Plant } from '@/src/lib/plants';
import { plants, getStatusColor, getStatusLabel } from '@/src/lib/plants';

interface HomeViewProps {
  onSelectPlant: (id: string) => void;
  onAdminClick?: () => void;
}

export function HomeView({ onSelectPlant, onAdminClick }: HomeViewProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered: Plant[] =
    query.trim().length > 0
      ? plants.filter((p) => {
          const q = query.toLowerCase();
          return (
            p.common_name.toLowerCase().includes(q) ||
            p.scientific_name.toLowerCase().includes(q) ||
            p.aka_names.some((a) => a.toLowerCase().includes(q))
          );
        })
      : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* Hero */}
      <main className="flex flex-col flex-1 justify-center items-center px-4 py-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex justify-center items-center bg-emerald-100 rounded-full w-12 h-12">
            <Cat className="w-6 h-6 text-emerald-700" />
          </div>
          <span className="font-semibold text-emerald-700 text-lg tracking-tight">CatSafe Plants</span>
        </div>

        <h1 className="font-bold text-gray-900 text-4xl sm:text-5xl md:text-6xl text-center text-balance leading-tight">
          Keep your cat safe.
        </h1>
        <p className="mt-4 max-w-lg text-gray-500 text-lg text-center text-pretty">
          Search any houseplant to instantly check if it is safe for your feline friend.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center items-center gap-3 mt-8 mb-10">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded-full font-medium text-emerald-700 text-sm">
            <ShieldCheck className="w-4 h-4" />
            Toxicity lookup
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded-full font-medium text-emerald-700 text-sm">
            <Leaf className="w-4 h-4" />
            Safe alternatives
          </span>
        </div>

        {/* Search */}
        <div ref={containerRef} className="relative w-full max-w-xl">
          <div className="relative">
            <Search className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search plants by name"
              placeholder="Search by common name, scientific name, or alias..."
              className="bg-white shadow-md py-3.5 pr-4 pl-12 border border-gray-300 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 w-full text-gray-900 placeholder:text-gray-400 text-base transition-all"
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

          {/* Dropdown results */}
          {isOpen && query.trim().length > 0 && (
            <div className="top-full z-50 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-xl w-full max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-gray-400 text-sm text-center">
                  No plants found matching &quot;{query}&quot;
                </div>
              ) : (
                <ul role="listbox" aria-label="Plant search results">
                  {filtered.map((plant) => {
                    const color = getStatusColor(plant.safety_status);
                    return (
                      <li key={plant.id}>
                        <button
                          type="button"
                          className="flex items-center gap-3 hover:bg-gray-50 px-4 py-3 w-full text-left transition-colors cursor-pointer"
                          onClick={() => {
                            onSelectPlant(plant.id);
                            setQuery('');
                            setIsOpen(false);
                          }}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color.bg}`}>
                            <Leaf className={`w-5 h-5 ${color.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{plant.common_name}</div>
                            <div className="text-gray-500 text-sm truncate italic">{plant.scientific_name}</div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                            {getStatusLabel(plant.safety_status)}
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

        {/* Browse all */}
        <div className="mt-8 text-gray-400 text-sm">
          Or browse all <span className="font-medium text-gray-500">{plants.length} plants</span> in our database
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-gray-100 border-t text-center">
        {onAdminClick && (
          <button
            type="button"
            onClick={onAdminClick}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors cursor-pointer"
          >
            Admin
          </button>
        )}
      </footer>
    </div>
  );
}
