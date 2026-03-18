import { LoaderCircle } from 'lucide-react';
import { SiteFooter } from '@/src/components/ui/site-footer';

export default function PlantDetailLoading() {
  return (
    <div className="home-editorial-shell botanical-page relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/84 via-stone-100/76 to-stone-100" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/32 via-transparent to-amber-100/26" aria-hidden="true" />
      <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-100/55 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
          <div className="botanical-card inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-600">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading plant details...
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
