'use client'

import { useState } from 'react'
import { ShieldOff, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MockTag } from '@/components/ui/mock-tag'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
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
  const { message, showToast } = useToast()

  const isActive = status === 'Active'
  const displayName = farmer.fullName ?? farmer.username
  const initial = displayName.charAt(0).toUpperCase()
  const nextStatus: FarmerAccountStatus = isActive ? 'Suspended' : 'Active'

  async function runAction() {
    setPending(true)
    // MOCK ONLY — no persistence. Replace with a real Server Action when ready:
    //   await setFarmerStatus(farmer.id, nextStatus)   // revalidates the page
    await new Promise<void>((r) => setTimeout(r, 700))
    setStatus(nextStatus)
    setPending(false)
    setConfirming(false)
    showToast(
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
              <h1 className="text-xl font-semibold text-ink">{displayName}</h1>
              {(!farmer._live || !farmer.fullName) && <MockTag />}
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

      {confirming && (
        <ConfirmDialog
          title={isActive ? 'ยืนยันการระงับบัญชี' : 'ยืนยันการเปิดใช้งาน'}
          description={
            isActive
              ? `ระงับบัญชีของ "${farmer.fullName}"? เกษตรกรจะไม่สามารถเข้าใช้งานได้จนกว่าจะเปิดใช้งานอีกครั้ง`
              : `เปิดใช้งานบัญชีของ "${farmer.fullName}" ให้กลับมาใช้งานได้ตามปกติ?`
          }
          confirmLabel={isActive ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
          tone={isActive ? 'danger' : 'primary'}
          pending={pending}
          onConfirm={runAction}
          onClose={() => setConfirming(false)}
        />
      )}

      <Toast message={message} />
    </>
  )
}
