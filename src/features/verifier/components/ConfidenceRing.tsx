import type { CSSProperties } from 'react'
import { Wrench } from 'lucide-react'
import { confidenceHex, confidenceToneLabel } from '@/features/verifier/lib/confidence'

type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, { box: number; stroke: number; value: string; label: string }> = {
  sm: { box: 64, stroke: 6, value: 'text-base', label: 'text-[9px]' },
  md: { box: 96, stroke: 8, value: 'text-xl', label: 'text-[10px]' },
  lg: { box: 128, stroke: 10, value: 'text-3xl', label: 'text-[11px]' },
}

/**
 * Radial confidence gauge (pure SVG, server-renderable). The arc length encodes
 * the score and its colour follows the confidence tone (green/amber/red). The
 * ring sweeps in on mount via the `ring-fill` keyframe (disabled under
 * reduced-motion, where it simply renders at its final value).
 *
 * `state` overrides the numeric view: `'failed'` draws a dashed grey ring
 * ("ตรวจมือ"), `'waiting'` a gently pulsing ring. `score` is 0–1.
 */
export function ConfidenceRing({
  score,
  size = 'md',
  showLabel = true,
  state,
}: {
  score: number | null
  size?: Size
  showLabel?: boolean
  state?: 'failed' | 'waiting'
}) {
  const { box, stroke, value: valueClass, label: labelClass } = SIZES[size]
  const r = (box - stroke) / 2
  const c = 2 * Math.PI * r
  const center = box / 2

  const hasScore = score != null && state == null
  const pct = hasScore ? Math.round(score * 100) : 0
  const clamped = Math.min(1, Math.max(0, score ?? 0))
  const offset = c * (1 - clamped)
  const arcColor = hasScore ? confidenceHex(score) : '#9CA3AF'
  const failed = state === 'failed'
  const waiting = state === 'waiting'

  const arcStyle = {
    strokeDasharray: c,
    strokeDashoffset: offset,
    // Consumed by the `ring-fill` keyframe for the mount sweep.
    '--ring-dash': `${c}`,
    '--ring-offset': `${offset}`,
    transform: 'rotate(-90deg)',
    transformOrigin: 'center',
  } as CSSProperties

  return (
    <div
      className="relative shrink-0"
      style={{ width: box, height: box }}
      role="img"
      aria-label={
        failed
          ? 'AI ประเมินไม่สำเร็จ'
          : waiting
            ? 'กำลังประเมินด้วย AI'
            : `ความเชื่อมั่น AI ${pct}%`
      }
    >
      <svg viewBox={`0 0 ${box} ${box}`} className="h-full w-full">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--color-sunken)"
          strokeWidth={stroke}
        />
        {/* Arc */}
        {!failed && (
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={arcColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            className={
              waiting
                ? 'animate-pulse'
                : 'animate-[ring-fill_0.9s_ease-out_forwards]'
            }
            style={
              waiting
                ? { strokeDasharray: `${c * 0.25} ${c}`, transform: 'rotate(-90deg)', transformOrigin: 'center' }
                : arcStyle
            }
          />
        )}
        {failed && (
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray="2 8"
          />
        )}
      </svg>

      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {failed ? (
          <>
            <Wrench className="mb-0.5 h-4 w-4 text-ink-muted" strokeWidth={1.9} />
            {showLabel && <span className={`${labelClass} font-medium text-ink-muted`}>ตรวจมือ</span>}
          </>
        ) : waiting ? (
          <span className={`${labelClass} font-medium text-ink-muted`}>กำลังประเมิน…</span>
        ) : hasScore ? (
          <>
            <span className={`font-mono font-bold tabular-nums text-ink ${valueClass}`}>
              {pct}
              <span className="text-[0.5em] font-semibold text-ink-muted">%</span>
            </span>
            {showLabel && (
              <span className={`mt-0.5 font-semibold ${labelClass}`} style={{ color: arcColor }}>
                {confidenceToneLabel(score)}
              </span>
            )}
          </>
        ) : (
          <span className="text-lg font-bold text-ink-disabled">—</span>
        )}
      </div>
    </div>
  )
}
