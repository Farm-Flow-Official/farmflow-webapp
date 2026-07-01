import type { BadgeVariant } from '@/components/ui/badge'
import type {
  CustomerSubscription,
  Package,
  PackageCode,
  SubscriptionStatus,
} from '@/features/business/packages/types'

export const TIER_ORDER: PackageCode[] = ['FREE', 'PREMIUM', 'GOLD', 'PLATINUM']

/** Status → badge variant + Thai label. */
export function statusBadge(status: SubscriptionStatus): {
  variant: BadgeVariant
  label: string
} {
  switch (status) {
    case 'Active':
      return { variant: 'verified', label: 'ใช้งาน' }
    case 'Pending_Payment':
      return { variant: 'pending', label: 'รอชำระเงิน' }
    case 'Suspended':
      return { variant: 'neutral', label: 'ระงับชั่วคราว' }
    case 'Expired':
      return { variant: 'neutral', label: 'หมดอายุ' }
    case 'Cancelled':
      return { variant: 'rejected', label: 'ยกเลิก' }
  }
}

/** The effective rai cap for a subscription. `null` = unlimited base (PLATINUM). */
export function effectiveCap(sub: CustomerSubscription): number | null {
  return sub.quotaRai
}

/** `true` when the subscription is over its rai quota (fixed tiers only). */
export function isOverQuota(sub: CustomerSubscription): boolean {
  return sub.quotaRai != null && sub.usedRai > sub.quotaRai
}

/** `true` when an active subscription expires within `days` of `now`. */
export function isExpiringSoon(
  sub: CustomerSubscription,
  now: Date = new Date(),
  days = 30,
): boolean {
  if (sub.status !== 'Active' || !sub.expiryDate) return false
  const diff = new Date(sub.expiryDate).getTime() - now.getTime()
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000
}

/**
 * Whether changing to `target` is an upgrade, downgrade, or same tier — and
 * whether the quota guard blocks it (downgrade below current used rai).
 * Mirrors the P02 business rule (Business spec §P02 Logic/Validation).
 */
export function evaluateTierChange(
  sub: CustomerSubscription,
  current: Package,
  target: Package,
): {
  direction: 'upgrade' | 'downgrade' | 'same'
  blocked: boolean
  reason?: string
} {
  if (target.code === current.code) return { direction: 'same', blocked: false }
  const direction = target.sortOrder > current.sortOrder ? 'upgrade' : 'downgrade'

  if (
    direction === 'downgrade' &&
    target.quotaRai != null &&
    sub.usedRai > target.quotaRai
  ) {
    return {
      direction,
      blocked: true,
      reason: `ลูกค้าใช้พื้นที่ ${sub.usedRai} ไร่ เกินโควตา ${target.quotaRai} ไร่ของแพ็กเกจ ${target.name}`,
    }
  }
  return { direction, blocked: false }
}
