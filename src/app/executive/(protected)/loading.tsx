import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton for the ESG executive dashboard.
 *
 * The layout already provides the max-w-[1440px] container, so this only fills
 * the content column — and it mirrors page.tsx section for section, at the same
 * heights and the same breakpoints. A skeleton that does not match the real
 * layout trades a blank screen for a layout jump, which reads worse.
 *
 * The pillar headings are rendered for real, not as grey blocks: they are static
 * text that is correct before the data arrives, and showing them tells the
 * reader what is coming (same call as the page titles in admin/farms/loading).
 */
export default function ExecutiveLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header + filter row */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div>
            <Skeleton className="h-2.5 w-44" />
            <Skeleton className="mt-2 h-8 w-64 max-w-full" />
            <Skeleton className="mt-2 h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-[38px] w-40 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-64 max-w-full rounded-lg" />
      </div>

      {/* Signal strip — one row's worth, so its arrival does not shove the page */}
      <Skeleton className="h-[104px] rounded-2xl" />

      <PillarBlock accent="bg-esg-e-bg" en="Environmental" th="สิ่งแวดล้อม">
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[248px] rounded-2xl lg:col-span-1" />
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[320px] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>

        <Skeleton className="h-[340px] rounded-2xl" />
      </PillarBlock>

      <PillarBlock accent="bg-esg-s-bg" en="Social" th="สังคม">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-2xl" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      </PillarBlock>

      <PillarBlock accent="bg-esg-g-bg" en="Governance" th="ธรรมาภิบาลข้อมูล">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-[62px] rounded-xl" />
      </PillarBlock>
    </div>
  )
}

function PillarBlock({
  accent,
  en,
  th,
  children,
}: {
  accent: string
  en: string
  th: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className={`h-9 w-9 shrink-0 rounded-xl ${accent}`} aria-hidden="true" />
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
              {en}
            </span>
            <span className="text-[13px] font-medium text-ink-secondary">{th}</span>
          </div>
          <Skeleton className="mt-1.5 h-3 w-72 max-w-full" />
        </div>
      </div>
      {children}
    </section>
  )
}

/** Mirrors ExecutiveKpiCard exactly: chip, delta pill, label, value, sub. */
function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-[18px] w-14 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-2.5 w-28" />
      <Skeleton className="mt-2 h-7 w-24" />
      <Skeleton className="mt-1.5 h-3 w-32" />
    </div>
  )
}
