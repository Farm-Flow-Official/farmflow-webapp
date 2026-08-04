'use client'

import { useId, useState } from 'react'
import { formatTonnes, monthLabel } from '@/features/executive/lib'
import type { TrendPoint } from '@/features/executive/types'

const H = 100
const PAD_TOP = 6
const PAD_BOTTOM = 4

type Series = {
  key: 'estimated' | 'certified'
  label: string
  color: string
  fillOpacity: number
}

const SERIES: Series[] = [
  {
    key: 'estimated',
    label: 'ประเมินแล้ว',
    color: 'var(--color-chart-2)',
    fillOpacity: 0.1,
  },
  {
    key: 'certified',
    label: 'ตรวจรับรองแล้ว',
    color: 'var(--color-chart-1)',
    fillOpacity: 0.22,
  },
]

/** Keeps the tooltip inside the plot instead of hanging off a narrow screen. */
function clampPercent(x: number): number {
  return Math.min(84, Math.max(16, x))
}

/**
 * Two cumulative lines over twelve months. The area BETWEEN them is the point of
 * the chart: assessed carbon that no verifier has ruled on yet. A single
 * certified line would climb forever and never show the backlog widening.
 *
 * Hand-rolled SVG, like every other chart here — a 0–100 viewBox stretched with
 * `preserveAspectRatio="none"`, with the crosshair and tooltip as DOM overlays
 * so they stay unstretched.
 */
export function CarbonTrendChart({ data }: { data: TrendPoint[] }) {
  const gradientId = useId().replace(/:/g, '')
  const [hover, setHover] = useState<number | null>(null)

  if (data.length < 2) return null

  // Both series share one scale — otherwise the gap between them, which is the
  // whole message, would be a drawing artefact rather than a quantity.
  const max = Math.max(...data.flatMap((p) => [p.estimated, p.certified]), 1)
  const n = data.length
  const plotH = H - PAD_TOP - PAD_BOTTOM

  const xOf = (i: number) => (i / (n - 1)) * 100
  const yOf = (v: number) => PAD_TOP + (1 - v / max) * plotH

  const pathFor = (key: Series['key']) =>
    data
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(2)},${yOf(p[key]).toFixed(2)}`)
      .join(' ')

  const active = hover === null ? n - 1 : hover
  const point = data[active]

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            คาร์บอนสะสม 12 เดือน
          </h3>
          <p className="mt-1 text-sm text-ink-secondary">
            ช่องว่างระหว่างสองเส้น = คาร์บอนที่รอผู้ตรวจ
          </p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 100 ${H}`}
          preserveAspectRatio="none"
          className="h-40 w-full sm:h-48 lg:h-56"
          role="img"
          aria-label={`คาร์บอนสะสมรายเดือน ล่าสุด ประเมิน ${formatTonnes(
            data[n - 1].estimated,
          )} tCO2e ตรวจรับรองแล้ว ${formatTonnes(data[n - 1].certified)} tCO2e`}
        >
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`${gradientId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={s.fillOpacity} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {SERIES.map((s) => (
            <g key={s.key}>
              <path
                d={`${pathFor(s.key)} L100,${H} L0,${H} Z`}
                fill={`url(#${gradientId}-${s.key})`}
              />
              <path
                d={pathFor(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

          <line
            x1={xOf(active)}
            y1={PAD_TOP}
            x2={xOf(active)}
            y2={H - PAD_BOTTOM}
            stroke="var(--color-line-strong)"
            strokeWidth={1}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
          {SERIES.map((s) => (
            <circle
              key={s.key}
              cx={xOf(active)}
              cy={yOf(point[s.key])}
              r={1.6}
              fill="var(--color-panel)"
              stroke={s.color}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Transparent scrub layer: a pointer anywhere over the plot selects the
            nearest month, so the chart is usable without hitting a 2px line. */}
        <div
          className="absolute inset-0 cursor-crosshair"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            setHover(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))))
          }}
          onPointerLeave={() => setHover(null)}
        />

        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-line bg-panel px-2 py-1.5 text-[10px] shadow-sm sm:px-2.5 sm:text-[11px]"
          style={{ left: `${clampPercent(xOf(active))}%` }}
        >
          <p className="font-semibold text-ink">{monthLabel(point.month)}</p>
          {SERIES.map((s) => (
            <p key={s.key} className="tabular-nums text-ink-secondary">
              <span
                className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              {formatTonnes(point[s.key])} tCO₂e
            </p>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-ink-muted">
        <span>{monthLabel(data[0].month)}</span>
        <span>{monthLabel(data[Math.floor((n - 1) / 2)].month)}</span>
        <span>{monthLabel(data[n - 1].month)}</span>
      </div>
    </section>
  )
}
