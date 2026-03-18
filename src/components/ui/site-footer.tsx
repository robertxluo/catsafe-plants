import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-2 pt-10 sm:px-6">
      <div className="botanical-card rounded-[1.6rem] px-5 py-4 text-center animate-fade-up-soft motion-reduce:animate-none">
        <p className="text-slate-600 text-xs leading-relaxed sm:text-[13px]">
          Safety guidance is informational and should not replace professional veterinary advice.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-slate-500 text-xs sm:text-[13px]">
          <Image src="/icon.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" aria-hidden="true" />
          For cat owners, by a cat lover.
        </p>
      </div>
    </footer>
  );
}
