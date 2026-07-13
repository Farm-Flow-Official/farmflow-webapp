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

/** Text colour class for a confidence score. */
export function confidenceTextClass(score: number): string {
  return TEXT[confidenceTone(score)]
}

/** Chip (bg + text) classes for a confidence score. */
export function confidenceBadgeClass(score: number): string {
  return BADGE[confidenceTone(score)]
}
