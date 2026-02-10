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
      <div className="flex justify-center items-center bg-yellow-50 min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-xl">Plant not found.</p>
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
  const hasToxicDetailContent = Boolean(plant.symptoms || plant.toxic_parts);

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
                    ? 'This plant is currently regarded as non-toxic to cats, but individual reactions can vary. Monitor your cat around any new plant.'
                    : plant.safety_status === 'unknown'
                      ? 'Toxicity data is not yet available for this plant. Exercise caution.'
                      : 'This plant is reported to pose a risk to cats. Keep it out of reach or choose an alternative.'}
                </div>
              </div>
            </div>

            {/* Toxic Details */}
            {isToxic && hasToxicDetailContent && (
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

            {/* Evidence */}
            <section className="bg-white shadow-sm p-5 border border-gray-200 rounded-xl">
              <h2 className="font-bold text-gray-900 text-lg">Evidence</h2>
              {plant.citations.length > 0 ? (
                <ul className="space-y-3 mt-3">
                  {plant.citations.map((citation) => (
                    <li
                      key={`${citation.source_name}-${citation.source_url}`}
                      className="flex sm:flex-row flex-col sm:items-center sm:justify-between gap-2 bg-gray-50 p-3 border border-gray-100 rounded-lg"
                    >
                      <span className="font-medium text-gray-800 text-sm">{citation.source_name}</span>
                      <a
                        href={citation.source_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-medium text-emerald-700 hover:text-emerald-800 text-sm underline underline-offset-2"
                      >
                        Open source
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  Evidence source: <span className="font-semibold">Unknown</span>. We do not currently have a
                  source citation for this plant.
                </p>
              )}
            </section>

            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <p className="text-amber-900 text-sm leading-relaxed">
                This information is for educational purposes only and is not a substitute for professional
                veterinary care. If your cat may have ingested a toxic plant, contact your veterinarian or an
                emergency animal poison service immediately.
              </p>
            </div>

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
