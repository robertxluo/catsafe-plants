'use client';

import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/src/components/ui/site-header';
import { SiteFooter } from '@/src/components/ui/site-footer';
import { Skeleton, SkeletonCard } from '@/src/components/ui/skeleton';

export default function PlantsDirectoryLoading() {
  const router = useRouter();

  return (
    <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/86 via-stone-100/70 to-stone-100/96" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/28 via-transparent to-amber-100/32" aria-hidden="true" />
      <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-amber-100/45 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader
          pathname="/plants"
          onGoHome={() => router.push('/')}
          onGoDirectory={() => router.push('/plants')}
          activeNav="directory"
        />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-9">
          {/* Page header */}
          <header className="mb-4 grid gap-4 sm:mb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="editorial-kicker hidden text-[11px] font-semibold text-emerald-700 sm:block">Curated for cat safety</p>
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:mt-2 sm:text-5xl">
                Plant directory
              </h1>
              <p className="mt-1 hidden max-w-2xl text-sm leading-relaxed text-slate-700 sm:mt-2 sm:block sm:text-base">
                Browse the catalog, filter by risk and flower color, and move from search to confident decisions without guesswork.
              </p>
            </div>
          </header>

          {/* Skeleton search bar area */}
          <section className="botanical-card-strong mb-4 rounded-[1.9rem] px-4 py-3 sm:px-5 sm:py-3.5 animate-fade-up-soft">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)] lg:items-start">
              <div className="max-w-3xl">
                <Skeleton className="h-3 w-28 rounded-lg" />
                <Skeleton className="mt-3 h-8 w-64 rounded-xl" />
                <Skeleton className="mt-3 h-4 w-full max-w-md rounded-lg" />
                <Skeleton className="mt-4 h-12 w-full rounded-[1.5rem]" />
              </div>
              <div className="rounded-[1.5rem] border border-stone-200/90 bg-white/70 p-4">
                <Skeleton className="h-3 w-24 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-full rounded-lg" />
                <Skeleton className="mt-1.5 h-4 w-3/4 rounded-lg" />
              </div>
            </div>
            <div className="mt-4 border-t border-stone-200/80 pt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Skeleton className="mb-2 h-3 w-16 rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={`saf-skel-${i}`} className="h-10 rounded-full" />
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="mb-2 h-3 w-24 rounded-lg" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={`clr-skel-${i}`} className="h-10 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skeleton result count */}
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="mt-1.5 h-3 w-56 rounded-lg" />
            </div>
          </div>

          {/* Skeleton card grid */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`dir-skel-${i}`} />
            ))}
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
