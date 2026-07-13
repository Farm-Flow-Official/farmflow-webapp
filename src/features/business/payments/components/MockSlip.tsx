import { CheckCircle2 } from 'lucide-react'
import { formatDateTime, formatNumber } from '@/lib/utils/format'
import type { PaymentSlip } from '@/features/business/payments/types'

/**
 * Stand-in for the uploaded slip image (`files`). Renders a styled mock bank
 * transfer slip from the slip metadata. Bank details are mock display only —
 * never persisted (no bank fields in the DB). Replace with the real file
 * preview (`/api/v1/files/:id/content`) when the upload pipeline is wired.
 */
export function MockSlip({ slip }: { slip: PaymentSlip }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-white">
      {/* mock watermark */}
      <span className="absolute right-2 top-2 rounded bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
        ตัวอย่าง · mock
      </span>

      <div className="flex flex-col items-center gap-1 border-b border-dashed border-line bg-surface px-4 py-4 text-center">
        <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={1.75} />
        <p className="text-sm font-semibold text-ink">โอนเงินสำเร็จ</p>
        <p className="text-[11px] text-ink-muted">{slip.slip.bankName}</p>
      </div>

      <dl className="flex flex-col gap-2.5 px-4 py-4 text-[13px]">
        <Row label="จำนวนเงิน">
          <span className="font-mono text-base font-bold text-ink">
            ฿{formatNumber(slip.declaredAmountThb)}
          </span>
        </Row>
        <Row label="เข้าบัญชี">
          <span className="text-ink">{slip.slip.accountName}</span>
        </Row>
        <Row label="วันเวลาโอน">
          <span className="text-ink-secondary">{formatDateTime(slip.slip.transferredAt)}</span>
        </Row>
        <Row label="เลขอ้างอิง">
          <span className="font-mono text-ink-secondary">{slip.slip.transferRef}</span>
        </Row>
      </dl>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}
