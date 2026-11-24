import { formatNumber } from '@/lib/utils/format'
import type { SpeciesUsage } from '@/features/species/types'
import { isInUse } from '@/features/species/types'

/**
 * What is standing on one species.
 *
 * Shown as a column rather than buried in a dialog because it is the fact that
 * decides whether a row is safe to touch — a reader scanning the table should
 * be able to see which species are load-bearing before clicking anything.
 */
export function SpeciesUsageCell({ usage }: { usage: SpeciesUsage }) {
  if (!isInUse(usage)) {
    return <span className="text-[12px] text-ink-muted">ยังไม่มีใครใช้</span>
  }

  const parts = [
    usage.farms > 0 && `${formatNumber(usage.farms)} ฟาร์ม`,
    usage.projects > 0 && `${formatNumber(usage.projects)} โครงการ`,
    usage.calculatedTrees > 0 && `${formatNumber(usage.calculatedTrees)} ต้น`,
  ].filter(Boolean)

  return <span className="text-[12px] text-ink-secondary">{parts.join(' · ')}</span>
}
