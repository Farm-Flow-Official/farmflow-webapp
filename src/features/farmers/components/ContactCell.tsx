'use client'

import { useState, useTransition } from 'react'
import { Eye, Phone } from 'lucide-react'
import { formatPhone } from '@/lib/utils/format'
import { revealFarmerContact } from '@/features/farmers/actions/contactActions'

type Props = {
  farmerId: string
  phoneMasked: string | null
  emailMasked: string | null
  hasContact: boolean
}

/**
 * A farmer's contact details, masked until deliberately revealed
 * (ADMIN-PROJ-03).
 *
 * The masked form is enough to confirm a number on file while scanning a table.
 * Revealing it is a separate, permissioned request that writes a `READ_PII`
 * audit row — so the button is not a UI nicety, it is the thing being recorded.
 * The label says so, because an admin who does not know they are being logged
 * cannot make an informed choice about clicking it.
 */
export function ContactCell({ farmerId, phoneMasked, emailMasked, hasContact }: Props) {
  const [revealed, setRevealed] = useState<{ phone: string | null; email: string | null } | null>(
    null,
  )
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  if (!hasContact) return <span className="text-[13px] text-ink-disabled">—</span>

  function reveal() {
    setError(undefined)
    startTransition(async () => {
      const res = await revealFarmerContact(farmerId)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setRevealed({ phone: res.phone ?? null, email: res.email ?? null })
    })
  }

  if (revealed) {
    return (
      <span className="flex flex-col text-[13px] leading-tight">
        <span className="font-mono text-ink">
          {revealed.phone ? formatPhone(revealed.phone) : '—'}
        </span>
        {revealed.email && (
          <span className="truncate text-[12px] text-ink-muted">{revealed.email}</span>
        )}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="flex flex-col text-[13px] leading-tight">
        <span className="font-mono text-ink-secondary">{phoneMasked ?? '—'}</span>
        {emailMasked && (
          <span className="truncate text-[12px] text-ink-muted">{emailMasked}</span>
        )}
      </span>
      <button
        type="button"
        onClick={reveal}
        disabled={pending}
        title="ดูข้อมูลติดต่อจริง — การเปิดดูจะถูกบันทึกใน Audit Log"
        aria-label="เปิดดูข้อมูลติดต่อจริง (บันทึกใน Audit Log)"
        className="shrink-0 rounded p-1 text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
      >
        {pending ? (
          <Phone className="h-3.5 w-3.5 animate-pulse" strokeWidth={1.9} />
        ) : (
          <Eye className="h-3.5 w-3.5" strokeWidth={1.9} />
        )}
      </button>
      {error && <span className="text-[11px] text-error">{error}</span>}
    </span>
  )
}
