'use client'

import { useId, useState } from 'react'
import { CheckCircle2, Sprout } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Carbon } from '@/components/ui/carbon'
import { formatDate } from '@/lib/utils/format'
import {
  BASELINE_ACTION_LABEL,
  BASELINE_HELP,
  BASELINE_LABEL,
} from '@/features/verifier/baseline'

export type BaselineSuggestion = {
  /** False when the farm is in no project — nothing to be a baseline for. */
  eligible: boolean
  /** Pre-tick the box: this farm has no baseline yet. */
  suggested: boolean
  existing: { sessionId: string; baselineCarbonTco2e: number; approvedAt: string } | null
}

type Props = {
  sessionId: string
  verifierName: string
  totalCarbonKgCo2e: number
  baseline: BaselineSuggestion
  pending?: boolean
  onConfirm: (recordAsBaseline: boolean) => void
  onClose: () => void
}

/**
 * The approve step, including whether this session sets the farm's baseline
 * (VERIFIER-BASELINE-01).
 *
 * The checkbox is pre-ticked when the system believes this is the farm's first
 * approval, but the verifier still confirms — deliberately. Farms leave and
 * rejoin projects, and a baseline recorded against the wrong session cannot be
 * un-recorded from this screen, so the system suggests and a person decides.
 */
export function ApproveDialog({
  sessionId,
  verifierName,
  totalCarbonKgCo2e,
  baseline,
  pending = false,
  onConfirm,
  onClose,
}: Props) {
  const [asBaseline, setAsBaseline] = useState(baseline.suggested)
  const titleId = useId()
  const checkboxId = useId()

  return (
    <Modal
      onClose={() => {
        if (!pending) onClose()
      }}
      labelledBy={titleId}
      closeOnBackdrop={!pending}
      panelClassName="w-full max-w-md p-6"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
        </span>
        <h2 id={titleId} className="text-base font-semibold text-ink">
          ยืนยันการอนุมัติ
        </h2>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-secondary">
        อนุมัติ <span className="font-mono text-ink">{sessionId}</span>? ระบบจะออกคาร์บอนเครดิต{' '}
        <span className="font-semibold text-success">
          <Carbon kgCo2e={totalCarbonKgCo2e} />
        </span>{' '}
        และออกใบรับรองในนามของ{' '}
        <span className="font-medium text-ink">{verifierName}</span>
      </p>

      {baseline.eligible && !baseline.existing && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-3.5">
          <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-2.5">
            <input
              id={checkboxId}
              type="checkbox"
              checked={asBaseline}
              onChange={(e) => setAsBaseline(e.target.checked)}
              disabled={pending}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-primary focus:ring-2 focus:ring-primary/30"
            />
            <span>
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <Sprout className="h-3.5 w-3.5 text-success" strokeWidth={2} />
                {BASELINE_ACTION_LABEL}
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-ink-muted">
                {BASELINE_HELP}
              </span>
            </span>
          </label>
        </div>
      )}

      {/*
        A farm that already has a baseline cannot get another — say so here
        rather than letting the verifier tick a box that answers 409.
      */}
      {baseline.existing && (
        <p className="mt-4 rounded-xl border border-line bg-surface p-3.5 text-[12px] leading-relaxed text-ink-muted">
          ฟาร์มนี้มี{BASELINE_LABEL}อยู่แล้ว —{' '}
          <span
            className="font-mono text-ink-secondary"
            title={`ค่าเต็มที่ระบบเก็บ: ${baseline.existing.baselineCarbonTco2e} tCO₂e`}
          >
            {baseline.existing.baselineCarbonTco2e.toFixed(2)} tCO₂e
          </span>{' '}
          เมื่อ {formatDate(baseline.existing.approvedAt)} · รอบนี้จะถูกคิดเป็นส่วนที่เพิ่มขึ้นจากค่านั้น
        </p>
      )}

      {!baseline.eligible && (
        <p className="mt-4 rounded-xl border border-line bg-surface p-3.5 text-[12px] leading-relaxed text-ink-muted">
          ฟาร์มนี้ยังไม่ได้เข้าร่วมโครงการ จึงยังตั้ง{BASELINE_LABEL}ไม่ได้
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={() => onConfirm(asBaseline)}
          disabled={pending}
          className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50"
        >
          {pending ? 'กำลังบันทึก…' : 'อนุมัติ'}
        </button>
      </div>
    </Modal>
  )
}
