'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, Check, RotateCcw, X } from 'lucide-react'
import { Toast, useToast } from '@/components/ui/toast'
import { FarmDecisionDialog } from '@/features/farms/components/FarmDecisionDialog'
import { decideFarm } from '@/features/farms/actions/farmActions'
import type { FarmDecision } from '@/features/farms/types'
import type { FarmStatus } from '@/features/farmers/types'

type Props = {
  farmId: string
  farmName: string
  farmStatus: FarmStatus
  /** Compact icon buttons for table rows; full labels elsewhere. */
  compact?: boolean
}

/**
 * Which decisions make sense from here — mirrors the transitions the API
 * allows, so the UI never offers a button that can only produce a 409.
 */
function available(status: FarmStatus): FarmDecision[] {
  switch (status) {
    case 'draft':
    case 'pending':
      return ['active', 'rejected']
    case 'active':
      return ['suspended', 'rejected']
    case 'suspended':
      return ['active', 'rejected']
    case 'rejected':
      return ['active']
  }
}

const ICONS: Record<FarmDecision, typeof Check> = {
  active: Check,
  rejected: X,
  suspended: Ban,
}

export function FarmDecisionActions({ farmId, farmName, farmStatus, compact = false }: Props) {
  const [open, setOpen] = useState<FarmDecision | null>(null)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  const { message, showToast } = useToast()
  const router = useRouter()

  const options = available(farmStatus)

  function confirm(decision: FarmDecision, reason?: string) {
    setError(undefined)
    startTransition(async () => {
      const res = await decideFarm(farmId, decision, reason)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setOpen(null)
      showToast(
        decision === 'active'
          ? 'อนุมัติฟาร์มแล้ว'
          : decision === 'rejected'
            ? 'บันทึกการไม่อนุมัติแล้ว'
            : 'ระงับการใช้งานฟาร์มแล้ว',
      )
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {options.map((decision) => {
          const Icon = decision === 'active' && farmStatus !== 'draft' ? RotateCcw : ICONS[decision]
          const danger = decision !== 'active'
          const label =
            decision === 'active'
              ? farmStatus === 'draft' || farmStatus === 'pending'
                ? 'อนุมัติ'
                : 'เปิดใช้งาน'
              : decision === 'rejected'
                ? 'ไม่อนุมัติ'
                : 'ระงับ'

          return (
            <button
              key={decision}
              type="button"
              onClick={() => {
                setError(undefined)
                setOpen(decision)
              }}
              title={label}
              aria-label={`${label} — ${farmName}`}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                danger
                  ? 'border-line text-ink-secondary hover:bg-error-bg hover:text-error focus-visible:ring-error'
                  : 'border-primary/30 text-primary hover:bg-primary-subtle focus-visible:ring-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {!compact && label}
            </button>
          )
        })}
      </div>

      {open && (
        <FarmDecisionDialog
          farmName={farmName}
          decision={open}
          pending={pending}
          error={error}
          onConfirm={(reason) => confirm(open, reason)}
          onClose={() => setOpen(null)}
        />
      )}

      <Toast message={message} />
    </>
  )
}
