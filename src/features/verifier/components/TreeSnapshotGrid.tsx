import Link from 'next/link'
import { TreePine, TriangleAlert, Sun, Cloud, CloudRain } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { TreeSnapshot } from '@/features/verifier/types'

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy'
import { treePlaceholderStyle } from '@/features/verifier/lib/treePlaceholder'
import { confidenceBadgeClass } from '@/features/verifier/lib/confidence'

const WEATHER_ICON: Record<WeatherCondition, ComponentType<SVGProps<SVGSVGElement>>> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
}

export function TreeSnapshotGrid({
  batchId,
  trees,
}: {
  batchId: string
  trees: TreeSnapshot[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {trees.map((t) => {
        const Weather = t.weather && t.weather in WEATHER_ICON ? WEATHER_ICON[t.weather as WeatherCondition] : null
        const conf = t.aiConfidenceScore ?? 0
        const pct = Math.round(conf * 100)
        return (
          <Link
            key={t.id}
            href={`/verifier/batches/${batchId}/tree/${t.id}`}
            className={`group flex flex-col overflow-hidden rounded-xl border bg-panel shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              t.anomaly ? 'border-error/60 ring-1 ring-error/30' : 'border-line'
            }`}
          >
            {/* Photo placeholder — swap for /api/v1/files/:id/content when access opens */}
            <div
              className="relative flex aspect-square items-center justify-center"
              style={treePlaceholderStyle(t.id)}
            >
              <TreePine className="h-8 w-8 text-white/40" strokeWidth={1.5} />
              <span
                className={`absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${confidenceBadgeClass(conf)}`}
              >
                {pct}%
              </span>
              {t.anomaly && (
                <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded bg-error text-white">
                  <TriangleAlert className="h-3 w-3" strokeWidth={2} />
                  <span className="sr-only">ผิดปกติ</span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 px-2 py-1.5">
              <span className="truncate font-mono text-[10px] text-ink-muted">
                {t.captureLat != null && t.captureLng != null
                  ? `${t.captureLat.toFixed(4)}, ${t.captureLng.toFixed(4)}`
                  : '—'}
              </span>
              {Weather && <Weather className="h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.75} />}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
