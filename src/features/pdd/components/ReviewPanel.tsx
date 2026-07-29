'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CircleCheck,
  TriangleAlert,
  Loader2,
  Send,
  Printer,
  FilePlus2,
  ChevronRight,
  Lock,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { WIZARD_STEPS, pddFingerprint, type PddDetail, type StepId } from '@/features/pdd/types'
import {
  fetchReadiness,
  revisePdd,
  submitPdd,
  type Readiness,
  type ReadinessIssue,
} from '@/features/pdd/actions/submitActions'

/**
 * The review-before-send panel.
 *
 * Its list comes from the server's readiness check — the same call that gates
 * submit — so it can never say "ready" while the submission refuses. Each
 * outstanding item links to the step that owns it, because "10 fields missing"
 * with no way to reach them is not a review.
 */
export function ReviewPanel({
  pdd,
  canWrite,
  canSubmit,
  onGoToStep,
  onSubmitted,
}: {
  pdd: PddDetail
  canWrite: boolean
  canSubmit: boolean
  onGoToStep: (step: StepId) => void
  onSubmitted: () => void
}) {
  // Keyed by the document revision it describes, so "loading" is derived from
  // what has actually been fetched rather than set on the way into an effect.
  const [checked, setChecked] = useState<{ key: string; data: Readiness | null }>({
    key: '',
    data: null,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const isDraft = pdd.status === 'draft'

  const revision = pddFingerprint(pdd)
  const loading = checked.key !== revision
  const readiness = checked.data

  // Re-checked whenever the document changes, so the list never lags the form.
  useEffect(() => {
    let cancelled = false
    fetchReadiness(pdd.id).then((res) => {
      if (cancelled) return
      if (res.ok) setChecked({ key: revision, data: res.data })
      else setError(res.error)
    })
    return () => {
      cancelled = true
    }
  }, [pdd.id, revision])

  async function handleSubmit() {
    setConfirming(false)
    setBusy(true)
    setError(null)

    const res = await submitPdd(pdd.projectId, pdd.id)
    setBusy(false)

    if (!res.ok) {
      setError(res.error)
      // The server may have found something the panel's last check missed.
      if (res.issues) {
        setChecked((prev) =>
          prev.data ? { ...prev, data: { ...prev.data, ready: false, issues: res.issues! } } : prev,
        )
      }
      return
    }
    onSubmitted()
  }

  async function handleRevise() {
    setBusy(true)
    setError(null)
    const res = await revisePdd(pdd.projectId, pdd.id)
    setBusy(false)
    if (!res.ok) return setError(res.error)
    onSubmitted()
  }

  const issues = readiness?.issues ?? []
  const ready = Boolean(readiness?.ready)

  return (
    <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">ตรวจสอบก่อนส่ง</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            {isDraft
              ? 'ระบบตรวจเฉพาะความครบถ้วนของฟิลด์ที่ฟอร์ม อบก. บังคับ — คุณภาพของเนื้อหาเป็นดุลพินิจของผู้ตรวจสอบ'
              : `เอกสารฉบับที่ ${pdd.version} ส่งแล้ว และถูกล็อกไว้เป็นหลักฐานการยื่น`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/projects/${pdd.projectId}/pdd/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            พิมพ์ / บันทึก PDF
          </Link>

          {isDraft && canSubmit && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={busy || loading || !ready}
              title={ready ? undefined : 'ยังมีฟิลด์ที่ต้องกรอกให้ครบก่อน'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <Send className="h-4 w-4" strokeWidth={2} />
              )}
              ส่งเอกสาร
            </button>
          )}

          {!isDraft && canWrite && (
            <button
              type="button"
              onClick={handleRevise}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <FilePlus2 className="h-4 w-4" strokeWidth={2} />
              )}
              สร้างฉบับแก้ไข
            </button>
          )}
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-4">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            กำลังตรวจสอบความครบถ้วน…
          </p>
        ) : !isDraft ? (
          <p className="flex items-center gap-2 rounded-lg border border-line bg-sunken px-4 py-3 text-sm text-ink-secondary">
            <Lock className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            หากต้องแก้ไข ให้กด “สร้างฉบับแก้ไข” — ระบบจะเปิดฉบับที่ {pdd.version + 1} โดยคัดลอกเนื้อหาเดิมมาให้
          </p>
        ) : ready ? (
          <p className="flex items-center gap-2 rounded-lg border border-line bg-success-bg px-4 py-3 text-sm font-medium text-success">
            <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={2} />
            กรอกครบทุกฟิลด์ที่บังคับแล้ว — พร้อมส่ง
          </p>
        ) : (
          <IssueList issues={issues} onGoToStep={onGoToStep} />
        )}
      </div>

      {confirming && (
        <ConfirmDialog
          title="ยืนยันการส่งเอกสาร PDD"
          description={
            <>
              ส่งเอกสารฉบับที่ {pdd.version}? ระบบจะบันทึกสำเนาไว้เป็นหลักฐานการยื่นและ
              <strong> ล็อกเอกสารฉบับนี้ไม่ให้แก้ไขอีก</strong> — หากต้องแก้ภายหลัง
              ต้องสร้างเป็นฉบับใหม่
            </>
          }
          confirmLabel="ส่งเอกสาร"
          tone="primary"
          onConfirm={handleSubmit}
          onClose={() => setConfirming(false)}
        />
      )}
    </section>
  )
}

/* ── Outstanding items, grouped by the step that owns them ──────────────── */

function IssueList({
  issues,
  onGoToStep,
}: {
  issues: ReadinessIssue[]
  onGoToStep: (step: StepId) => void
}) {
  const grouped = WIZARD_STEPS.map((step) => ({
    step,
    items: issues.filter((i) => i.step === step.id),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm font-medium text-warning">
        <TriangleAlert className="h-4 w-4 shrink-0" strokeWidth={2} />
        ยังขาดอีก {issues.length} รายการ
      </p>

      {grouped.map(({ step, items }) => (
        <div key={step.id} className="rounded-lg border border-line bg-surface">
          <button
            type="button"
            onClick={() => onGoToStep(step.id)}
            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning-bg text-[11px] font-semibold text-warning">
                {step.number}
              </span>
              <span className="text-sm font-medium text-ink">{step.title}</span>
              <span className="text-xs text-ink-muted">({items.length})</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-disabled" strokeWidth={2} />
          </button>

          <ul className="flex flex-wrap gap-1.5 border-t border-line px-4 py-2.5">
            {items.map((issue) => (
              <li
                key={`${issue.step}-${issue.field}`}
                className="rounded-full bg-panel px-2.5 py-1 text-xs text-ink-secondary"
              >
                {issue.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
