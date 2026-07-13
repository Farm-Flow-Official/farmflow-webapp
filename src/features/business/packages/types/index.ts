/**
 * API contract for the Package & Subscription domain (Business P02). When the
 * `/api/business/packages` + `/api/business/subscriptions` endpoints land, only
 * the service layer changes — every UI component consumes these shapes unchanged.
 *
 * Backing tables: `packages`, `subscriptions` (ERD v4 delta §B) joined with
 * `users` (Minimal-PII) and `farms` (used-rai sum).
 */

export type PackageCode = 'FREE' | 'PREMIUM' | 'GOLD' | 'PLATINUM'

/** A tier in the catalog — mirrors a `packages` row. */
export type Package = {
  id: string
  code: PackageCode
  name: string
  /** Monthly price in THB. 0 = free tier. */
  priceThb: number
  /** Max rai for fixed tiers. `null` when the tier uses base + overage (PLATINUM). */
  quotaRai: number | null
  /** PLATINUM base coverage (e.g. 200 rai). `null` for fixed tiers. */
  baseRai: number | null
  /** PLATINUM overage price per rai beyond `baseRai`. `null` for fixed tiers. */
  overagePricePerRai: number | null
  /** Free IoT devices granted by the tier. */
  iotFreeUnits: number
  /** FEATURE 1 — max simultaneous data-collection devices (2 / 5 / 10 / 25). */
  deviceLimit: number
  /** Live, tier-specific perks shown as bullets. */
  features: string[]
  /** Planned perks shown with a "เร็ว ๆ นี้" tag — roadmap, not live yet. */
  upcomingFeatures: string[]
  isActive: boolean
  sortOrder: number
}

export type SubscriptionStatus =
  | 'Pending_Payment'
  | 'Active'
  | 'Expired'
  | 'Cancelled'
  | 'Suspended'

/** A customer's subscription, enriched with joined display fields. */
export type CustomerSubscription = {
  id: string
  userId: string
  /** Enriched join: `users.full_name` (Minimal-PII). */
  customerName: string
  /** Enriched join: `users.phone`. */
  phone: string
  packageCode: PackageCode
  /** Enriched join: `packages.name`. */
  packageName: string
  /** Allowed rai snapshot at activation. `null` for unlimited-base PLATINUM. */
  quotaRai: number | null
  /** Enriched: SUM(`farms.calculated_area_rai` WHERE owner = user AND not deleted). */
  usedRai: number
  status: SubscriptionStatus
  /** ISO 8601, or null while Pending_Payment. */
  startedAt: string | null
  /** ISO 8601, or null while Pending_Payment. */
  expiryDate: string | null
  autoRenew: boolean
}

/** Mock write payload — Seam: `PATCH /api/business/subscriptions/:id`. */
export type SubscriptionAction =
  | { type: 'change_tier'; toPackageCode: PackageCode }
  | { type: 'suspend' }
  | { type: 'activate' }
