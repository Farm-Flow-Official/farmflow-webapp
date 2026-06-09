'use client'

import { useId, useState } from 'react'
import { Check, X, FileDown } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import type { BatchStatus } from '@/features/verifier/types'

const STATUS_META: Record<BatchStatus, { variant: BadgeVariant; label: string }> = {
  Pending: { variant: 'pending', label: 'รอตรวจ' },
  Approved: { variant: 'verified', label: 'อนุมัติแล้ว' },
  Rejected: { variant: 'rejected', label: 'ปฏิเสธแล้ว' },
}

type Props = {
  batchId: string
  initialStatus: BatchStatus
  verifierName: string
}

export function BatchReviewActions({ batchId, initialStatus, verifierName }: Props) {
  const [status, setStatus] = useState<BatchStatus>(initialStatus)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const { message, showToast } = useToast()

  // MOCK ONLY — local state, no persistence. Replace with Server Actions when
  // the verifier API exposes approve/reject + PDF generation.
  function handleApprove() {
    // Seam: await approveBatch(batchId) → status Approved + PDF w/ verifier signature
    setStatus('Approved')
    setApproving(false)
    showToast('อนุมัติ batch แล้ว · ออกใบรับรอง PDF (mock — ยังไม่บันทึกจริง)')
  }

  function handleReject(reason: string) {
    // Seam: await rejectBatch(batchId, reason) → status Rejected + notify farmer
    void reason
    setStatus('Rejected')
    setRejecting(false)
    showToast('ปฏิเสธ batch แล้ว · แจ้งเหตุผลถึงเกษตรกร (mock — ยังไม่บันทึกจริง)')
  }

  function handlePdf() {
    // Seam: GET /verifier/batches/:id/report.pdf
    showToast('กำลังสร้างรายงาน PDF (mock — ยังไม่ทำงานจริง)')
  }

  const meta = STATUS_META[status]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={meta.variant} dot>
        {meta.label}
      </Badge>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePdf}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FileDown className="h-4 w-4" strokeWidth={1.75} />
          ดาวน์โหลด PDF
        </button>

        {status === 'Pending' && (
          <>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-error-border bg-error-bg px-4 py-2 text-sm font-semibold text-error transition-colors hover:bg-error hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" strokeWidth={2} />
              ปฏิเสธ
            </button>
            <button
              type="button"
              onClick={() => setApproving(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              อนุมัติ
            </button>
          </>
        )}
      </div>

      {approving && (
        <ConfirmDialog
          title="ยืนยันการอนุมัติ batch"
          description={
            <>
              อนุมัติ <span className="font-mono text-ink">{batchId}</span>? ระบบจะออก
              ใบรับรอง PDF พร้อมลายเซ็นของ{' '}
              <span className="font-medium text-ink">{verifierName}</span>
            </>
          }
          confirmLabel="อนุมัติ"
          tone="primary"
          onConfirm={handleApprove}
          onClose={() => setApproving(false)}
        />
      )}

      {rejecting && (
        <RejectForm
          batchId={batchId}
          onReject={handleReject}
          onClose={() => setRejecting(false)}
        />
      )}

      <Toast message={message} />
    </div>
  )
}

function RejectForm({
  batchId,
  onReject,
  onClose,
}: {
  batchId: string
  onReject: (reason: string) => void
  onClose: () => void
}) {
  const titleId = useId()
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const error = touched && reason.trim() === ''

  function submit() {
    setTouched(true)
    if (reason.trim() === '') return
    onReject(reason.trim())
  }

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="flex w-full max-w-lg flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-base font-semibold text-ink">
          ปฏิเสธ batch ·{' '}
          <span className="font-mono text-sm text-ink-secondary">{batchId}</span>
        </h2>
      </div>

      <div className="px-6 py-5">
        <label htmlFor="reject-reason" className="mb-1.5 block text-sm font-medium text-ink">
          เหตุผลการปฏิเสธ <span className="text-error">*</span>
        </label>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="เช่น ภาพต้นไม้ไม่ชัด / พิกัดไม่ตรงกับแปลง — เกษตรกรจะได้รับเหตุผลนี้"
          aria-invalid={error}
          className={`w-full resize-y rounded-lg border bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:outline-none focus:ring-2 ${
            error
              ? 'border-error-border focus:border-error focus:ring-error/15'
              : 'border-line focus:border-primary focus:ring-primary/15'
          }`}
        />
        {error && <p className="mt-1.5 text-xs text-error">กรุณาระบุเหตุผล (จำเป็น)</p>}
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-error/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
        >
          ยืนยันการปฏิเสธ
        </button>
      </div>
    </Modal>
  )
}
