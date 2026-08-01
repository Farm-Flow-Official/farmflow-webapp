import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton for the executive dashboard. The layout (executive/layout.tsx)
 * already provides the max-w-[1200px] container, so this only fills the content
 * column: hero revenue + KPI grid, carbon funnel, opportunity card.
 */
export default function ExecutiveLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Demo banner */}
      <Skeleton className="h-10 w-full rounded-xl" />

      <header>
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Executive Dashboard
        </h1>
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </header>

      {/* Hero revenue + supporting KPIs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="mt-3 h-6 w-20" />
              <Skeleton className="mt-3 h-8 w-full rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Carbon funnel */}
      <Skeleton className="h-40 rounded-2xl" />

      {/* Opportunity card */}
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}
