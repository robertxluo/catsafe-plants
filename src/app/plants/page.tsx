import { Suspense } from 'react';
import { PlantsDirectoryView } from '@/src/components/plants-directory-view';
import { SiteFooter } from '@/src/components/ui/site-footer';

export default function PlantsPage() {
  return (
    <Suspense
      fallback={
        <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100/86 via-stone-100/70 to-stone-100/96" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/28 via-transparent to-amber-100/32" aria-hidden="true" />
          <div className="relative z-10 flex min-h-screen flex-col">
            <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
              <div className="botanical-card inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-600 animate-fade-up-soft">
                Loading plants...
              </div>
            </main>
            <SiteFooter />
          </div>
        </div>
      }
    >
      <PlantsDirectoryView />
    </Suspense>
  );
}
