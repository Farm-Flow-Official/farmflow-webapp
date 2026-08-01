import { formatCarbonExact, formatCarbonKg, formatCarbonTonnes } from '@/lib/utils/format'
import { InfoTooltip } from '@/components/ui/info-tooltip'

/**
 * A carbon quantity: tonnes first, kilograms second, both to two decimals
 * (GLOBAL-02).
 *
 * Carbon is stored in kg because that is what the calculator produces, but
 * tonnes is the unit the thing is *bought and sold* in — a screen leading with
 * kilograms reads like a lab result rather than an asset, and it disagreed with
 * the market price sitting next to it, which has always been per tonne.
 *
 * Two decimals everywhere, because this is what a farmer is paid for and the
 * same quantity must not read differently from one screen to the next. The
 * stored value keeps full precision and sits one tap away — rounding a payment
 * figure with no way back to the real one is how a dispute becomes
 * unanswerable. The affordance appears only when rounding actually hid
 * something.
 *
 * @param stacked put the kg figure on its own line instead of in brackets
 * @param exact   set false where the affordance would clutter a dense table
 */
export function Carbon({
  kgCo2e,
  stacked = false,
  exact = true,
  className = '',
}: {
  kgCo2e: number | null | undefined
  stacked?: boolean
  exact?: boolean
  className?: string
}) {
  if (kgCo2e == null) return <span className="text-ink-disabled">—</span>

  const tonnes = formatCarbonTonnes(kgCo2e)
  const kg = formatCarbonKg(kgCo2e)

  // Nothing was hidden when the value already fits two places — offering "see
  // full precision" on an exact figure is noise.
  const truncated = exact && Math.round(kgCo2e * 100) / 100 !== kgCo2e

  const info = truncated ? (
    <InfoTooltip label="ดูค่าเต็มที่ระบบเก็บไว้">
      <p className="font-medium text-ink">ค่าที่ระบบเก็บจริง</p>
      <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-ink-secondary">
        {formatCarbonExact(kgCo2e)}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
        ตัวเลขบนหน้าจอปัดเป็นทศนิยม 2 ตำแหน่งเพื่อให้อ่านและเทียบกันได้ —
        การคำนวณและการออกเครดิตใช้ค่าเต็มนี้เสมอ
      </p>
    </InfoTooltip>
  ) : null

  if (stacked) {
    return (
      <span className={`inline-flex flex-col ${className}`}>
        <span className="inline-flex items-center gap-1">
          <span className="font-mono tabular-nums">{tonnes}</span>
          {info}
        </span>
        <span className="font-mono text-[11px] font-normal tabular-nums text-ink-muted">{kg}</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="font-mono tabular-nums">
        {tonnes} <span className="text-[11px] font-normal text-ink-muted">({kg})</span>
      </span>
      {info}
    </span>
  )
}
