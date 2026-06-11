'use client'

import { useId, useState } from 'react'
import { AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPhone } from '@/lib/utils/format'
import type {
  CustomerSubscription,
  Package,
} from '@/features/business/packages/types'
import {
  effectiveCap,
  evaluateTierChange,
  isOverQuota,
  statusBadge,
} from '@/features/business/packages/lib'

type Props = {
  sub: CustomerSubscription
  packages: Package[]
  onClose: () => void
  /** Optimistic mock apply — Seam: `PATCH /api/business/subscriptions/:id`. */
  onApply: (updated: CustomerSubscription, message: string) => void
}

export function SubscriptionDetailModal({ sub, packages, onClose, onApply }: Props) {
  const titleId = useId()
  const [selectedCode, setSelectedCode] = useState(sub.packageCode)

  const current = packages.find((p) => p.code === sub.packageCode)!
  const target = packages.find((p) => p.code === selectedCode)!
  const change = evaluateTierChange(sub, current, target)
  const status = statusBadge(sub.status)
  const cap = effectiveCap(sub)
  const over = isOverQuota(sub)

  function applyTierChange() {
    if (change.direction === 'same' || change.blocked) return
    const verb = change.direction === 'upgrade' ? 'อัปเกรด' : 'ดาวน์เกรด'
    onApply(
      {
        ...sub,
        packageCode: target.code,
        packageName: target.name,
        quotaRai: target.quotaRai,
      },
      `${verb}แพ็กเกจของ ${sub.customerName} เป็น ${target.name} แล้ว (mock)`,
    )
  }

  function applyStatus(next: 'Active' | 'Suspended') {
    const word = next === 'Suspended' ? 'ระงับ' : 'เปิดใช้งาน'
    onApply(
      {
        ...sub,
        status: next,
        startedAt: next === 'Active' && !sub.startedAt ? new Date().toISOString() : sub.startedAt,
      },
      `${word}บัญชีของ ${sub.customerName} แล้ว (mock)`,
    )
  }

  return (
    <Modal onClose={onClose} labelledBy={titleId} closeOnBackdrop={false} panelClassName="w-full max-w-lg p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-lg font-semibold text-ink">
            {sub.customerName}
          </h2>
          <p className="mt-0.5 font-mono text-[13px] text-ink-secondary">
            {formatPhone(sub.phone)}
          </p>
        </div>
        <Badge variant={status.variant} dot>
          {status.label}
        </Badge>
      </div>

      {/* Current snapshot */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <Field label="แพ็กเกจปัจจุบัน" value={sub.packageName} />
        <Field
          label="พื้นที่ใช้งาน"
          value={`${sub.usedRai} / ${cap == null ? '∞' : cap} ไร่`}
          tone={over ? 'error' : undefined}
        />
        <Field label="เริ่มใช้งาน" value={sub.startedAt ? formatDate(sub.startedAt) : '—'} />
        <Field label="หมดอายุ" value={sub.expiryDate ? formatDate(sub.expiryDate) : '—'} />
      </dl>

      {/* Change tier */}
      <section className="mt-5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          เปลี่ยนแพ็กเกจ
        </p>
        <div className="flex items-center gap-2">
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value as typeof selectedCode)}
            className="h-10 flex-1 rounded-lg border border-line bg-panel px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            {packages.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
                {p.priceThb > 0 ? ` · ฿${p.priceThb.toLocaleString()}` : ' · ฟรี'}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyTierChange}
            disabled={change.direction === 'same' || change.blocked}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {change.direction === 'upgrade' && <ArrowUpRight className="h-4 w-4" strokeWidth={2} />}
            {change.direction === 'downgrade' && <ArrowDownRight className="h-4 w-4" strokeWidth={2} />}
            บันทึก
          </button>
        </div>

        {change.blocked && change.reason && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-error">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {change.reason}
          </p>
        )}
      </section>

      {/* Status actions */}
      <section className="mt-5 border-t border-line pt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          สถานะบัญชี
        </p>
        <div className="flex flex-wrap gap-2">
          {sub.status === 'Active' ? (
            <button
              type="button"
              onClick={() => applyStatus('Suspended')}
              className="h-9 rounded-lg border border-line bg-panel px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              ระงับการใช้งาน
            </button>
          ) : (
            <button
              type="button"
              onClick={() => applyStatus('Active')}
              className="h-9 rounded-lg border border-primary-muted bg-primary-subtle px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-subtle/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {sub.status === 'Pending_Payment' ? 'อนุมัติ + เปิดใช้งาน' : 'เปิดใช้งานอีกครั้ง'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto h-9 rounded-lg px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ปิด
          </button>
        </div>
      </section>
    </Modal>
  )
}

function Field({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'error'
}) {
  return (
    <div>
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className={`font-medium ${tone === 'error' ? 'text-error' : 'text-ink'}`}>{value}</dd>
    </div>
  )
}
