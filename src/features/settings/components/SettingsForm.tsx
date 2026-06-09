'use client'

import { useState } from 'react'
import { Coins, Clock, UserCog, AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import { formatNumber, formatDateTime } from '@/lib/utils/format'
import {
  MARKET_PRICE_MIN_THB,
  MARKET_PRICE_MAX_THB,
  MARKET_PRICE_LARGE_CHANGE,
} from '@/lib/constants/carbon'
import {
  PRICE_SOURCE_LABEL,
  type SystemConfig,
} from '@/features/settings/types'

type Props = {
  config: SystemConfig
  /** Username of the signed-in admin — recorded as the editor on save. */
  currentAdminUsername: string
}

export function SettingsForm({ config, currentAdminUsername }: Props) {
  const [price, setPrice] = useState(config.marketPriceThb)
  const [meta, setMeta] = useState({
    effectiveFrom: config.effectiveFrom,
    updatedByLabel: config.updatedByLabel ?? config.updatedByAdminId,
    updatedAt: config.updatedAt,
  })
  const [draft, setDraft] = useState(String(config.marketPriceThb))
  const [confirming, setConfirming] = useState(false)
  const { message, showToast } = useToast()

  const parsed = Number(draft)
  const isNumber = draft.trim() !== '' && Number.isFinite(parsed)
  const valid =
    isNumber && parsed >= MARKET_PRICE_MIN_THB && parsed <= MARKET_PRICE_MAX_THB
  const changed = valid && parsed !== price

  const priceError = !isNumber
    ? 'กรุณากรอกตัวเลขราคา'
    : parsed < MARKET_PRICE_MIN_THB
      ? `ราคาต้องไม่ต่ำกว่า ฿${MARKET_PRICE_MIN_THB}`
      : parsed > MARKET_PRICE_MAX_THB
        ? `ราคาต้องไม่เกิน ฿${formatNumber(MARKET_PRICE_MAX_THB)}`
        : null
  const showError = draft.trim() !== '' && priceError !== null

  const pctChange = price > 0 ? Math.abs(parsed - price) / price : 0
  const bigChange = valid && pctChange > MARKET_PRICE_LARGE_CHANGE
  const pctLabel = `${parsed >= price ? '+' : '−'}${Math.round(pctChange * 100)}%`

  // MOCK ONLY — local state, no persistence. Replace with Server Action / fetch.
  function handleSave() {
    // Seam: await updateSystemConfig({ marketPriceThb: parsed })
    setPrice(parsed)
    setMeta({
      effectiveFrom: new Date().toISOString(),
      updatedByLabel: `${currentAdminUsername} (mock)`,
      updatedAt: new Date().toISOString(),
    })
    setConfirming(false)
    showToast('อัปเดตราคาคาร์บอนเรียบร้อย (mock — ยังไม่บันทึกจริง)')
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Price card */}
      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
            <Coins className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink">ราคาคาร์บอนเครดิต</h2>
            <p className="text-xs text-ink-muted">
              มูลค่าโดยประมาณของเกษตรกรทั้งหมดคำนวณจากราคานี้
            </p>
          </div>
        </div>

        {/* Current value */}
        <div className="mb-5 rounded-xl border border-line bg-surface px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            ราคาปัจจุบัน
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-ink">
            ฿{formatNumber(price)}
            <span className="ml-1 text-sm font-normal text-ink-muted">/ tCO₂e</span>
          </p>
        </div>

        {/* Editor */}
        <label htmlFor="market-price" className="mb-1.5 block text-sm font-medium text-ink">
          ตั้งราคาใหม่
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
              ฿
            </span>
            <input
              id="market-price"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-invalid={showError}
              className={`h-11 w-full rounded-lg border bg-panel pl-7 pr-20 font-mono text-sm text-ink transition-shadow focus:outline-none focus:ring-2 ${
                showError
                  ? 'border-error-border focus:border-error focus:ring-error/15'
                  : 'border-line focus:border-primary focus:ring-primary/15'
              }`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
              / tCO₂e
            </span>
          </div>
          <button
            type="button"
            disabled={!changed}
            onClick={() => setConfirming(true)}
            className="h-11 shrink-0 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            บันทึก
          </button>
        </div>
        {showError && <p className="mt-1.5 text-xs text-error">{priceError}</p>}
        <p className="mt-1.5 text-xs text-ink-muted">
          ช่วงที่ตั้งได้: ฿{MARKET_PRICE_MIN_THB}–฿{formatNumber(MARKET_PRICE_MAX_THB)} / tCO₂e
        </p>
      </section>

      {/* Meta card */}
      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          ข้อมูลการตั้งราคา
        </h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-secondary">แหล่งที่มาของราคา</dt>
            <dd>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary">
                {PRICE_SOURCE_LABEL[config.priceSource]}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-ink-secondary">
              <Clock className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
              มีผลตั้งแต่
            </dt>
            <dd className="text-ink" suppressHydrationWarning>
              {formatDateTime(meta.effectiveFrom)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-ink-secondary">
              <UserCog className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
              อัปเดตล่าสุดโดย
            </dt>
            <dd className="text-right text-ink">
              <span className="font-mono">{meta.updatedByLabel}</span>
              <span className="ml-2 text-xs text-ink-muted" suppressHydrationWarning>
                {formatDateTime(meta.updatedAt)}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {confirming && (
        <ConfirmDialog
          title="ยืนยันการปรับราคา"
          description={
            <>
              ปรับราคาคาร์บอนเป็น{' '}
              <span className="font-semibold text-ink">
                ฿{formatNumber(parsed)} / tCO₂e
              </span>
              ? ราคานี้จะใช้เป็นฐานคำนวณมูลค่าโดยประมาณของเกษตรกร
              {bigChange && (
                <span className="mt-3 flex items-start gap-1.5 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span>
                    เปลี่ยนแปลงจากราคาเดิมมาก: ฿{formatNumber(price)} → ฿
                    {formatNumber(parsed)} ({pctLabel})
                  </span>
                </span>
              )}
            </>
          }
          confirmLabel={bigChange ? 'ยืนยันการเปลี่ยนแปลง' : 'ยืนยันปรับราคา'}
          tone={bigChange ? 'danger' : 'primary'}
          onConfirm={handleSave}
          onClose={() => setConfirming(false)}
        />
      )}

      <Toast message={message} />
    </div>
  )
}
