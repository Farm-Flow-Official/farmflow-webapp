/**
 * Single source of truth for the AI-confidence threshold and its display tone.
 * The green boundary is aligned with the pass threshold (`CONFIDENCE_MIN`), so a
 * score that passes the cross-check always reads green — no amber-but-passing
 * mismatch. Shared by V-03/V-04/V-05 and the tree grid.
 */
export const CONFIDENCE_MIN = 0.6

export type ConfidenceTone = 'ok' | 'watch' | 'critical'

/** ≥0.60 ok (pass) · 0.45–0.60 watch (borderline fail) · <0.45 critical. */
export function confidenceTone(score: number): ConfidenceTone {
  if (score >= CONFIDENCE_MIN) return 'ok'
  if (score >= 0.45) return 'watch'
  return 'critical'
}

const TEXT: Record<ConfidenceTone, string> = {
  ok: 'text-success',
  watch: 'text-warning',
  critical: 'text-error',
}

const BADGE: Record<ConfidenceTone, string> = {
  ok: 'bg-success-bg text-success',
  watch: 'bg-warning-bg text-warning',
  critical: 'bg-error-bg text-error',
}

/**
 * Vivid hex per tone for SVG gauges (stroke/conic) — the GIS status ramp, which
 * reads brighter on a ring than the muted `text-*` tokens. Kept in sync with the
 * tone bands so a passing score always draws green.
 */
const HEX: Record<ConfidenceTone, string> = {
  ok: '#22C55E', // --color-gis-verified
  watch: '#F59E0B', // --color-gis-pending
  critical: '#EF4444', // --color-gis-flagged
}

const TONE_LABEL: Record<ConfidenceTone, string> = {
  ok: 'เชื่อมั่นสูง',
  watch: 'ควรตรวจซ้ำ',
  critical: 'ความเชื่อมั่นต่ำ',
}

/** Text colour class for a confidence score. */
export function confidenceTextClass(score: number): string {
  return TEXT[confidenceTone(score)]
}

/** Chip (bg + text) classes for a confidence score. */
export function confidenceBadgeClass(score: number): string {
  return BADGE[confidenceTone(score)]
}

/** Vivid hex for a confidence score — for gauge strokes / conic fills. */
export function confidenceHex(score: number): string {
  return HEX[confidenceTone(score)]
}

/** Short Thai tone label ('เชื่อมั่นสูง' / 'ควรตรวจซ้ำ' / 'ความเชื่อมั่นต่ำ'). */
export function confidenceToneLabel(score: number): string {
  return TONE_LABEL[confidenceTone(score)]
}
