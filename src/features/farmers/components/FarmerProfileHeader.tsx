'use client'

import { useEffect, useState } from 'react'
import { ShieldOff, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import type { FarmerDetail, FarmerAccountStatus } from '@/features/farmers/types'

/**
 * ⚠️ BEYOND CURRENT REQUIREMENTS — read before extending.
 *
 * The Suspend / Activate account action is NOT in the A-04 spec (all listed
 * sections are view-only) and the business requirements describe the prototype
 * as auto-`Active` with KYC bypassed — there is no documented farmer-suspension
 * flow. This was likely an overlooked-but-sensible capability, so it's kept as
 * a MOCK: the status flips optimistically in local state only — nothing is
 * persisted. When the API lands, replace the body of `runAction()` with a real
 * Server Action / fetch and let the server revalidate the page.
 */
export function FarmerProfileHeader({ farmer }: { farmer: FarmerDetail }) {
  const [status, setStatus] = useState<FarmerAccountStatus>(farmer.accountStatus)
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const isActive = status === 'Active'
  const initial = farmer.fullName.charAt(0)
  const nextStatus: FarmerAccountStatus = isActive ? 'Suspended' : 'Active'

  // Close the confirm dialog on Escape.
  useEffect(() => {
    if (!confirming) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirming(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming])

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  async function runAction() {
    setPending(true)
    // MOCK ONLY — no persistence. Replace with a real Server Action when ready:
    //   await setFarmerStatus(farmer.id, nextStatus)   // revalidates the page
    await new Promise<void>((r) => setTimeout(r, 700))
    setStatus(nextStatus)
    setPending(false)
    setConfirming(false)
    setToast(
      nextStatus === 'Suspended'
        ? 'ระงับบัญชีเรียบร้อย (mock — ยังไม่บันทึกจริง)'
        : 'เปิดใช้งานบัญชีเรียบร้อย (mock — ยังไม่บันทึกจริง)',
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-panel p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white transition-colors ${
              isActive ? 'bg-primary' : 'bg-ink-muted'
            }`}
          >
            {initial}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-ink">{farmer.fullName}</h1>
              <Badge variant={isActive ? 'verified' : 'neutral'} dot>
                {status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              <span className="mr-3 font-mono">{farmer.id}</span>
              สมัครเมื่อ {formatDate(farmer.registeredAt)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            isActive
              ? 'border-error-border bg-error-bg text-error hover:bg-error hover:text-white'
              : 'border-primary-muted bg-primary-subtle text-primary hover:bg-primary hover:text-white'
          }`}
        >
          {isActive ? (
            <ShieldOff className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          ) : (
            <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          )}
          {isActive ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
        </button>
      </div>

      {/* Confirm dialog */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <button
            type="button"
            aria-label="ปิด"
            onClick={() => setConfirming(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  isActive ? 'bg-error-bg text-error' : 'bg-primary-subtle text-primary'
                }`}
              >
                <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h2 id="confirm-title" className="text-base font-semibold text-ink">
                {isActive ? 'ยืนยันการระงับบัญชี' : 'ยืนยันการเปิดใช้งาน'}
              </h2>
            </div>
            <p className="mb-5 text-sm text-ink-secondary">
              {isActive
                ? `ระงับบัญชีของ "${farmer.fullName}"? เกษตรกรจะไม่สามารถเข้าใช้งานได้จนกว่าจะเปิดใช้งานอีกครั้ง`
                : `เปิดใช้งานบัญชีของ "${farmer.fullName}" ให้กลับมาใช้งานได้ตามปกติ?`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={runAction}
                disabled={pending}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? 'bg-error hover:bg-error/90 focus-visible:ring-error'
                    : 'bg-primary hover:bg-primary-hover focus-visible:ring-primary'
                }`}
              >
                {pending
                  ? 'กำลังดำเนินการ…'
                  : isActive
                    ? 'ระงับบัญชี'
                    : 'เปิดใช้งาน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-line bg-panel px-4 py-3 text-sm font-medium text-ink shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
          {toast}
        </div>
      )}
    </>
  )
}
