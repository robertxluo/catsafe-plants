import { Suspense } from 'react';
import { PlantsDirectoryView } from '@/src/components/plants-directory-view';

export default function PlantsPage() {
  return (
    <Suspense
      fallback={
        <div className="home-editorial-shell botanical-page relative flex min-h-screen items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100/86 via-stone-100/70 to-stone-100/96" aria-hidden="true" />
          <div className="botanical-card relative z-10 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-600 animate-fade-up-soft">
            Loading plants...
          </div>
        </div>
      }
    >
      <PlantsDirectoryView />
    </Suspense>
  );
}
