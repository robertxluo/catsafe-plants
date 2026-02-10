import { LoaderCircle } from 'lucide-react';

export default function PlantDetailLoading() {
  return (
    <div className="flex justify-center items-center bg-yellow-50 min-h-screen">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <LoaderCircle className="w-4 h-4 animate-spin" />
        Loading plant details...
      </div>
    </div>
  );
}
