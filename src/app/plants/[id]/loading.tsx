import { SiteHeader } from '@/src/components/ui/site-header';
import { SiteFooter } from '@/src/components/ui/site-footer';
import { Skeleton, SkeletonDetailContent } from '@/src/components/ui/skeleton';

export default function PlantDetailLoading() {
  return (
    <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/84 via-stone-100/76 to-stone-100" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/32 via-transparent to-amber-100/26" aria-hidden="true" />
      <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader
          pathname="/plants"
          onGoHome={() => {}}
          onGoDirectory={() => {}}
          onGoBack={() => {}}
          backLabel="Back"
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
        <SiteFooter />
      </div>
    </div>
  );
}
