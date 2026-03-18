'use client';

import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  HelpCircle,
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
import { SkeletonDetailContent, Skeleton } from '@/src/components/ui/skeleton';

interface DetailViewProps {
  plantId: string;
  onBack: () => void;
  onSelectPlant: (id: string) => void;
  onGoHome?: () => void;
  onGoDirectory?: () => void;
  backLabel?: string;
}

function StatusIcon({ status }: { status: SafetyStatus }) {
  switch (status) {
    case 'non_toxic':
      return <ShieldCheck className="h-5 w-5" />;
    case 'mildly_toxic':
      return <AlertTriangle className="h-5 w-5" />;
    case 'highly_toxic':
      return <ShieldAlert className="h-5 w-5" />;
    case 'unknown':
      return <HelpCircle className="h-5 w-5" />;
  }
}

export function DetailView({
  plantId,
  onBack,
  onSelectPlant,
  onGoHome,
  onGoDirectory,
  backLabel = 'Back',
}: DetailViewProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const goDirectory = onGoDirectory ?? onBack;
  const goHome = onGoHome ?? (() => {});

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

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100/84 via-stone-100/76 to-stone-100" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/32 via-transparent to-amber-100/26" aria-hidden="true" />
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader
            pathname={pathname}
            onGoHome={goHome}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel={backLabel}
            activeNav="none"
          />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-9">
            {/* Skeleton header */}
            <header className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end animate-fade-up motion-reduce:animate-none">
              <div>
                <Skeleton className="h-3 w-36 rounded-lg" />
                <Skeleton className="mt-3 h-12 w-72 rounded-xl sm:h-14" />
                <Skeleton className="mt-3 h-5 w-48 rounded-lg" />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Skeleton className="h-7 w-28 rounded-full" />
                </div>
              </div>
              <div className="botanical-card w-full max-w-sm rounded-[1.6rem] p-4">
                <Skeleton className="h-3 w-28 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-full rounded-lg" />
                <Skeleton className="mt-1.5 h-4 w-3/4 rounded-lg" />
              </div>
            </header>

            {/* Skeleton content */}
            <SkeletonDetailContent />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100/84 via-stone-100/76 to-stone-100" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/32 via-transparent to-amber-100/26" aria-hidden="true" />
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader
            pathname={pathname}
            onGoHome={goHome}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel={backLabel}
            activeNav="none"
          />
          <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
            <div role="alert" className="botanical-card-strong w-full max-w-md rounded-3xl border border-rose-200 p-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
              <button
                type="button"
                onClick={() => void fetchPlants()}
                className="mx-auto mt-4 block cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
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
      <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100/84 via-stone-100/76 to-stone-100" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/32 via-transparent to-amber-100/26" aria-hidden="true" />
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader
            pathname={pathname}
            onGoHome={goHome}
            onGoDirectory={goDirectory}
            onGoBack={onBack}
            backLabel={backLabel}
            activeNav="none"
          />
          <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
            <div className="botanical-card-strong w-full max-w-lg rounded-3xl p-8 text-center">
              <p className="font-display text-3xl text-slate-900">Plant not found.</p>
              <p className="mt-2 text-sm text-slate-600">Try searching the directory or return to the homepage lookup.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  {backLabel}
                </button>
                <button
                  type="button"
                  onClick={goDirectory}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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
    <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/84 via-stone-100/76 to-stone-100" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/32 via-transparent to-amber-100/26" aria-hidden="true" />
      <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" aria-hidden="true" />
      <p className="absolute right-0 top-36 hidden rotate-90 select-none text-[11px] font-semibold uppercase tracking-[0.46em] text-emerald-300/80 xl:block" aria-hidden="true">
        Species brief
      </p>

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader
          pathname={pathname}
          onGoHome={goHome}
          onGoDirectory={goDirectory}
          onGoBack={onBack}
          backLabel={backLabel}
          activeNav="none"
        />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-9">
          <header className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="editorial-kicker text-[11px] font-semibold text-emerald-700">Plant safety profile</p>
              <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {plant.common_name}
              </h1>
              <p className="mt-2 text-base italic text-slate-600 sm:text-lg">{plant.scientific_name}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <SafetyBadge status={displaySafetyStatus} />
                {isEvidenceIncomplete ? (
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                    Evidence incomplete
                  </span>
                ) : null}
              </div>
            </div>
            <div className="botanical-card w-full max-w-sm rounded-[1.6rem] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quick guidance</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {displaySafetyStatus === 'non_toxic'
                  ? 'Considered non-toxic to cats, but supervision around new plants is still wise.'
                  : displaySafetyStatus === 'unknown'
                    ? 'Reliable toxicity evidence is incomplete or unavailable. Treat with caution.'
                    : 'This plant is associated with cat toxicity. Keep it out of reach or choose a safer substitute.'}
              </p>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 animate-fade-up-soft motion-reduce:animate-none" style={{ animationDelay: '80ms' }}>
            <aside className="space-y-4">
              <div
                className="botanical-card-strong relative overflow-hidden rounded-[1.8rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 animate-scale-in motion-reduce:animate-none"
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
                  className="aspect-square w-full"
                  imageClassName="h-full w-full object-cover"
                />

                {hasMultipleImages && !isFirstImage ? (
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-900/50 text-white shadow-md transition-colors hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                ) : null}

                {hasMultipleImages && !isLastImage ? (
                  <button
                    type="button"
                    onClick={goToNextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-900/50 text-white shadow-md transition-colors hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <ChevronRight className="h-5 w-5" />
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
                        className={`rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                          index === activeImageIndex ? 'h-2.5 w-2.5 scale-110 bg-white' : 'h-2 w-2 cursor-pointer bg-white/70 hover:bg-white'
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
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-[1rem] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                        index === activeImageIndex
                          ? 'border-emerald-500 ring-2 ring-emerald-300/70'
                          : 'border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${plant.common_name} thumbnail ${index + 1}`}
                        width={120}
                        height={120}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              {plant.aka_names.length > 0 ? (
                <div className="botanical-card rounded-[1.5rem] p-4">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Also known as</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plant.aka_names.map((name) => (
                      <span key={name} className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-slate-600">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>

            <section className="space-y-4 sm:space-y-5">
              <div className={`botanical-card-strong rounded-[1.8rem] border p-5 ${color.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color.bg} ${color.text}`}>
                    <StatusIcon status={displaySafetyStatus} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Risk summary</p>
                    <div className="mt-2">
                      <SafetyBadge status={displaySafetyStatus} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {displaySafetyStatus === 'non_toxic'
                        ? 'This plant is currently regarded as non-toxic to cats, but individual reactions can vary. Monitor your cat around any new plant.'
                        : displaySafetyStatus === 'unknown'
                          ? isEvidenceIncomplete
                            ? 'Evidence is incomplete for this plant because required source citations are missing. Treat safety as unknown and use caution.'
                            : 'Toxicity data is not yet available for this plant. Exercise caution.'
                          : 'This plant is reported to pose a risk to cats. Keep it out of reach or choose an alternative.'}
                    </p>
                  </div>
                </div>
              </div>

              {isToxic && hasToxicDetailContent ? (
                <section className="botanical-card overflow-hidden rounded-[1.7rem]">
                  {plant.symptoms ? (
                    <div className="border-b border-stone-100 p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-rose-500" />
                        <h2 className="font-semibold text-slate-900 text-sm">Symptoms</h2>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{plant.symptoms}</p>
                    </div>
                  ) : null}
                  {plant.toxic_parts ? (
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-rose-500" />
                        <h2 className="font-semibold text-slate-900 text-sm">Toxic Parts</h2>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{plant.toxic_parts}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="botanical-card rounded-[1.7rem] p-5">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">Evidence</h2>
                <p className="mt-1 text-sm text-slate-600">Reference links used to support the current safety label.</p>
                {plant.citations.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {plant.citations.map((citation) => (
                      <li
                        key={`${citation.source_name}-${citation.source_url}`}
                        className="flex flex-col gap-2 rounded-[1rem] border border-stone-200 bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-sm font-medium text-slate-800">{citation.source_name}</span>
                        <a
                          href={citation.source_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="rounded-sm text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                          Open source
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    We do not currently have a required source citation for this plant, so this record is considered incomplete.
                  </p>
                )}
              </section>

              <section className="rounded-[1.6rem] border border-amber-200 bg-amber-50/85 p-4">
                <p className="text-sm leading-relaxed text-amber-900">
                  This information is for educational purposes only and is not a substitute for professional veterinary care. If your cat may have ingested a toxic plant, contact your veterinarian or an emergency animal poison service immediately.
                </p>
              </section>

              {isToxic && alternatives.length > 0 ? (
                <section>
                  <div className="mb-3">
                    <p className="editorial-kicker text-[11px] font-semibold text-emerald-700">Safer swap</p>
                    <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-slate-900">Safe alternatives</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {alternatives.map((alt) => {
                      const altDisplayStatus = getDisplaySafetyStatus(alt);
                      return (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => onSelectPlant(alt.id)}
                          className="group botanical-card-strong cursor-pointer rounded-[1.5rem] p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                          <PlantImage
                            src={alt.primary_image_url}
                            alt={`${alt.common_name} photo`}
                            status={altDisplayStatus}
                            width={320}
                            height={240}
                            loading="lazy"
                            className="mb-3 aspect-[4/3] w-full rounded-[1rem]"
                            imageClassName="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                            placeholderTestId={`alternative-placeholder-${alt.id}`}
                          />
                          <div className="text-sm font-medium text-slate-900">{alt.common_name}</div>
                          <div className="truncate text-xs italic text-slate-500">{alt.scientific_name}</div>
                          <SafetyBadge status={altDisplayStatus} className="mt-2" compact />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </section>
          </div>

          {/* Scroll to top button */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-slate-600 shadow-lg backdrop-blur transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${showScrollTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </main>
      </div>
    </div>
  );
}
