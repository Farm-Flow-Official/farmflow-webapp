'use client'

import { useId, useRef, useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import { deltaPct } from '@/features/executive/lib'
import type { Kpi, MonthPoint } from '@/features/executive/types'

const STROKE = '#004C22' // brand primary
const FILL = '#34A853' // lighter brand green for the area tint

// Chart geometry, in a 0..100 viewBox (so every coordinate doubles as a %).
const H = 100
const PAD_TOP = 10
const PAD_BOTTOM = 10
const PLOT_H = H - PAD_TOP - PAD_BOTTOM

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/**
 * Hero revenue card: the executive's #1 question. Big current value + MoM delta
 * over an interactive 12-month area chart — hover (or drag on iPad) to scrub a
 * crosshair + tooltip. Single hue, no legend (the title names the series).
 */
export function RevenueHeroCard({ data, kpi }: { data: MonthPoint[]; kpi: Kpi }) {
  // Strip the colons React's useId emits — they break SVG `url(#id)` refs.
  const gid = `rev${useId().replace(/:/g, '')}`
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)

  const delta = deltaPct(kpi)
  const up = delta >= 0
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight

  const n = data.length
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const xy = data.map((d, i) => {
    const x = (i / (n - 1)) * 100
    const y = PAD_TOP + (1 - (d.value - min) / range) * PLOT_H
    return { x, y }
  })
  const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  const area = `${line} L100,${H} L0,${H} Z`

  function onMove(clientX: number) {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    setActive(Math.round(ratio * (n - 1)))
  }

  const cur = active ?? n - 1
  const curXY = xy[cur]
  const tipAlign = cur === 0 ? '0' : cur === n - 1 ? '-100%' : '-50%'

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            รายได้คาดการณ์สะสม
          </p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-ink">
              ฿{formatNumber(kpi.value)}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                up ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
              }`}
            >
              <DeltaIcon className="h-3 w-3" strokeWidth={2.2} />
              {up ? '+' : ''}
              {delta.toFixed(1)}%
            </span>
          </p>
          <p className="mt-0.5 text-[12px] text-ink-secondary">จากเครดิตที่ขายแล้ว · 12 เดือน</p>
        </div>
      </div>

      {/* Interactive area chart */}
      <div className="relative mt-4 h-44 w-full">
        <svg
          viewBox={`0 0 100 ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FILL} stopOpacity={0.28} />
              <stop offset="100%" stopColor={FILL} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
          <path
            d={line}
            fill="none"
            stroke={STROKE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Crosshair + active dot */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-primary/30"
          style={{ left: `${curXY.x}%` }}
        />
        <div
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel bg-primary shadow"
          style={{ left: `${curXY.x}%`, top: `${curXY.y}%` }}
        />

        {/* Tooltip */}
        {active !== null && (
          <div
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-line bg-panel px-2.5 py-1.5 text-center shadow-md"
            style={{ left: `${curXY.x}%`, top: `${curXY.y}%`, transform: `translate(${tipAlign}, -125%)` }}
          >
            <p className="text-[10px] font-medium text-ink-muted">{data[cur].label}</p>
            <p className="font-mono text-xs font-semibold text-ink">฿{formatNumber(data[cur].value)}</p>
          </div>
        )}

        {/* Transparent scrub layer */}
        <div
          ref={trackRef}
          className="absolute inset-0"
          style={{ touchAction: 'pan-y' }}
          onPointerMove={(e) => onMove(e.clientX)}
          onPointerDown={(e) => onMove(e.clientX)}
          onPointerLeave={() => setActive(null)}
        />
      </div>

      {/* Month axis (first · middle · last) */}
      <div className="mt-1.5 flex justify-between text-[10px] text-ink-muted">
        <span>{data[0].label}</span>
        <span>{data[Math.floor(n / 2)].label}</span>
        <span>{data[n - 1].label}</span>
      </div>
    </div>
  )
}
