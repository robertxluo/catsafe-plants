import { Suspense } from 'react';
import { PlantsDirectoryView } from '@/src/components/plants-directory-view';

export default function PlantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
          <div className="bg-white/90 shadow-sm px-4 py-3 border border-white rounded-2xl text-slate-600 text-sm">
            Loading plants...
          </div>
        </div>
      }
    >
      <PlantsDirectoryView />
    </Suspense>
  );
}
