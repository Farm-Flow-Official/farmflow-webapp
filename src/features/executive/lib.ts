import { CONFIDENCE_MIN } from '@/features/verifier/lib/confidence'
import type { CarbonFunnel, ExecutiveOverview, Kpi } from '@/features/executive/types'

/**
 * Month-over-month change, percent. Positive = growth. Returns 0 when there is
 * no baseline (avoids Infinity on a zero prevValue).
 */
export function deltaPct(kpi: Kpi): number {
  if (kpi.prevValue === 0) return 0
  return ((kpi.value - kpi.prevValue) / kpi.prevValue) * 100
}

/** Tonnes to two decimals — the platform-wide carbon rule (GLOBAL-02). */
export function formatTonnes(tonnes: number): string {
  return tonnes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

/** `2026-08` → `ส.ค.` — a bare month label for a 12-point axis. */
export function monthLabel(month: string): string {
  const index = Number(month.split('-')[1]) - 1
  return THAI_MONTHS[index] ?? month
}

/**
 * Categorical slots for series identity, in the order they must be consumed.
 *
 * The ORDER is the colourblind-safety mechanism, not a preference — the set was
 * validated all-pairs (dataviz `validate_palette.js`), so any subset in any
 * arrangement stays distinguishable, including a donut whose last segment wraps
 * round to touch the first. Never cycle past the end: the tail folds into
 * `CHART_OTHER_COLOR`.
 */
export const CHART_SERIES_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

export const CHART_OTHER_COLOR = 'var(--color-chart-other)'

/** Stage keys that carry a measured tonnage; the rest are drawn hollow. */
export type FunnelStageKey = keyof CarbonFunnel | 'registry' | 'sold'

/**
 * Carbon lifecycle stages in display order.
 *
 * The measured three use an ORDINAL ramp — one hue darkening with depth in the
 * lifecycle — because these are ordered categories, not identities; spending
 * separate hues here would burn the colour channel on information the bar
 * length already carries.
 *
 * The last two are drawn as hollow outlines: real steps in the T-VER lifecycle
 * that this system does not record yet. Dropping them would let "ตรวจรับรองแล้ว"
 * read as the finish line when it is not (ADR 0025).
 */
export const FUNNEL_STAGES: {
  key: FunnelStageKey
  label: string
  hint: string
  color: string | null
}[] = [
  {
    key: 'estimatedTotal',
    label: 'ประเมินแล้ว',
    hint: 'คาร์บอนที่คำนวณจากต้นไม้ทุกต้นที่บันทึกเข้ามา',
    color: 'var(--color-funnel-1)',
  },
  {
    key: 'awaitingReview',
    label: 'รอผู้ตรวจ',
    hint: 'ประเมินแล้วแต่ยังไม่มีคำตัดสินจากผู้ตรวจสอบ',
    color: 'var(--color-funnel-2)',
  },
  {
    key: 'certified',
    label: 'ตรวจรับรองแล้ว',
    hint: 'ผ่านการอนุมัติของผู้ตรวจสอบ FarmFlow แล้ว พร้อมยื่น อบก. — ยังไม่ใช่เครดิตที่ อบก. ออกให้',
    color: 'var(--color-funnel-3)',
  },
  {
    key: 'registry',
    label: 'อบก. รับรอง',
    hint: 'ระบบยังไม่บันทึกผลการรับรองจาก อบก. — ไม่ใช่ศูนย์ แต่คือยังไม่มีข้อมูล',
    color: null,
  },
  {
    key: 'sold',
    label: 'ขายแล้ว',
    hint: 'ยังไม่มีเส้นทางบันทึกการขายเครดิตในระบบ',
    color: null,
  },
]

export type SignalTone = 'critical' | 'warning' | 'info'

export type Signal = {
  id: string
  tone: SignalTone
  text: string
}

/**
 * Turns the overview into the short list of things a reader should act on.
 *
 * The rule for admission is strict: a signal appears only when a threshold is
 * genuinely crossed, and the strip disappears entirely when none are. A banner
 * that is always on is furniture, and gets read as furniture.
 *
 * Signals do not link anywhere. Acting on them happens in the admin and
 * verifier portals, which are separate session realms — a link from here would
 * land the reader on a 401.
 */
export function buildSignals(o: ExecutiveOverview): Signal[] {
  const signals: Signal[] = []
  const { kpis, governance, target } = o

  if (kpis.pipeline.value > kpis.certified.value && kpis.pipeline.value > 0) {
    signals.push({
      id: 'backlog-exceeds-certified',
      tone: 'critical',
      text: `คาร์บอนที่รอผู้ตรวจ ${formatTonnes(kpis.pipeline.value)} tCO₂e มากกว่าที่ตรวจรับรองไปแล้วทั้งหมด`,
    })
  } else if (kpis.pipeline.pendingSessions > 0) {
    signals.push({
      id: 'pending-sessions',
      tone: 'warning',
      text: `${kpis.pipeline.pendingSessions} เซสชันสำรวจรอผู้ตรวจสอบตัดสิน`,
    })
  }

  if (governance.avgConfidence !== null && governance.avgConfidence < CONFIDENCE_MIN) {
    signals.push({
      id: 'low-confidence',
      tone: 'critical',
      text: `คะแนนความสอดคล้องหลักฐานเฉลี่ย ${governance.avgConfidence.toFixed(2)} ต่ำกว่าเกณฑ์ ${CONFIDENCE_MIN}`,
    })
  }

  if (governance.overlapFlaggedFarms > 0) {
    signals.push({
      id: 'overlap',
      tone: 'critical',
      text: `${governance.overlapFlaggedFarms} ฟาร์มมีขอบเขตทับซ้อนกันเกินเกณฑ์ ต้องชี้ขาดก่อนออกเครดิต`,
    })
  }

  if (governance.failedAssessments > 0) {
    signals.push({
      id: 'failed-assessments',
      tone: 'warning',
      text: `${governance.failedAssessments} ต้นที่ AI ประเมินไม่สำเร็จ ต้องให้คนตรวจเอง`,
    })
  }

  if (target.projectsMissingTarget > 0) {
    signals.push({
      id: 'missing-target',
      tone: 'info',
      text: `${target.projectsMissingTarget} โครงการยังไม่ได้ระบุเป้าลดคาร์บอนใน PDD จึงยังวัดความคืบหน้าไม่ได้`,
    })
  }

  return signals
}
