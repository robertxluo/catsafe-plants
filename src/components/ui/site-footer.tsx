import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 animate-fade-up-soft motion-reduce:animate-none">
      <div className="border-t border-stone-200 pt-8 text-center">
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
