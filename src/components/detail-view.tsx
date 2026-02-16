'use client';

import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Leaf,
  Stethoscope,
  FlaskConical,
  LoaderCircle,
} from 'lucide-react';
import Image from 'next/image';
import type { Plant } from '@/src/lib/plants';
import { getDisplaySafetyStatus, getStatusColor, getStatusLabel, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';

interface DetailViewProps {
  plantId: string;
  onBack: () => void;
  onSelectPlant: (id: string) => void;
}

function StatusIcon({ status }: { status: Plant['safety_status'] }) {
  switch (status) {
    case 'non_toxic':
      return <ShieldCheck className="w-6 h-6" />;
    case 'mildly_toxic':
      return <AlertTriangle className="w-6 h-6" />;
    case 'highly_toxic':
      return <ShieldAlert className="w-6 h-6" />;
    case 'unknown':
      return <HelpCircle className="w-6 h-6" />;
  }
}

export function DetailView({ plantId, onBack, onSelectPlant }: DetailViewProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    setActiveImageIndex(0);
  }, [plantId]);

  const plantsById = useMemo(() => new Map<string, Plant>(plants.map((item) => [item.id, item])), [plants]);
  const plant = plantsById.get(plantId);

  const alternatives = useMemo(() => {
    if (!plant) {
      return [];
    }

    return plant.alternatives
      .map((id) => plantsById.get(id))
      .filter((item): item is Plant => item !== undefined)
      .slice(0, 5);
  }, [plant, plantsById]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-yellow-50 min-h-screen">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <LoaderCircle className="w-4 h-4 animate-spin" />
          Loading plant details...
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

  if (!plant) {
    return (
      <div className="flex justify-center items-center bg-yellow-50 min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-xl">Plant not found.</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const displaySafetyStatus = getDisplaySafetyStatus(plant);
  const color = getStatusColor(displaySafetyStatus);
  const isToxic = displaySafetyStatus === 'mildly_toxic' || displaySafetyStatus === 'highly_toxic';
  const isEvidenceIncomplete = hasIncompleteEvidence(plant);
  const hasToxicDetailContent = Boolean(plant.symptoms || plant.toxic_parts);
  const galleryImages =
    plant.photo_urls.length > 0 ? plant.photo_urls : plant.primary_image_url ? [plant.primary_image_url] : [];
  const hasPlaceholder = galleryImages.length === 0;
  const hasMultipleImages = galleryImages.length > 1;
  const isFirstImage = activeImageIndex === 0;
  const isLastImage = activeImageIndex === galleryImages.length - 1;

  function goToPreviousImage() {
    setActiveImageIndex((current) => Math.max(0, current - 1));
  }

  function goToNextImage() {
    setActiveImageIndex((current) => Math.min(galleryImages.length - 1, current + 1));
  }

  function handleCarouselKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      if (!isFirstImage) {
        event.preventDefault();
        goToPreviousImage();
      }
    }

    if (event.key === 'ArrowRight') {
      if (!isLastImage) {
        event.preventDefault();
        goToNextImage();
      }
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back to Search</span>
        </button>

        <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1">
            {galleryImages.length > 0 ? (
              <div className="space-y-3">
                <div
                  className="relative border border-gray-200 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 w-full aspect-square overflow-hidden"
                  tabIndex={0}
                  onKeyDown={handleCarouselKeyDown}
                  aria-label={`${plant.common_name} image carousel`}
                >
                  {hasPlaceholder ? (
                    <div className={`w-full h-full rounded-xl flex items-center justify-center ${color.bg}`}>
                      <Leaf className={`w-8 h-8 ${color.text} opacity-70`} />
                    </div>
                  ) : (
                    <Image
                      src={galleryImages[activeImageIndex]}
                      alt={`${plant.common_name} photo ${activeImageIndex + 1} of ${galleryImages.length}`}
                      width={720}
                      height={540}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  )}

                  {hasMultipleImages && !isFirstImage ? (
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      aria-label="Previous image"
                      className="top-1/2 left-2 z-10 absolute flex justify-center items-center bg-slate-900/45 hover:bg-slate-900/60 shadow-md border border-white/25 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 w-12 h-12 text-white transition-colors -translate-x-1/2 -translate-y-1/2 duration-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  ) : null}

                  {hasMultipleImages && !isLastImage ? (
                    <button
                      type="button"
                      onClick={goToNextImage}
                      aria-label="Next image"
                      className="top-1/2 right-2 z-10 absolute flex justify-center items-center bg-slate-900/45 hover:bg-slate-900/60 shadow-md border border-white/25 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 w-12 h-12 text-white transition-colors -translate-y-1/2 translate-x-1/2 duration-200 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : null}

                  {hasMultipleImages ? (
                    <div className="bottom-3 left-1/2 absolute flex items-center gap-1.5 bg-black/25 px-2.5 py-1.5 border border-white/30 rounded-full -translate-x-1/2">
                      {galleryImages.map((_, index) => (
                        <button
                          key={`gallery-dot-${index}`}
                          type="button"
                          aria-label={`Go to image ${index + 1}`}
                          aria-current={index === activeImageIndex ? 'true' : undefined}
                          onClick={() => setActiveImageIndex(index)}
                          className={`rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition-all cursor-pointer ${
                            index === activeImageIndex
                              ? 'bg-white w-2.5 h-2.5 scale-110'
                              : 'bg-white/70 hover:bg-white w-2 h-2'
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                {hasMultipleImages ? (
                  <div className="gap-2.5 grid grid-cols-4 sm:grid-cols-5">
                    {galleryImages.map((imageUrl, index) => (
                      <button
                        key={`gallery-thumbnail-${index}`}
                        type="button"
                        aria-label={`View thumbnail image ${index + 1}`}
                        aria-current={index === activeImageIndex ? 'true' : undefined}
                        onClick={() => setActiveImageIndex(index)}
                        className={`group relative border rounded-xl overflow-hidden aspect-square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition-all duration-200 cursor-pointer ${
                          index === activeImageIndex
                            ? 'border-emerald-500 ring-2 ring-emerald-300/70'
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt={`${plant.common_name} thumbnail ${index + 1}`}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${color.bg} border ${color.border}`}
              >
                <Leaf className={`w-16 h-16 ${color.text} opacity-60`} />
                <span className={`mt-2 text-sm font-medium ${color.text} opacity-70`}>{plant.common_name}</span>
              </div>
            )}

            {plant.aka_names.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold text-gray-400 text-xs uppercase tracking-wider">Also known as</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.aka_names.map((name) => (
                    <span
                      key={name}
                      className="bg-white px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 text-xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 md:col-span-2">
            <div>
              <h1 className="font-bold text-gray-900 text-3xl">{plant.common_name}</h1>
              <p className="mt-1 text-gray-400 text-lg italic">{plant.scientific_name}</p>
            </div>

            <div className={`flex items-center gap-4 p-5 rounded-xl border ${color.bg} ${color.border}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.text} bg-white/60`}>
                <StatusIcon status={displaySafetyStatus} />
              </div>
              <div>
                <div className={`text-lg font-bold ${color.text}`}>{getStatusLabel(displaySafetyStatus)}</div>
                <div className={`text-sm ${color.text} opacity-80`}>
                  {displaySafetyStatus === 'non_toxic'
                    ? 'This plant is currently regarded as non-toxic to cats, but individual reactions can vary. Monitor your cat around any new plant.'
                    : displaySafetyStatus === 'unknown'
                      ? isEvidenceIncomplete
                        ? 'Evidence is incomplete for this plant because required source citations are missing. Treat safety as unknown and use caution.'
                        : 'Toxicity data is not yet available for this plant. Exercise caution.'
                      : 'This plant is reported to pose a risk to cats. Keep it out of reach or choose an alternative.'}
                </div>
                {isEvidenceIncomplete ? (
                  <div className="inline-flex items-center bg-amber-100 mt-2 px-2 py-0.5 border border-amber-200 rounded-full text-amber-800 text-xs">
                    Evidence incomplete
                  </div>
                ) : null}
              </div>
            </div>

            {isToxic && hasToxicDetailContent && (
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                {plant.symptoms && (
                  <div className="p-5 border-gray-100 border-b">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-4 h-4 text-rose-500" />
                      <h3 className="font-semibold text-gray-900 text-sm">Symptoms</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{plant.symptoms}</p>
                  </div>
                )}
                {plant.toxic_parts && (
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="w-4 h-4 text-rose-500" />
                      <h3 className="font-semibold text-gray-900 text-sm">Toxic Parts</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{plant.toxic_parts}</p>
                  </div>
                )}
              </div>
            )}

            <section className="bg-white shadow-sm p-5 border border-gray-200 rounded-xl">
              <h2 className="font-bold text-gray-900 text-lg">Evidence</h2>
              {plant.citations.length > 0 ? (
                <ul className="space-y-3 mt-3">
                  {plant.citations.map((citation) => (
                    <li
                      key={`${citation.source_name}-${citation.source_url}`}
                      className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 bg-gray-50 p-3 border border-gray-100 rounded-lg"
                    >
                      <span className="font-medium text-gray-800 text-sm">{citation.source_name}</span>
                      <a
                        href={citation.source_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-medium text-emerald-700 hover:text-emerald-800 text-sm underline underline-offset-2"
                      >
                        Open source
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  We do not currently have a required source citation for this plant, so this record is considered
                  incomplete.
                </p>
              )}
            </section>

            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <p className="text-amber-900 text-sm leading-relaxed">
                This information is for educational purposes only and is not a substitute for professional veterinary
                care. If your cat may have ingested a toxic plant, contact your veterinarian or an emergency animal
                poison service immediately.
              </p>
            </div>

            {isToxic && alternatives.length > 0 && (
              <div>
                <h2 className="mb-3 font-bold text-gray-900 text-lg">Safe Alternatives</h2>
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
                  {alternatives.map((alt) => {
                    const altDisplayStatus = getDisplaySafetyStatus(alt);
                    const altColor = getStatusColor(altDisplayStatus);
                    return (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => onSelectPlant(alt.id)}
                        className="group bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 hover:border-emerald-200 rounded-xl text-left transition-all cursor-pointer"
                      >
                        {alt.primary_image_url ? (
                          <Image
                            src={alt.primary_image_url}
                            alt={`${alt.common_name} photo`}
                            width={320}
                            height={240}
                            className="mb-3 rounded-lg w-full object-cover aspect-4/3 group-hover:scale-[1.02] transition-transform"
                            unoptimized
                          />
                        ) : (
                          <div
                            className={`w-full aspect-4/3 rounded-lg flex items-center justify-center mb-3 ${altColor.bg} group-hover:scale-[1.02] transition-transform`}
                            data-testid={`alternative-placeholder-${alt.id}`}
                            aria-hidden="true"
                          >
                            <Leaf className={`w-8 h-8 ${altColor.text} opacity-60`} />
                          </div>
                        )}
                        <div className="font-medium text-gray-900 text-sm">{alt.common_name}</div>
                        <div className="text-gray-400 text-xs italic">{alt.scientific_name}</div>
                        <span
                          className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${altColor.bg} ${altColor.text} border ${altColor.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${altColor.dot}`} />
                          {getStatusLabel(altDisplayStatus)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
