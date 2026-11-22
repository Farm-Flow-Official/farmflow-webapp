import type { PackageCode } from '@/features/business/packages/types'

/**
 * Chart palette for tiers. Hex (not theme tokens) because conic-gradient and
 * inline bar heights need raw colour values. Distinct, brand-friendly hues.
 */
export const TIER_COLORS: Record<PackageCode, string> = {
  // Tier is an ORDERED category, not an identity, so it uses the single-hue
  // Moss ramp rather than four separate hues — DESIGN.md §4.6 caps categorical
  // identity at 3 slots. CSS vars because both consumers (conic-gradient
  // string, inline backgroundColor) are CSS properties.
  FREE: 'var(--color-funnel-1)',
  PREMIUM: 'var(--color-funnel-2)',
  GOLD: 'var(--color-funnel-3)',
  PLATINUM: 'var(--color-funnel-4)',
}
