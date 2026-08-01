import { ArrowLeft } from 'lucide-react'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

/** Skeleton for the farmer detail page — profile header, info grid, farms table. */
export default function FarmerDetailLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      {/* Breadcrumb (static — not data-dependent) */}
      <span className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        กลับไป Farmer Management
      </span>

      {/* Profile header */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Info grid — 4 stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-panel p-4 shadow-sm">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="mt-3 h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Farms table */}
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          แปลงเกษตร
        </h2>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonTable columns={7} rows={5} />
    </div>
  )
}
