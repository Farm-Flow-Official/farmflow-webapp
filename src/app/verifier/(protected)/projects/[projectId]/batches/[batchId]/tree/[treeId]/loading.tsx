import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton for the tree inspection page — hero photo (4:3), cross-check /
 * AI / metadata cards, and a mini-map. The photo and map boxes are reserved
 * at their real aspect ratios to avoid shift.
 */
export default function TreeInspectLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          กลับไปคิวงาน
        </span>
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Hero photo */}
        <Skeleton className="aspect-[4/3] rounded-2xl" />

        {/* Info column */}
        <div className="flex flex-col gap-4">
          {/* Cross-check card */}
          <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <Skeleton className="mb-3 h-3 w-40" />
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="mt-1.5 h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI assessment card */}
          <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <Skeleton className="mb-3 h-3 w-36" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-4/5" />
          </section>

          {/* Metadata card */}
          <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <Skeleton className="mb-3 h-3 w-24" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-1.5 h-4 w-16" />
                </div>
              ))}
            </div>
          </section>

          {/* Mini-map */}
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
