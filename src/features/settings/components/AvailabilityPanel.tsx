'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Power, PowerOff, Wrench } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDateTime } from '@/lib/utils/format'
import { setDashboardAvailability } from '@/features/settings/actions/availabilityActions'
import {
  DASHBOARD_LABELS,
  type DashboardAvailability,
} from '@/features/settings/types/availability'

/**
 * Open and close each dashboard independently (ADMIN-SYS-01).
 *
 * Closing opens a dialog rather than flipping a switch: it takes a whole
 * audience offline, and it requires a reason those people will read. A toggle
 * that did it in one click would make an outage as easy to cause as to undo,
 * which they are not.
 *
 * The admin console is absent by design — it is where this panel lives.
 */
export function AvailabilityPanel({ rows }: { rows: DashboardAvailability[] }) {
  const [closing, setClosing] = useState<DashboardAvailability | null>(null)
  const [pending, startTransition] = useTransition()
  const { message, showToast } = useToast()
  const router = useRouter()

  function reopen(row: DashboardAvailability) {
    startTransition(async () => {
      const res = await setDashboardAvailability(row.dashboard, { isEnabled: true })
      showToast(res.ok ? `เปิด ${DASHBOARD_LABELS[row.dashboard]} แล้ว` : (res.error ?? 'ไม่สำเร็จ'))
      if (res.ok) router.refresh()
    })
  }

  return (
    <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-ink-muted" strokeWidth={1.9} />
        <h2 className="text-base font-semibold text-ink">เปิด/ปิดแดชบอร์ด</h2>
      </div>
      <p className="mb-5 text-[13px] text-ink-secondary">
        ปิดปรับปรุงแยกรายแดชบอร์ดได้ · ผู้ใช้จะเห็นหน้าปิดปรับปรุงพร้อมเหตุผลที่ระบุไว้ ·
        แดชบอร์ดผู้ดูแลระบบปิดไม่ได้ เพราะเป็นที่ตั้งของสวิตช์นี้
      </p>

      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.dashboard}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-ink">
                  {DASHBOARD_LABELS[row.dashboard]}
                </span>
                <Badge variant={row.isEnabled ? 'verified' : 'rejected'} dot>
                  {row.isEnabled ? 'เปิดใช้งาน' : 'ปิดปรับปรุง'}
                </Badge>
              </div>

              {!row.isEnabled && row.reason && (
                <p className="mt-1 text-[12px] leading-relaxed text-ink-secondary">{row.reason}</p>
              )}
              {!row.isEnabled && row.expectedBackAt && (
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  คาดว่าจะเปิด {formatDateTime(row.expectedBackAt)}
                </p>
              )}
              {row.updatedByLabel && row.updatedAt && (
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  แก้ไขโดย {row.updatedByLabel} · {formatDateTime(row.updatedAt)}
                </p>
              )}
            </div>

            {row.isEnabled ? (
              <button
                type="button"
                onClick={() => setClosing(row)}
                disabled={pending}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:opacity-50"
              >
                <PowerOff className="h-3.5 w-3.5" strokeWidth={2} />
                ปิดปรับปรุง
              </button>
            ) : (
              <button
                type="button"
                onClick={() => reopen(row)}
                disabled={pending}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/30 px-3 text-[13px] font-medium text-primary transition-colors hover:bg-primary-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <Power className="h-3.5 w-3.5" strokeWidth={2} />
                เปิดใช้งาน
              </button>
            )}
          </li>
        ))}
      </ul>

      {closing && (
        <CloseDialog
          row={closing}
          onClose={() => setClosing(null)}
          onDone={(msg) => {
            setClosing(null)
            showToast(msg)
            router.refresh()
          }}
        />
      )}

      <Toast message={message} />
    </section>
  )
}

function CloseDialog({
  row,
  onClose,
  onDone,
}: {
  row: DashboardAvailability
  onClose: () => void
  onDone: (message: string) => void
}) {
  const [reason, setReason] = useState('')
  const [backAt, setBackAt] = useState('')
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      const res = await setDashboardAvailability(row.dashboard, {
        isEnabled: false,
        reason,
        // `datetime-local` has no zone; the browser's own offset is the right
        // interpretation, since the admin typed it in their local time.
        expectedBackAt: backAt ? new Date(backAt).toISOString() : undefined,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      onDone(`ปิดปรับปรุง ${DASHBOARD_LABELS[row.dashboard]} แล้ว`)
    })
  }

  return (
    <Modal
      onClose={() => !pending && onClose()}
      closeOnBackdrop={false}
      panelClassName="w-full max-w-md p-6"
    >
      <h2 className="text-base font-semibold text-ink">
        ปิดปรับปรุง {DASHBOARD_LABELS[row.dashboard]}
      </h2>
      <p className="mt-1 text-[13px] text-ink-secondary">
        ผู้ใช้ทุกคนของแดชบอร์ดนี้จะเข้าใช้งานไม่ได้จนกว่าจะเปิดอีกครั้ง
      </p>

      <label className="mt-4 block text-[13px] font-medium text-ink">
        เหตุผล <span className="text-error">*</span>
      </label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        maxLength={2000}
        disabled={pending}
        placeholder="เช่น ปรับปรุงระบบคำนวณคาร์บอน คาดว่าใช้เวลา 2 ชั่วโมง"
        className="mt-1.5 w-full resize-y rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
      />
      <p className="mt-1 text-[12px] text-ink-muted">ข้อความนี้จะแสดงบนหน้าปิดปรับปรุง</p>

      <label className="mt-4 block text-[13px] font-medium text-ink">
        กำหนดเปิดอีกครั้ง (ถ้ามี)
      </label>
      <input
        type="datetime-local"
        value={backAt}
        onChange={(e) => setBackAt(e.target.value)}
        disabled={pending}
        className="mt-1.5 h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
      />

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
          className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || reason.trim().length === 0}
          className="h-9 rounded-lg bg-error px-4 text-sm font-semibold text-white transition-colors hover:bg-error/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'กำลังบันทึก…' : 'ปิดปรับปรุง'}
        </button>
      </div>
    </Modal>
  )
}
