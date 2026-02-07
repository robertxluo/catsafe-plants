'use client';

import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Leaf,
  Stethoscope,
  FlaskConical,
} from 'lucide-react';
import type { Plant } from '@/src/lib/plants';
import { getPlantById, getStatusColor, getStatusLabel } from '@/src/lib/plants';

interface DetailViewProps {
  plantId: string;
  onBack: () => void;
  onSelectPlant: (id: string) => void;
}

function StatusIcon({ status }: { status: Plant['safety_status'] }) {
  switch (status) {
    case 'non_toxic':
      return <ShieldCheck className="w-6 h-6" />;
    case 'mildly_toxic':
      return <AlertTriangle className="w-6 h-6" />;
    case 'highly_toxic':
      return <ShieldAlert className="w-6 h-6" />;
    case 'unknown':
      return <HelpCircle className="w-6 h-6" />;
  }
}

export function DetailView({ plantId, onBack, onSelectPlant }: DetailViewProps) {
  const plant = getPlantById(plantId);

  if (!plant) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Plant not found.</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const color = getStatusColor(plant.safety_status);
  const isToxic = plant.safety_status === 'mildly_toxic' || plant.safety_status === 'highly_toxic';

  const alternatives = plant.alternatives.map((id) => getPlantById(id)).filter(Boolean) as Plant[];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-4xl">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back to Search</span>
        </button>

        <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
          {/* Left: Plant image placeholder */}
          <div className="md:col-span-1">
            <div
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${color.bg} border ${color.border}`}
            >
              <Leaf className={`w-16 h-16 ${color.text} opacity-60`} />
              <span className={`mt-2 text-sm font-medium ${color.text} opacity-70`}>{plant.common_name}</span>
            </div>

            {/* AKA names */}
            {plant.aka_names.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold text-gray-400 text-xs uppercase tracking-wider">Also known as</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.aka_names.map((name) => (
                    <span
                      key={name}
                      className="bg-white px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 text-xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6 md:col-span-2">
            {/* Header */}
            <div>
              <h1 className="font-bold text-gray-900 text-3xl">{plant.common_name}</h1>
              <p className="mt-1 text-gray-400 text-lg italic">{plant.scientific_name}</p>
            </div>

            {/* Verdict Banner */}
            <div className={`flex items-center gap-4 p-5 rounded-xl border ${color.bg} ${color.border}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.text} bg-white/60`}>
                <StatusIcon status={plant.safety_status} />
              </div>
              <div>
                <div className={`text-lg font-bold ${color.text}`}>{getStatusLabel(plant.safety_status)}</div>
                <div className={`text-sm ${color.text} opacity-80`}>
                  {plant.safety_status === 'non_toxic'
                    ? 'This plant is safe to have around cats.'
                    : plant.safety_status === 'unknown'
                      ? 'Toxicity data is not yet available for this plant. Exercise caution.'
                      : 'This plant poses a risk to cats. Keep it out of reach or choose an alternative.'}
                </div>
              </div>
            </div>

            {/* Toxic Details */}
            {isToxic && (
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                {plant.symptoms && (
                  <div className="p-5 border-gray-100 border-b">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-4 h-4 text-rose-500" />
                      <h3 className="font-semibold text-gray-900 text-sm">Symptoms</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{plant.symptoms}</p>
                  </div>
                )}
                {plant.toxic_parts && (
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="w-4 h-4 text-rose-500" />
                      <h3 className="font-semibold text-gray-900 text-sm">Toxic Parts</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{plant.toxic_parts}</p>
                  </div>
                )}
              </div>
            )}

            {/* Safe Alternatives */}
            {isToxic && alternatives.length > 0 && (
              <div>
                <h2 className="mb-3 font-bold text-gray-900 text-lg">Safe Alternatives</h2>
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
                  {alternatives.map((alt) => {
                    const altColor = getStatusColor(alt.safety_status);
                    return (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => onSelectPlant(alt.id)}
                        className="group bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 hover:border-emerald-200 rounded-xl text-left transition-all cursor-pointer"
                      >
                        <div
                          className={`w-full aspect-[4/3] rounded-lg flex items-center justify-center mb-3 ${altColor.bg} group-hover:scale-[1.02] transition-transform`}
                        >
                          <Leaf className={`w-8 h-8 ${altColor.text} opacity-60`} />
                        </div>
                        <div className="font-medium text-gray-900 text-sm">{alt.common_name}</div>
                        <div className="text-gray-400 text-xs italic">{alt.scientific_name}</div>
                        <span
                          className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${altColor.bg} ${altColor.text} border ${altColor.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${altColor.dot}`} />
                          Safe
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
