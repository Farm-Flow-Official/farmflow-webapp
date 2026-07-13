'use client'

import { useId, useState } from 'react'
import { AlertTriangle, Copy, Check, X, ShieldCheck } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatNumber, formatPhone } from '@/lib/utils/format'
import type { PaymentSlip } from '@/features/business/payments/types'
import { hasAmountMismatch, slipStatusBadge } from '@/features/business/payments/lib'
import { MockSlip } from '@/features/business/payments/components/MockSlip'

type Props = {
  slip: PaymentSlip
  /** Signer username for the sign-off record. */
  reviewerName: string
  onClose: () => void
  /** Optimistic mock resolve — Seam: `POST /api/business/payments/:id/{approve,reject}`. */
  onResolve: (updated: PaymentSlip, message: string) => void
}

export function SlipReviewModal({ slip, reviewerName, onClose, onResolve }: Props) {
  const titleId = useId()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [acked, setAcked] = useState(false)

  const status = slipStatusBadge(slip.status)
  const mismatch = hasAmountMismatch(slip)
  const pending = slip.status === 'Pending_Review'
  // A flagged slip (wrong amount or possible duplicate) needs an explicit
  // acknowledgement before it can be approved — guards against one-click sign-off.
  const needsAck = mismatch || slip.duplicateFlag

  function approve() {
    if (needsAck && !acked) return
    onResolve(
      {
        ...slip,
        status: 'Approved',
        verifiedBy: reviewerName,
        signedAt: new Date().toISOString(),
      },
      `อนุมัติสลิปของ ${slip.customerName} + เปิดใช้งานสมาชิก ${slip.packageName} แล้ว (mock)`,
    )
  }

  function reject() {
    const trimmed = reason.trim()
    if (!trimmed) return
    onResolve(
      {
        ...slip,
        status: 'Rejected',
        rejectionReason: trimmed,
        verifiedBy: reviewerName,
        signedAt: new Date().toISOString(),
      },
      `ปฏิเสธสลิปของ ${slip.customerName} แล้ว (mock)`,
    )
  }

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={!rejecting}
      panelClassName="w-full max-w-2xl p-0"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2 id={titleId} className="text-lg font-semibold text-ink">
            ตรวจสอบสลิป
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            อัปโหลดเมื่อ {formatDateTime(slip.createdAt)}
          </p>
        </div>
        <Badge variant={status.variant} dot>
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 px-6 py-5 sm:grid-cols-[260px_1fr]">
        {/* Slip viewer */}
        <MockSlip slip={slip} />

        {/* Details + actions */}
        <div className="flex flex-col">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="ลูกค้า" value={slip.customerName} />
            <Field label="เบอร์ติดต่อ" value={formatPhone(slip.phone)} mono />
            <Field label="แพ็กเกจ" value={slip.packageName} />
            <Field label="ราคาแพ็กเกจ" value={`฿${formatNumber(slip.expectedAmountThb)}`} mono />
          </dl>

          {/* Amount check */}
          <div
            className={`mt-4 rounded-lg border px-3 py-2.5 ${
              mismatch ? 'border-error/30 bg-error-bg' : 'border-line bg-surface'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-secondary">ยอดบนสลิป</span>
              <span
                className={`font-mono text-base font-bold ${mismatch ? 'text-error' : 'text-ink'}`}
              >
                ฿{formatNumber(slip.declaredAmountThb)}
              </span>
            </div>
            {mismatch && (
              <p className="mt-1 flex items-start gap-1.5 text-xs text-error">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                ยอดไม่ตรงกับราคาแพ็กเกจ (ต่างกัน ฿
                {formatNumber(Math.abs(slip.expectedAmountThb - slip.declaredAmountThb))})
              </p>
            )}
          </div>

          {slip.duplicateFlag && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-xs text-warning">
              <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              สลิปนี้อาจซ้ำกับรายการก่อนหน้า (checksum ตรงกัน) — ตรวจสอบก่อนอนุมัติ
            </p>
          )}

          {/* Resolved record (read-only) */}
          {!pending && (
            <div className="mt-4 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs">
              <p className="flex items-center gap-1.5 font-medium text-ink">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                ลงนามโดย {slip.verifiedBy} · {slip.signedAt && formatDateTime(slip.signedAt)}
              </p>
              {slip.rejectionReason && (
                <p className="mt-1.5 text-ink-secondary">เหตุผล: {slip.rejectionReason}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {pending && !rejecting && (
            <div className="mt-auto flex flex-col gap-2 pt-5">
              {needsAck && (
                <label className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-xs text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={acked}
                    onChange={(e) => setAcked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  ฉันได้ตรวจสอบสลิปนี้แล้ว และยืนยันอนุมัติแม้มีการแจ้งเตือน
                </label>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={approve}
                  disabled={needsAck && !acked}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  อนุมัติ + ลงนาม
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-line bg-panel px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                  ปฏิเสธ
                </button>
              </div>
            </div>
          )}

          {pending && rejecting && (
            <div className="mt-auto flex flex-col gap-2 pt-5">
              <label htmlFor="reject-reason" className="text-[13px] font-medium text-ink">
                เหตุผลที่ปฏิเสธ <span className="text-error">*</span>
              </label>
              <textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                autoFocus
                placeholder="เช่น ยอดโอนไม่ตรง / สลิปไม่ชัด / โอนผิดบัญชี"
                className="w-full resize-none rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reject}
                  disabled={!reason.trim()}
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-error px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ยืนยันปฏิเสธ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false)
                    setReason('')
                  }}
                  className="h-9 rounded-lg px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  ย้อนกลับ
                </button>
              </div>
            </div>
          )}

          {!pending && (
            <button
              type="button"
              onClick={onClose}
              className="mt-auto self-end pt-5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink focus-visible:outline-none"
            >
              ปิด
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className={`text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
