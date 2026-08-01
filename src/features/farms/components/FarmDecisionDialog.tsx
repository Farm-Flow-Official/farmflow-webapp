'use client'

import { useId, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { FARM_DECISION_INFO, type FarmDecision } from '@/features/farms/types'

type Props = {
  farmName: string
  decision: FarmDecision
  pending?: boolean
  error?: string
  onConfirm: (reason?: string) => void
  onClose: () => void
}

const TONES = {
  danger: {
    chip: 'bg-error-bg text-error',
    button: 'bg-error hover:bg-error/90 focus-visible:ring-error',
  },
  primary: {
    chip: 'bg-primary-subtle text-primary',
    button: 'bg-primary hover:bg-primary-hover focus-visible:ring-primary',
  },
} as const

/**
 * Confirms an approve / reject / suspend, collecting the reason when one is
 * required (ADMIN-POWER-01, ADMIN-POWER-03).
 *
 * The reason is not a formality: it is written to the farm's status trail *and*
 * sent to the farmer verbatim as a notification. The helper text says so,
 * because an admin typing "no" into a box has no way to know a farmer will read
 * it otherwise.
 */
export function FarmDecisionDialog({
  farmName,
  decision,
  pending = false,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState('')
  const titleId = useId()
  const reasonId = useId()

  const info = FARM_DECISION_INFO[decision]
  const tone = TONES[info.tone]
  const missingReason = info.needsReason && reason.trim().length === 0

  return (
    <Modal
      onClose={() => {
        if (!pending) onClose()
      }}
      labelledBy={titleId}
      // The reason is unsaved input; a stray backdrop click must not discard it.
      closeOnBackdrop={!info.needsReason && !pending}
      panelClassName="w-full max-w-md p-6"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone.chip}`}>
          {info.tone === 'danger' ? (
            <AlertTriangle className="h-4 w-4" strokeWidth={2} />
          ) : (
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          )}
        </span>
        <h2 id={titleId} className="text-base font-semibold text-ink">
          ยืนยันการ{info.label}
        </h2>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-secondary">
        {decision === 'active' ? (
          <>
            อนุมัติฟาร์ม <span className="font-medium text-ink">{farmName}</span>?
            หลังจากนี้ฟาร์มจะเข้าร่วมโครงการและออกคาร์บอนเครดิตได้
          </>
        ) : decision === 'rejected' ? (
          <>
            ไม่อนุมัติฟาร์ม <span className="font-medium text-ink">{farmName}</span>?
            ฟาร์มจะถูกถอนออกจากโครงการที่สังกัดอยู่ (ถ้ามี)
          </>
        ) : (
          <>
            ระงับการใช้งานฟาร์ม <span className="font-medium text-ink">{farmName}</span>?
            ฟาร์มจะถูกถอนออกจากโครงการและออกคาร์บอนเครดิตไม่ได้จนกว่าจะปลดระงับ
          </>
        )}
      </p>

      {info.needsReason && (
        <div className="mt-4">
          <label htmlFor={reasonId} className="mb-1.5 block text-[13px] font-medium text-ink">
            เหตุผล <span className="text-error">*</span>
          </label>
          <textarea
            id={reasonId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={2000}
            disabled={pending}
            placeholder="เช่น ขอบเขตแปลงทับซ้อนกับฟาร์มอื่น"
            className="w-full resize-y rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            เหตุผลนี้จะถูกบันทึกใน Audit Log และ<span className="font-medium">แจ้งเตือนไปยังเกษตรกร</span>
            ตามข้อความที่กรอก
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-error-bg px-3 py-2 text-[13px] text-error">
          {error}
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
          onClick={() => onConfirm(reason.trim() || undefined)}
          disabled={pending || missingReason}
          className={`h-9 rounded-lg px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${tone.button}`}
        >
          {pending ? 'กำลังบันทึก…' : info.label}
        </button>
      </div>
    </Modal>
  )
}
