'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Leaf, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import type { Plant } from '@/src/lib/plants';
import { getStatusColor, getStatusLabel } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';

const PAGE_SIZE = 20;

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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(plants.length / PAGE_SIZE)), [plants.length]);
  const currentPage = useMemo(() => Math.min(requestedPage, totalPages), [requestedPage, totalPages]);

  const visiblePlants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return plants.slice(start, start + PAGE_SIZE);
  }, [currentPage, plants]);

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
    <main className="bg-yellow-50 min-h-screen">
      <div className="mx-auto px-4 py-10 max-w-6xl">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 mb-6 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        <header className="mb-8">
          <h1 className="font-bold text-gray-900 text-3xl sm:text-4xl">Plant Directory</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Browse all plants and check cat safety status.</p>
        </header>

        <section aria-label="Plant directory results" className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePlants.map((plant) => {
            const color = getStatusColor(plant.safety_status);
            return (
              <button
                key={plant.id}
                type="button"
                onClick={() => router.push(`/plants/${plant.id}`)}
                aria-label={`Open details for ${plant.common_name}`}
                className="group bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 hover:border-emerald-200 rounded-xl text-left transition-all cursor-pointer"
              >
                {plant.primary_image_url ? (
                  <Image
                    src={plant.primary_image_url}
                    alt={`${plant.common_name} photo`}
                    width={480}
                    height={360}
                    className="mb-3 rounded-lg w-full object-cover aspect-[4/3] group-hover:scale-[1.01] transition-transform"
                    unoptimized
                  />
                ) : (
                  <div
                    className={`w-full aspect-[4/3] rounded-lg flex items-center justify-center mb-3 ${color.bg}`}
                    data-testid={`directory-placeholder-${plant.id}`}
                    aria-hidden="true"
                  >
                    <Leaf className={`w-8 h-8 ${color.text} opacity-70`} />
                  </div>
                )}
                <div className="font-semibold text-gray-900 text-base">{plant.common_name}</div>
                <div className="text-gray-500 text-sm italic">{plant.scientific_name}</div>
                <span
                  className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                  {getStatusLabel(plant.safety_status)}
                </span>
              </button>
            );
          })}
        </section>

        <nav
          className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 mt-8"
          aria-label="Pagination"
        >
          <button
            type="button"
            onClick={() => pushPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
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
            className="bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </main>
  );
}
