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
      <div className="home-editorial-shell relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/78 via-slate-100/90 to-slate-100" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-transparent to-slate-100/85" aria-hidden="true" />
        <div className="-top-20 -right-14 absolute bg-emerald-100/55 blur-3xl rounded-full w-64 h-64 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader
            pathname={pathname}
            onGoHome={onBack}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel="Back to Search"
          />
          <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white/95 px-4 py-3 text-slate-600 text-sm shadow-sm backdrop-blur">
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
      <div className="home-editorial-shell relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/78 via-slate-100/90 to-slate-100" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-transparent to-slate-100/85" aria-hidden="true" />
        <div className="-top-20 -right-14 absolute bg-emerald-100/55 blur-3xl rounded-full w-64 h-64 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader
            pathname={pathname}
            onGoHome={onBack}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel="Back to Search"
          />
          <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
            <div role="alert" className="w-full max-w-md rounded-3xl border border-rose-200 bg-white/95 p-6 text-center shadow-xl backdrop-blur">
              <div className="inline-flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
              <button
                type="button"
                onClick={() => void fetchPlants()}
                className="mx-auto mt-4 block cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
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
      <div className="home-editorial-shell relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/78 via-slate-100/90 to-slate-100" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-transparent to-slate-100/85" aria-hidden="true" />
        <div className="-top-20 -right-14 absolute bg-emerald-100/55 blur-3xl rounded-full w-64 h-64 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader
            pathname={pathname}
            onGoHome={onBack}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel="Back to Search"
          />
          <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl backdrop-blur">
              <p className="text-slate-500 text-2xl">Plant not found.</p>
              <p className="mt-2 text-slate-600 text-sm">Try searching the directory or return to home search.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 text-sm transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Back to Search
                </button>
                <button
                  type="button"
                  onClick={goDirectory}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 text-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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
    <div className="home-editorial-shell relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100/78 via-slate-100/90 to-slate-100" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-transparent to-slate-100/85" aria-hidden="true" />
      <div className="-top-20 -right-14 absolute bg-emerald-100/55 blur-3xl rounded-full w-64 h-64 pointer-events-none" aria-hidden="true" />
      <div className="-bottom-20 -left-14 absolute bg-slate-200/55 blur-3xl rounded-full w-64 h-64 pointer-events-none" aria-hidden="true" />
      <p className="top-36 right-0 absolute hidden xl:block font-semibold text-emerald-200/65 text-xs uppercase tracking-[0.46em] rotate-90 select-none" aria-hidden="true">
        Species Brief
      </p>

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader
          pathname={pathname}
          onGoHome={onBack}
          onGoDirectory={goDirectory}
          onGoBack={onBack}
          backLabel="Back to Search"
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-9">
          <header className="mb-6 sm:mb-8">
            <p className="font-semibold text-emerald-700 text-xs uppercase tracking-[0.2em]">Plant Safety Profile</p>
            <h1 className="mt-1 font-semibold text-slate-900 text-3xl sm:text-4xl tracking-tight">{plant.common_name}</h1>
            <p className="mt-1 text-slate-600 text-sm sm:text-lg italic">{plant.scientific_name}</p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8">
            <aside className="space-y-4">
              <div
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/88 shadow-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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
                    className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-900/50 text-white shadow-md transition-colors hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                ) : null}

                {hasMultipleImages && !isLastImage ? (
                  <button
                    type="button"
                    onClick={goToNextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-900/50 text-white shadow-md transition-colors hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : null}

                {hasMultipleImages ? (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/30 bg-black/25 px-2.5 py-1.5">
                    {galleryImages.map((_, index) => (
                      <button
                        key={`gallery-dot-${index}`}
                        type="button"
                        aria-label={`Go to image ${index + 1}`}
                        aria-current={index === activeImageIndex ? 'true' : undefined}
                        onClick={() => setActiveImageIndex(index)}
                        className={`cursor-pointer rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                          index === activeImageIndex ? 'bg-white w-2.5 h-2.5 scale-110' : 'bg-white/70 hover:bg-white w-2 h-2'
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {hasMultipleImages ? (
                <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                  {galleryImages.map((imageUrl, index) => (
                    <button
                      key={`gallery-thumbnail-${index}`}
                      type="button"
                      aria-label={`View thumbnail image ${index + 1}`}
                      aria-current={index === activeImageIndex ? 'true' : undefined}
                      onClick={() => setActiveImageIndex(index)}
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
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
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              {plant.aka_names.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
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
              <div className={`rounded-2xl border bg-white/92 p-5 shadow-sm backdrop-blur ${color.border}`}>
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
                      <div className="mt-3 inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-amber-800 text-xs">
                        Evidence incomplete
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {isToxic && hasToxicDetailContent ? (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/92 shadow-sm backdrop-blur">
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

              <section className="rounded-2xl border border-slate-200 bg-white/92 p-5 shadow-sm backdrop-blur">
                <h2 className="font-semibold text-slate-900 text-lg tracking-tight">Evidence</h2>
                {plant.citations.length > 0 ? (
                  <ul className="space-y-3 mt-3">
                    {plant.citations.map((citation) => (
                      <li
                        key={`${citation.source_name}-${citation.source_url}`}
                        className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
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

              <section className="rounded-2xl border border-amber-200 bg-amber-50/85 p-4">
                <p className="text-amber-900 text-sm leading-relaxed">
                  This information is for educational purposes only and is not a substitute for professional veterinary
                  care. If your cat may have ingested a toxic plant, contact your veterinarian or an emergency animal
                  poison service immediately.
                </p>
              </section>

              {isToxic && alternatives.length > 0 ? (
                <section>
                  <h2 className="mb-3 font-semibold text-slate-900 text-lg tracking-tight">Safe Alternatives</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {alternatives.map((alt) => {
                      const altDisplayStatus = getDisplaySafetyStatus(alt);
                      return (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => onSelectPlant(alt.id)}
                          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white/90 p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                          <PlantImage
                            src={alt.primary_image_url}
                            alt={`${alt.common_name} photo`}
                            status={altDisplayStatus}
                            width={320}
                            height={240}
                            loading="lazy"
                            className="mb-3 rounded-xl w-full aspect-[4/3]"
                            imageClassName="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
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
