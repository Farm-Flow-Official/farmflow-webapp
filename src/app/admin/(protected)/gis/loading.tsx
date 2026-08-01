import { Map as MapIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton for the GIS explorer. GisExplorer is full-bleed (map + side panel),
 * so this reserves the same full-height frame: a pulsing map canvas with a
 * floating farm-list panel.
 */
export default function GisLoading() {
  return (
    <div className="relative h-[calc(100dvh-64px)] w-full overflow-hidden bg-sunken">
      {/* Map canvas placeholder */}
      <div className="flex h-full w-full items-center justify-center">
        <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
          <MapIcon className="h-4 w-4 animate-pulse" strokeWidth={1.75} />
          กำลังโหลดแผนที่…
        </span>
      </div>

      {/* Floating farm-list panel */}
      <div className="absolute left-4 top-4 hidden w-80 rounded-xl border border-line bg-panel p-4 shadow-md sm:block">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-9 w-full rounded-lg" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="mt-1.5 h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
