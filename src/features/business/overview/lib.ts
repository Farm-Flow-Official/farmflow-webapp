import type { PackageCode } from '@/features/business/packages/types'

/**
 * Chart palette for tiers. Hex (not theme tokens) because conic-gradient and
 * inline bar heights need raw colour values. Distinct, brand-friendly hues.
 */
export const TIER_COLORS: Record<PackageCode, string> = {
  FREE: '#94A3B8', // slate
  PREMIUM: '#34A853', // green
  GOLD: '#F59E0B', // amber
  PLATINUM: '#6366F1', // indigo
}
