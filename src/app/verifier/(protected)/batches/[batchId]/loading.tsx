import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton for the batch detail page — the heaviest verifier view (cover photo
 * + farm overview + mini-map + MRV summary + tree photo grid). Boxes are
 * reserved at the real aspect ratios so the map chunk and photos load without
 * shifting the layout.
 */
export default function BatchDetailLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      {/* Breadcrumb (static) */}
      <span className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        กลับไปคิวงาน
      </span>

      {/* Header card with cover photo */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
        <Skeleton className="h-40 w-full rounded-none sm:h-56" />
        <div className="flex flex-col gap-4 p-6">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Farm overview + MRV */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Farm overview + mini-map */}
        <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm lg:col-span-2">
          <Skeleton className="mb-4 h-3 w-24" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-1.5 h-4 w-36" />
                </div>
              ))}
            </div>
            {/* Mini-map box — reserved at the real height */}
            <Skeleton className="h-48 rounded-xl sm:h-full sm:min-h-[12rem]" />
          </div>
        </section>

        {/* MRV summary */}
        <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
          <Skeleton className="mb-4 h-3 w-28" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1.5 h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Tree snapshot grid */}
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          ภาพต้นไม้ในชุด
        </h2>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  )
}
