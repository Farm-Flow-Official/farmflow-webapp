import type { Kpi, CarbonFunnel } from '@/features/executive/types'

/**
 * MoM change from a KPI's value vs its prevValue (end of last month).
 * `dir` drives the arrow + status color; `pct` is already rounded to 1 dp.
 */
export function deltaPct(kpi: Kpi): { pct: number; dir: 'up' | 'down' | 'flat' } {
  if (kpi.prevValue === 0) return { pct: 0, dir: 'flat' }
  const raw = ((kpi.value - kpi.prevValue) / kpi.prevValue) * 100
  const pct = Math.round(raw * 10) / 10
  return { pct, dir: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
}

/**
 * Carbon lifecycle stages, ordered estimated → sold. Colours are a single-hue
 * green SEQUENTIAL ramp (light → dark) — the measure is the same (tCO₂e) at
 * every stage, so magnitude, not identity, is what colour encodes. Darker = later
 * stage, drawing the eye toward the converted (sold) end.
 */
export const FUNNEL_STAGES = [
  { key: 'estimated', label: 'ประเมิน', color: '#BBF7D0' },
  { key: 'verified', label: 'ตรวจสอบแล้ว', color: '#86EFAC' },
  { key: 'submitted', label: 'ยื่นขอรับรอง', color: '#4ADE80' },
  { key: 'certified', label: 'รับรองแล้ว', color: '#22C55E' },
  { key: 'available', label: 'พร้อมขาย', color: '#15803D' },
  { key: 'sold', label: 'ขายแล้ว', color: '#166534' },
] as const satisfies ReadonlyArray<{
  key: keyof CarbonFunnel
  label: string
  color: string
}>

/** Single-series brand green for the trend bars (one measure → one hue). */
export const TREND_COLOR = '#166534'
