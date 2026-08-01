import { formatRai, formatRaiExact } from '@/lib/utils/format'
import { InfoTooltip } from '@/components/ui/info-tooltip'

/**
 * An area in rai, rounded to two decimals, with the exact stored value one tap
 * away (GLOBAL-04).
 *
 * Two places is what a person can scan and compare down a column; the full
 * figure still matters when an area is disputed or reconciled against a
 * declared one, so it is hidden rather than discarded. The tooltip is only
 * rendered when the exact value actually differs from the rounded one —
 * offering "see full precision" on `12.00` is noise.
 */
export function AreaRai({
  rai,
  className = '',
}: {
  rai: number | null | undefined
  className?: string
}) {
  if (rai == null) return <span className="text-ink-disabled">—</span>

  const rounded = formatRai(rai)
  const exact = formatRaiExact(rai)
  const truncated = exact !== rounded

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="font-mono tabular-nums">{rounded}</span>
      {truncated && (
        <InfoTooltip label="ดูค่าเต็มความละเอียด">
          <span className="font-mono">{exact}</span>
        </InfoTooltip>
      )}
    </span>
  )
}
