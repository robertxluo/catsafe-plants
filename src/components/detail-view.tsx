'use client';

import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import Image from 'next/image';
import type { Plant, SafetyStatus } from '@/src/lib/plants';
import { getDisplaySafetyStatus, getStatusColor, hasIncompleteEvidence } from '@/src/lib/plants';
import { loadPlants } from '@/src/lib/load-plants';
import { PlantImage } from '@/src/components/ui/plant-image';
import { SafetyBadge } from '@/src/components/ui/safety-badge';
import { SiteHeader } from '@/src/components/ui/site-header';

interface DetailViewProps {
  plantId: string;
  onBack: () => void;
  onSelectPlant: (id: string) => void;
  onGoDirectory?: () => void;
}

function StatusIcon({ status }: { status: SafetyStatus }) {
  switch (status) {
    case 'non_toxic':
      return <ShieldCheck className="w-5 h-5" />;
    case 'mildly_toxic':
      return <AlertTriangle className="w-5 h-5" />;
    case 'highly_toxic':
      return <ShieldAlert className="w-5 h-5" />;
    case 'unknown':
      return <HelpCircle className="w-5 h-5" />;
  }
}

export function DetailView({ plantId, onBack, onSelectPlant, onGoDirectory }: DetailViewProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const goDirectory = onGoDirectory ?? onBack;

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

  const pathname = plantId ? `/plants/${plantId}` : '/plants';

  if (isLoading) {
    return (
      <div className="relative bg-slate-100 min-h-screen overflow-hidden text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-100 to-emerald-50/40" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 via-transparent to-slate-100/30" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <SiteHeader
            pathname={pathname}
            onGoHome={onBack}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel="Back to Search"
          />
          <main className="flex flex-1 justify-center items-center px-4 sm:px-6">
            <div className="inline-flex items-center gap-2 bg-white/95 shadow-sm backdrop-blur px-4 py-3 border border-white rounded-2xl text-slate-600 text-sm">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Loading plant details...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-slate-100 min-h-screen overflow-hidden text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-100 to-emerald-50/40" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 via-transparent to-slate-100/30" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <SiteHeader
            pathname={pathname}
            onGoHome={onBack}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel="Back to Search"
          />
          <main className="flex flex-1 justify-center items-center px-4 sm:px-6">
            <div role="alert" className="bg-white/95 shadow-xl backdrop-blur p-6 border border-rose-200 rounded-3xl w-full max-w-md text-center">
              <div className="inline-flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
              <button
                type="button"
                onClick={() => void fetchPlants()}
                className="block bg-rose-50 hover:bg-rose-100 mx-auto mt-4 px-3 py-2 border border-rose-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 text-rose-700 text-sm transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="relative bg-slate-100 min-h-screen overflow-hidden text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-100 to-emerald-50/40" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 via-transparent to-slate-100/30" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <SiteHeader
            pathname={pathname}
            onGoHome={onBack}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel="Back to Search"
          />
          <main className="flex flex-1 justify-center items-center px-4 sm:px-6">
            <div className="bg-white/95 shadow-xl backdrop-blur p-8 border border-slate-200 rounded-3xl w-full max-w-lg text-center">
              <p className="text-slate-500 text-2xl">Plant not found.</p>
              <p className="mt-2 text-slate-600 text-sm">Try searching the directory or return to home search.</p>
              <div className="flex sm:flex-row flex-col justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex justify-center items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 border border-emerald-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-emerald-700 text-sm transition-colors cursor-pointer"
                >
                  Back to Search
                </button>
                <button
                  type="button"
                  onClick={goDirectory}
                  className="inline-flex justify-center items-center gap-1.5 bg-white hover:bg-slate-50 px-4 py-2 border border-slate-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-slate-700 text-sm transition-colors cursor-pointer"
                >
                  Open Directory
                </button>
              </div>
            </div>
          </main>
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
  const hasMultipleImages = galleryImages.length > 1;
  const isFirstImage = activeImageIndex === 0;
  const isLastImage = activeImageIndex === galleryImages.length - 1;
  const visibleImage = galleryImages[activeImageIndex] ?? null;
  const galleryImageTotal = Math.max(galleryImages.length, 1);

  function goToPreviousImage() {
    setActiveImageIndex((current) => Math.max(0, current - 1));
  }

  function goToNextImage() {
    setActiveImageIndex((current) => Math.min(galleryImages.length - 1, current + 1));
  }

  function handleCarouselKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft' && !isFirstImage) {
      event.preventDefault();
      goToPreviousImage();
    }

    if (event.key === 'ArrowRight' && !isLastImage) {
      event.preventDefault();
      goToNextImage();
    }
  }

  return (
    <div className="relative bg-slate-100 min-h-screen overflow-hidden text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-100 to-emerald-50/40" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 via-transparent to-slate-100/30" aria-hidden="true" />
      <div className="-top-24 -right-16 absolute bg-emerald-100/60 blur-3xl rounded-full w-72 h-72 pointer-events-none" aria-hidden="true" />
      <div className="-bottom-24 -left-16 absolute bg-slate-200/60 blur-3xl rounded-full w-72 h-72 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader
          pathname={pathname}
          onGoHome={onBack}
          onGoDirectory={goDirectory}
          onGoBack={onBack}
          backLabel="Back to Search"
        />

        <main className="flex-1 mx-auto px-4 sm:px-6 pt-7 sm:pt-9 pb-8 sm:pb-10 w-full max-w-6xl">
          <header className="mb-6 sm:mb-8">
            <p className="font-semibold text-emerald-700 text-xs uppercase tracking-[0.18em]">Plant Safety Profile</p>
            <h1 className="mt-1 font-semibold text-slate-900 text-3xl sm:text-4xl tracking-tight">{plant.common_name}</h1>
            <p className="mt-1 text-slate-600 text-sm sm:text-lg italic">{plant.scientific_name}</p>
          </header>

          <div className="gap-6 lg:gap-8 grid lg:grid-cols-[0.94fr_1.06fr]">
            <aside className="space-y-4">
              <div
                className="relative rounded-2xl border border-slate-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                tabIndex={0}
                onKeyDown={handleCarouselKeyDown}
                aria-label={`${plant.common_name} image carousel`}
              >
                <PlantImage
                  src={visibleImage}
                  alt={`${plant.common_name} photo ${activeImageIndex + 1} of ${galleryImageTotal}`}
                  status={displaySafetyStatus}
                  fallbackLabel={plant.common_name}
                  width={900}
                  height={900}
                  loading="eager"
                  fetchPriority="high"
                  priority
                  className="w-full aspect-square"
                  imageClassName="w-full h-full object-cover"
                />

                {hasMultipleImages && !isFirstImage ? (
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    aria-label="Previous image"
                    className="top-1/2 left-3 absolute z-10 flex justify-center items-center bg-slate-900/50 hover:bg-slate-900/70 shadow-md border border-white/20 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 w-10 h-10 text-white transition-colors -translate-y-1/2 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                ) : null}

                {hasMultipleImages && !isLastImage ? (
                  <button
                    type="button"
                    onClick={goToNextImage}
                    aria-label="Next image"
                    className="top-1/2 right-3 absolute z-10 flex justify-center items-center bg-slate-900/50 hover:bg-slate-900/70 shadow-md border border-white/20 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 w-10 h-10 text-white transition-colors -translate-y-1/2 cursor-pointer"
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
                          index === activeImageIndex ? 'bg-white w-2.5 h-2.5 scale-110' : 'bg-white/70 hover:bg-white w-2 h-2'
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
                        loading="lazy"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              {plant.aka_names.length > 0 ? (
                <div className="bg-white/90 shadow-sm backdrop-blur p-4 border border-slate-200 rounded-2xl">
                  <h2 className="mb-2 font-semibold text-slate-500 text-xs uppercase tracking-[0.14em]">Also known as</h2>
                  <div className="flex flex-wrap gap-2">
                    {plant.aka_names.map((name) => (
                      <span key={name} className="bg-white px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 text-xs">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>

            <section className="space-y-4 sm:space-y-5">
              <div className={`bg-white/92 shadow-sm backdrop-blur p-5 border rounded-2xl ${color.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex justify-center items-center rounded-full w-10 h-10 shrink-0 ${color.bg} ${color.text}`}>
                    <StatusIcon status={displaySafetyStatus} />
                  </div>
                  <div className="min-w-0">
                    <SafetyBadge status={displaySafetyStatus} />
                    <p className="mt-2 text-slate-700 text-sm leading-relaxed">
                      {displaySafetyStatus === 'non_toxic'
                        ? 'This plant is currently regarded as non-toxic to cats, but individual reactions can vary. Monitor your cat around any new plant.'
                        : displaySafetyStatus === 'unknown'
                          ? isEvidenceIncomplete
                            ? 'Evidence is incomplete for this plant because required source citations are missing. Treat safety as unknown and use caution.'
                            : 'Toxicity data is not yet available for this plant. Exercise caution.'
                          : 'This plant is reported to pose a risk to cats. Keep it out of reach or choose an alternative.'}
                    </p>
                    {isEvidenceIncomplete ? (
                      <div className="inline-flex items-center bg-amber-100 mt-3 px-2 py-0.5 border border-amber-200 rounded-full text-amber-800 text-xs">
                        Evidence incomplete
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {isToxic && hasToxicDetailContent ? (
                <section className="bg-white/92 shadow-sm backdrop-blur border border-slate-200 rounded-2xl overflow-hidden">
                  {plant.symptoms ? (
                    <div className="p-5 border-slate-100 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="w-4 h-4 text-rose-500" />
                        <h2 className="font-semibold text-slate-900 text-sm">Symptoms</h2>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{plant.symptoms}</p>
                    </div>
                  ) : null}
                  {plant.toxic_parts ? (
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <FlaskConical className="w-4 h-4 text-rose-500" />
                        <h2 className="font-semibold text-slate-900 text-sm">Toxic Parts</h2>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{plant.toxic_parts}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="bg-white/92 shadow-sm backdrop-blur p-5 border border-slate-200 rounded-2xl">
                <h2 className="font-semibold text-slate-900 text-lg tracking-tight">Evidence</h2>
                {plant.citations.length > 0 ? (
                  <ul className="space-y-3 mt-3">
                    {plant.citations.map((citation) => (
                      <li
                        key={`${citation.source_name}-${citation.source_url}`}
                        className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 bg-slate-50 p-3 border border-slate-100 rounded-xl"
                      >
                        <span className="font-medium text-slate-800 text-sm">{citation.source_name}</span>
                        <a
                          href={citation.source_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-sm text-sm underline underline-offset-2"
                        >
                          Open source
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                    We do not currently have a required source citation for this plant, so this record is considered
                    incomplete.
                  </p>
                )}
              </section>

              <section className="bg-amber-50/85 p-4 border border-amber-200 rounded-2xl">
                <p className="text-amber-900 text-sm leading-relaxed">
                  This information is for educational purposes only and is not a substitute for professional veterinary
                  care. If your cat may have ingested a toxic plant, contact your veterinarian or an emergency animal
                  poison service immediately.
                </p>
              </section>

              {isToxic && alternatives.length > 0 ? (
                <section>
                  <h2 className="mb-3 font-semibold text-slate-900 text-lg tracking-tight">Safe Alternatives</h2>
                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {alternatives.map((alt) => {
                      const altDisplayStatus = getDisplaySafetyStatus(alt);
                      return (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => onSelectPlant(alt.id)}
                          className="group bg-white/90 hover:bg-white shadow-sm hover:shadow-md p-3 border border-slate-200 hover:border-emerald-200 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 text-left transition-all duration-200 cursor-pointer"
                        >
                          <PlantImage
                            src={alt.primary_image_url}
                            alt={`${alt.common_name} photo`}
                            status={altDisplayStatus}
                            width={320}
                            height={240}
                            loading="lazy"
                            className="mb-3 rounded-xl w-full aspect-[4/3]"
                            imageClassName="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                            placeholderTestId={`alternative-placeholder-${alt.id}`}
                          />
                          <div className="font-medium text-slate-900 text-sm">{alt.common_name}</div>
                          <div className="text-slate-500 text-xs italic truncate">{alt.scientific_name}</div>
                          <SafetyBadge status={altDisplayStatus} className="mt-2" compact />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
