interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-skeleton-shimmer rounded-2xl bg-linear-to-r from-stone-200/60 via-stone-100/30 to-stone-200/60 bg-size-[200%_100%] ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`botanical-card-strong flex flex-col rounded-[1.6rem] p-3 ${className}`.trim()}>
      <Skeleton className="mb-3 aspect-4/3 w-full rounded-[1.2rem]" />
      <Skeleton className="h-5 w-3/4 rounded-lg" />
      <Skeleton className="mt-2 h-3.5 w-1/2 rounded-lg" />
      <Skeleton className="mt-3 h-5 w-24 rounded-full" />
    </div>
  );
}

export function SkeletonPopularCard({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`flex flex-col rounded-[1.4rem] border border-stone-200 bg-white/92 p-3 ${className}`.trim()}
    >
      <Skeleton className="mb-3 h-24 w-full rounded-2xl sm:h-28" />
      <Skeleton className="h-4 w-3/4 rounded-lg" />
      <Skeleton className="mt-1.5 h-3 w-1/2 rounded-lg" />
      <Skeleton className="mt-2.5 h-5 w-20 rounded-full" />
    </div>
  );
}

export function SkeletonDetailContent() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 animate-fade-up-soft">
      {/* Image & aside */}
      <aside className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-[1.8rem]" />
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`thumb-skel-${i}`} className="aspect-square rounded-2xl" />
          ))}
        </div>
        <div className="botanical-card rounded-3xl p-4">
          <Skeleton className="h-3 w-24 rounded-lg" />
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`aka-skel-${i}`} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </aside>

      {/* Content */}
      <section className="space-y-4 sm:space-y-5">
        <div className="botanical-card-strong rounded-[1.8rem] p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-24 rounded-lg" />
              <Skeleton className="mt-2 h-6 w-28 rounded-full" />
              <Skeleton className="mt-3 h-4 w-full rounded-lg" />
              <Skeleton className="mt-1.5 h-4 w-5/6 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="botanical-card rounded-[1.7rem] p-5">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-3/4 rounded-lg" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={`cit-skel-${i}`} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        </div>

        <Skeleton className="h-20 w-full rounded-[1.6rem]" />
      </section>
    </div>
  );
}
