"use client";

import Image from 'next/image';
import { ArrowLeft, Home, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SiteHeaderProps {
  pathname: string;
  onGoHome: () => void;
  onGoDirectory: () => void;
  onGoBack?: () => void;
  backLabel?: string;
  activeNav?: 'home' | 'directory' | 'none';
}

const navButtonClass =
  'relative z-10 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold tracking-[0.05em] uppercase whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97] sm:px-4.5 sm:text-sm';

export function SiteHeader({
  pathname,
  onGoHome,
  onGoDirectory,
  onGoBack,
  backLabel = 'Back',
  activeNav,
}: SiteHeaderProps) {
  const [navigatingTo, setNavigatingTo] = useState<'home' | 'directory' | 'back' | 'none'>('none');

  const resolvedActiveNav =
    activeNav ?? (pathname === '/' ? 'home' : pathname === '/plants' ? 'directory' : 'none');

  return (
    <header className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 sm:pt-7">
      <div className="botanical-card-strong flex items-center justify-between gap-3 rounded-[1.75rem] px-3 py-2.5 sm:px-4 sm:py-3">
        {onGoBack ? (
          <button
            type="button"
            onClick={() => {
              setNavigatingTo('back');
              if (onGoBack) onGoBack();
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-200/70 bg-white/90 px-3.5 py-2 text-slate-700 text-xs font-medium transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97] sm:px-4.5 sm:text-sm"
          >
            {navigatingTo === 'back' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="truncate font-semibold tracking-tight">{backLabel}</span>
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-100/80 text-green-800 sm:h-11 sm:w-11">
              <Image
                src="/icon.svg"
                alt=""
                width={22}
                height={22}
                className="h-5 w-5 sm:h-5.5 sm:w-5.5"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <span className="font-display block truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-lg">
                CatSafe Plants
              </span>
              <span className="hidden truncate text-[11px] uppercase tracking-[0.18em] text-slate-500 sm:block">
                Cat-safe plant directory
              </span>
            </div>
          </div>
        )}

        <nav aria-label="Primary" className="flex shrink-0 items-center gap-1 rounded-full p-1 bg-slate-100/80 border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => {
              if (resolvedActiveNav !== 'home') {
                setNavigatingTo('home');
                onGoHome();
              }
            }}
            aria-current={resolvedActiveNav === 'home' ? 'page' : undefined}
            className={`${navButtonClass} ${
              resolvedActiveNav === 'home'
                ? 'text-emerald-950'
                : 'text-slate-500 hover:text-emerald-800 hover:bg-black/5'
            }`}
          >
            {resolvedActiveNav === 'home' && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 -z-10 rounded-full border border-emerald-200 bg-emerald-100 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {navigatingTo === 'home' ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (resolvedActiveNav !== 'directory') {
                setNavigatingTo('directory');
                onGoDirectory();
              }
            }}
            aria-label="Plant Directory"
            aria-current={resolvedActiveNav === 'directory' ? 'page' : undefined}
            className={`${navButtonClass} ${
              resolvedActiveNav === 'directory'
                ? 'text-emerald-950'
                : 'text-slate-500 hover:text-emerald-800 hover:bg-black/5'
            }`}
          >
            {resolvedActiveNav === 'directory' && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 -z-10 rounded-full border border-emerald-200 bg-emerald-100 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {navigatingTo === 'directory' ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">Directory</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
