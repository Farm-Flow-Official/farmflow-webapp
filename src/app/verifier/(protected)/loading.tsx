import { Skeleton, SkeletonKpiCard } from '@/components/ui/skeleton'

/** Skeleton for the verifier dashboard — KPI row + anomaly alert panel. */
export default function VerifierDashboardLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Verifier Dashboard
        </h1>
        <Skeleton className="mt-2 h-4 w-72" />
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Review distribution bar */}
      <div className="mb-8 rounded-2xl border border-line bg-panel p-5 shadow-sm">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-3.5 w-full rounded-full" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-1.5 h-5 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly alert panel */}
      <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <Skeleton className="mb-4 h-3 w-40" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="mt-1.5 h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
