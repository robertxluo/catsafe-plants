import { Suspense } from 'react';
import { PlantsDirectoryView } from '@/src/components/plants-directory-view';

export default function PlantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center bg-yellow-50 min-h-screen">
          <div className="text-gray-600 text-sm">Loading plants...</div>
        </div>
      }
    >
      <PlantsDirectoryView />
    </Suspense>
  );
}
