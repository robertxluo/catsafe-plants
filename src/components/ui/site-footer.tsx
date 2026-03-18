import Image from 'next/image';
import { Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 animate-fade-up-soft motion-reduce:animate-none">
      <div className="border-t border-stone-200 pt-8 text-center">
        
        {/* Request Plant Section */}
        <div className="mb-10 flex flex-col items-center justify-center gap-3">
          <p className="text-[14px] font-medium text-slate-700 sm:text-[15px]">Can&apos;t find the plant you&apos;re looking for?</p>
          <a
            href="mailto:robertxluo@gmail.com?subject=CatSafe Plants - Plant Request"
            className="group flex h-9 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-[13px] font-medium text-stone-600 shadow-sm transition-all hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:h-10 sm:px-5 sm:text-[14px]"
          >
            <Mail className="h-4 w-4 text-stone-400 transition-colors group-hover:text-stone-600" />
            Request a Plant
          </a>
        </div>

        <p className="text-slate-600 text-[13px] sm:text-[14px] leading-relaxed">
          Safety guidance is informational and should not replace professional veterinary advice.
        </p>
        <p className="mt-2.5 inline-flex items-center gap-1.5 text-slate-500 text-[13px] sm:text-[14px]">
          <Image src="/icon.svg" alt="" width={14} height={14} className="h-3.5 w-3.5 opacity-60 grayscale" aria-hidden="true" />
          For cat owners, by a cat lover.
        </p>
      </div>
    </footer>
  );
}
