import { Sparkles, TriangleAlert, Quote } from 'lucide-react'
import { ConfidenceRing } from '@/features/verifier/components/ConfidenceRing'
import { aiFlagLabel, aiFlagIcon } from '@/features/verifier/lib/aiFlags'

/**
 * Redesigned "AI Vision" assessment panel (ADR 0022) — the confidence ring is
 * the hero, with the model's rationale as a callout and each anomaly flag shown
 * as an icon chip. Server-renderable. Anomalies get a red frame + soft glow.
 */
export function AiAssessmentCard({
  confidenceScore,
  status,
  rationale,
  flags,
  anomaly,
}: {
  confidenceScore: number | null
  status: string | null
  rationale: string | null
  flags: string[]
  anomaly: boolean
}) {
  const failed = status === 'failed'
  const waiting = status === 'waiting'
  const ringState = failed ? 'failed' : waiting ? 'waiting' : undefined
  const hasResult = !failed && !waiting && confidenceScore != null

  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-panel shadow-sm ${
        anomaly ? 'border-error/50 animate-soft-glow' : 'border-line'
      }`}
    >
      {/* Header — brand-green gradient wash behind the "AI Vision" mark. */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: 'linear-gradient(90deg, var(--color-primary-subtle), var(--color-panel))' }}
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          AI Vision Assessment
        </h2>
        {anomaly && (
          <span className="inline-flex items-center gap-1 rounded-full bg-error-bg px-2 py-0.5 text-[11px] font-semibold text-error">
            <TriangleAlert className="h-3 w-3" strokeWidth={2} />
            พบความผิดปกติ
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start">
        {/* Hero ring */}
        <ConfidenceRing score={confidenceScore} size="lg" state={ringState} />

        {/* Rationale + flags */}
        <div className="min-w-0 flex-1 space-y-3">
          {failed ? (
            <p className="flex items-start gap-2 text-sm text-ink-secondary">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.9} />
              AI ประเมินภาพนี้ไม่สำเร็จ — โปรดตรวจสอบด้วยตนเอง
            </p>
          ) : waiting ? (
            <p className="text-sm text-ink-muted">ระบบกำลังประเมินภาพนี้ด้วย AI…</p>
          ) : hasResult && (rationale || flags.length > 0) ? (
            <>
              {rationale && (
                <div className="relative rounded-xl border border-line bg-primary-subtle/60 p-3 pl-9">
                  <Quote
                    className="absolute left-3 top-3 h-4 w-4 text-primary/50"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-ink-secondary">{rationale}</p>
                </div>
              )}

              {flags.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    จุดที่ AI สังเกต
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {flags.map((f) => {
                      const Icon = aiFlagIcon(f)
                      return (
                        <li
                          key={f}
                          className="inline-flex items-center gap-1.5 rounded-full border border-error-border bg-error-bg px-2.5 py-1 text-[11px] font-semibold text-error"
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                          {aiFlagLabel(f)}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-muted">ยังไม่มีผลการประเมิน</p>
          )}
        </div>
      </div>
    </section>
  )
}
