'use client'

import { useState } from 'react'
import { ShieldOff, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils/format'
import type { FarmerDetail, FarmerAccountStatus } from '@/features/farmers/types'
import { setFarmerStatus } from '@/features/farmers/actions/setFarmerStatus'

/**
 * Suspend / reactivate a farmer account via the `setFarmerStatus` Server Action
 * (PATCH /admin/farmers/:id/status) — persists + audits server-side, then
 * updates local state for immediate feedback.
 */
export function FarmerProfileHeader({ farmer }: { farmer: FarmerDetail }) {
  const [status, setStatus] = useState<FarmerAccountStatus>(farmer.accountStatus)
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const { message, showToast } = useToast()

  const isActive = status === 'Active'
  const displayName = farmer.fullName
  const initial = displayName.charAt(0).toUpperCase()
  const nextStatus: FarmerAccountStatus = isActive ? 'Suspended' : 'Active'

  async function runAction() {
    setPending(true)
    const res = await setFarmerStatus(farmer.id, nextStatus)
    setPending(false)
    if (!res.ok) {
      showToast(res.error ?? 'อัปเดตสถานะไม่สำเร็จ')
      return
    }
    setStatus(nextStatus)
    setConfirming(false)
    showToast(
      nextStatus === 'Suspended' ? 'ระงับบัญชีเรียบร้อย' : 'เปิดใช้งานบัญชีเรียบร้อย',
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
