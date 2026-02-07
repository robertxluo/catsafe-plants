'use client';

import { useState } from 'react';
import { LogOut, AlertTriangle, Sparkles, Check, X, Loader2, Leaf, ArrowRight } from 'lucide-react';
import { plants, getPlantById, getStatusColor, getStatusLabel } from '@/src/lib/plants';
import type { Plant } from '@/src/lib/plants';

interface AdminDashboardProps {
  adminUser: string;
  onLogout: () => void;
}

type Tab = 'missing' | 'ai';

interface AISuggestion {
  plantId: string;
  suggested: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('missing');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const toxicPlants = plants.filter((p) => p.safety_status === 'mildly_toxic' || p.safety_status === 'highly_toxic');

  const plantsWithMissingAlts = toxicPlants.filter((p) => p.alternatives.length === 0);

  const toxicPlantsForAI = toxicPlants.filter((p) => !suggestions.some((s) => s.plantId === p.id));

  const safePlants = plants.filter((p) => p.safety_status === 'non_toxic');

  function simulateAI(plantId: string) {
    setLoadingId(plantId);
    setTimeout(() => {
      const shuffled = [...safePlants].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, Math.min(3, shuffled.length)).map((p) => p.id);
      setSuggestions((prev) => [...prev, { plantId, suggested: picked, status: 'pending' }]);
      setLoadingId(null);
    }, 1500);
  }

  function updateSuggestionStatus(plantId: string, status: 'approved' | 'rejected') {
    setSuggestions((prev) => prev.map((s) => (s.plantId === plantId ? { ...s, status } : s)));
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-gray-200 border-b">
        <div className="flex justify-between items-center mx-auto px-4 py-4 max-w-5xl">
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Admin Panel</h1>
            <p className="text-gray-400 text-xs">{adminUser}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto px-4 py-8 max-w-5xl">
        {/* Tabs */}
        <div className="inline-flex items-center bg-white mb-8 p-1 border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('missing')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'missing' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Missing Alternatives
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'ai' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Queue
            </span>
          </button>
        </div>

        {/* Tab: Missing Alternatives */}
        {activeTab === 'missing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-gray-900 text-lg">Toxic Plants Missing Alternatives</h2>
              <span className="text-gray-400 text-sm">
                {plantsWithMissingAlts.length} plant{plantsWithMissingAlts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {plantsWithMissingAlts.length === 0 ? (
              <div className="bg-white p-8 border border-gray-200 rounded-xl text-center">
                <ShieldCheckIcon />
                <p className="mt-2 text-gray-500">All toxic plants have assigned alternatives.</p>
              </div>
            ) : (
              plantsWithMissingAlts.map((plant) => <PlantRow key={plant.id} plant={plant} />)
            )}

            {/* Plants with alternatives */}
            <h2 className="mt-8 mb-2 font-bold text-gray-900 text-lg">Toxic Plants With Alternatives</h2>
            {toxicPlants
              .filter((p) => p.alternatives.length > 0)
              .map((plant) => (
                <PlantRow key={plant.id} plant={plant} showAlts />
              ))}
          </div>
        )}

        {/* Tab: AI Queue */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <h2 className="mb-2 font-bold text-gray-900 text-lg">AI-Powered Suggestion Queue</h2>
            <p className="mb-4 text-gray-400 text-sm">
              Generate safe plant alternative suggestions for toxic plants using AI simulation.
            </p>

            {/* Plants needing suggestions */}
            {toxicPlantsForAI.length > 0 && (
              <div className="space-y-3">
                {toxicPlantsForAI.map((plant) => {
                  const color = getStatusColor(plant.safety_status);
                  const isLoading = loadingId === plant.id;
                  return (
                    <div
                      key={plant.id}
                      className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.bg}`}>
                          <Leaf className={`w-5 h-5 ${color.text}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{plant.common_name}</div>
                          <div className="text-gray-400 text-xs italic">{plant.scientific_name}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => simulateAI(plant.id)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-4 py-2 rounded-lg font-medium text-white text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Suggestions
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggestion cards */}
            {suggestions.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Suggestions</h3>
                {suggestions.map((sugg) => {
                  const plant = getPlantById(sugg.plantId);
                  if (!plant) return null;
                  const color = getStatusColor(plant.safety_status);
                  return (
                    <div
                      key={sugg.plantId}
                      className={`bg-white border rounded-xl overflow-hidden ${
                        sugg.status === 'approved'
                          ? 'border-emerald-300'
                          : sugg.status === 'rejected'
                            ? 'border-rose-300'
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center p-4 border-gray-100 border-b">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.bg}`}>
                            <Leaf className={`w-4 h-4 ${color.text}`} />
                          </div>
                          <span className="font-medium text-gray-900">{plant.common_name}</span>
                          <ArrowRight className="w-4 h-4 text-gray-300" />
                          <span className="text-gray-500 text-sm">{sugg.suggested.length} suggestions</span>
                        </div>
                        {sugg.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 px-2.5 py-1 border border-emerald-200 rounded-full font-medium text-emerald-700 text-xs">
                            <Check className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {sugg.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-rose-100 px-2.5 py-1 border border-rose-200 rounded-full font-medium text-rose-700 text-xs">
                            <X className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {sugg.suggested.map((altId) => {
                            const alt = getPlantById(altId);
                            if (!alt) return null;
                            return (
                              <span
                                key={altId}
                                className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded-lg text-emerald-700 text-sm"
                              >
                                <Leaf className="w-3.5 h-3.5" />
                                {alt.common_name}
                              </span>
                            );
                          })}
                        </div>
                        {sugg.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateSuggestionStatus(sugg.plantId, 'approved')}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium text-white text-sm transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSuggestionStatus(sugg.plantId, 'rejected')}
                              className="inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 px-4 py-2 border border-rose-300 rounded-lg font-medium text-rose-600 text-sm transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {toxicPlantsForAI.length === 0 && suggestions.length === 0 && (
              <div className="bg-white p-8 border border-gray-200 rounded-xl text-center">
                <p className="text-gray-500">No toxic plants require AI suggestions.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex justify-center items-center bg-emerald-100 rounded-full w-12 h-12">
        <Check className="w-6 h-6 text-emerald-600" />
      </div>
    </div>
  );
}

function PlantRow({ plant, showAlts }: { plant: Plant; showAlts?: boolean }) {
  const color = getStatusColor(plant.safety_status);
  return (
    <div className="bg-white p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.bg}`}>
          <Leaf className={`w-5 h-5 ${color.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">{plant.common_name}</div>
          <div className="text-gray-400 text-xs italic">{plant.scientific_name}</div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
          {getStatusLabel(plant.safety_status)}
        </span>
      </div>
      {showAlts && plant.alternatives.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {plant.alternatives.map((altId) => {
            const alt = getPlantById(altId);
            if (!alt) return null;
            return (
              <span
                key={altId}
                className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded-lg text-emerald-700 text-xs"
              >
                <Leaf className="w-3 h-3" />
                {alt.common_name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
