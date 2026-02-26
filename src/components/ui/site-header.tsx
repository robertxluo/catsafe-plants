import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface SiteHeaderProps {
  pathname: string;
  onGoHome: () => void;
  onGoDirectory: () => void;
  onGoBack?: () => void;
  backLabel?: string;
}

const navButtonClass =
  'inline-flex items-center justify-center min-h-9 sm:min-h-10 cursor-pointer rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.97]';

export function SiteHeader({ pathname, onGoHome, onGoDirectory, onGoBack, backLabel = 'Back' }: SiteHeaderProps) {
  return (
    <header className="mx-auto px-4 sm:px-6 pt-5 sm:pt-7 w-full max-w-6xl">
      <div className="flex justify-between items-center gap-2 sm:gap-3 bg-white/86 shadow-sm backdrop-blur px-3 sm:px-4 py-2 border border-white/70 rounded-full">
        {onGoBack ? (
          <button
            type="button"
            onClick={onGoBack}
            className="inline-flex justify-center items-center gap-2 bg-white/95 hover:bg-slate-50 px-3.5 sm:px-4.5 py-2 border border-slate-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 min-h-10 font-medium text-slate-700 text-xs sm:text-sm active:scale-[0.97] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span className="font-semibold truncate tracking-tight">{backLabel}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex justify-center items-center bg-green-100 rounded-full w-8 sm:w-9 h-8 sm:h-9 text-green-800 shrink-0">
              <Image
                src="/icon.svg"
                alt=""
                width={20}
                height={20}
                className="w-4 sm:w-5 h-4 sm:h-5"
                aria-hidden="true"
              />
            </div>
            <span className="font-semibold text-xs sm:text-base truncate tracking-tight">CatSafe Plants</span>
          </div>
        )}

        <nav aria-label="Primary" className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onGoHome}
            aria-current={pathname === '/' ? 'page' : undefined}
            className={`${navButtonClass} ${
              pathname === '/'
                ? 'bg-green-100 text-green-900 shadow-sm'
                : 'text-slate-600 hover:bg-green-50 hover:text-green-800 hover:shadow-sm'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={onGoDirectory}
            aria-label="Plant Directory"
            aria-current={pathname.startsWith('/plants') ? 'page' : undefined}
            className={`${navButtonClass} ${
              pathname.startsWith('/plants')
                ? 'bg-green-100 text-green-900 shadow-sm'
                : 'text-slate-600 hover:bg-green-50 hover:text-green-800 hover:shadow-sm'
            }`}
          >
            <span className="sm:hidden">Directory</span>
            <span className="hidden sm:inline">Plant Directory</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
