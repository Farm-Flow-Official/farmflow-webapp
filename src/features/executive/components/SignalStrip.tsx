import { TriangleAlert, Info, CircleAlert } from 'lucide-react'
import type { Signal, SignalTone } from '@/features/executive/lib'

const TONE: Record<
  SignalTone,
  { chip: string; dot: string; icon: typeof TriangleAlert; label: string }
> = {
  critical: {
    chip: 'border-error-border bg-error-bg text-error',
    dot: 'bg-error',
    icon: TriangleAlert,
    label: 'เร่งด่วน',
  },
  warning: {
    chip: 'border-warning/30 bg-warning-bg text-warning',
    dot: 'bg-warning',
    icon: CircleAlert,
    label: 'ต้องติดตาม',
  },
  info: {
    chip: 'border-line bg-surface text-ink-secondary',
    dot: 'bg-ink-muted',
    icon: Info,
    label: 'ข้อสังเกต',
  },
}

/**
 * What the reader should act on, above everything else on the page.
 *
 * The whole strip disappears when `buildSignals` returns nothing. That is the
 * point: a banner that is always on becomes furniture, and stops being read.
 * Tone is never carried by colour alone — each row has its own icon and a
 * text label.
 */
export function SignalStrip({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) return null

  return (
    <section
      aria-label="สิ่งที่ต้องตัดสินใจ"
      className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        สิ่งที่ต้องตัดสินใจ
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {signals.map((s) => {
          const tone = TONE[s.tone]
          const Icon = tone.icon
          return (
            <li
              key={s.id}
              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${tone.chip}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <p className="min-w-0 flex-1 text-[13px] leading-relaxed">
                <span className="font-semibold">{tone.label}</span>
                <span className="mx-1.5 opacity-50">·</span>
                {s.text}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
