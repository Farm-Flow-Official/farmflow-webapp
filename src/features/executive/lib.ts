import type { CarbonFunnel, Kpi } from '@/features/executive/types'

/**
 * Month-over-month change, percent. Positive = growth. Returns 0 when there is
 * no baseline (avoids Infinity on a zero prevValue).
 */
export function deltaPct(kpi: Kpi): number {
  if (kpi.prevValue === 0) return 0
  return ((kpi.value - kpi.prevValue) / kpi.prevValue) * 100
}

/**
 * Carbon funnel stages in display order (many → few) with Thai labels and a
 * sequential green ramp (light → dark = deeper in the lifecycle). Hex, not theme
 * tokens, because the inline bar fills need raw colour values.
 */
export const FUNNEL_STAGES: {
  key: keyof CarbonFunnel
  label: string
  color: string
}[] = [
  { key: 'estimated', label: 'ประเมิน', color: '#86EFAC' },
  { key: 'verified', label: 'ตรวจสอบแล้ว', color: '#4ADE80' },
  { key: 'submitted', label: 'ยื่นขอรับรอง', color: '#22C55E' },
  { key: 'certified', label: 'รับรองแล้ว', color: '#16A34A' },
  { key: 'available', label: 'พร้อมขาย', color: '#15803D' },
  { key: 'sold', label: 'ขายแล้ว', color: '#166534' },
]
