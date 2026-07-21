import { Skeleton, SkeletonKpiCard } from '@/components/ui/skeleton'

/** Skeleton for the admin dashboard — KPI row + quick-access grid. */
export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-8 py-8">
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Dashboard
        </h1>
        <Skeleton className="mt-2 h-4 w-64" />
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonKpiCard key={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
