/**
 * API contract for System Settings, aligned with **ERD v3** CARBON_MARKET_CONFIG.
 * BETA exposes a single editable variable: the carbon market price.
 */
export type PriceSource = 'manual' | 'api_t-ver' | 'api_verra'

export type SystemConfig = {
  /** config_id. */
  configId: string
  /** market_price_thb — THB per tCO₂e (per tonne), the global price variable. */
  marketPriceThb: number
  /** How the price was set (prototype: always manual). */
  priceSource: PriceSource
  /** When this price takes effect (ERD: effective_from). */
  effectiveFrom: string
  /** Admin who set it (ERD: updated_by_admin_id); null when seeded/unknown. */
  updatedByAdminId: string | null
  /** Enriched admin username via JOIN to ADMINS — null if unknown. */
  updatedByLabel?: string | null
  /** Row creation time (ERD: created_at). */
  updatedAt: string
}

/** Payload the settings form produces. */
export type SystemConfigInput = {
  marketPriceThb: number
}

export const PRICE_SOURCE_LABEL: Record<PriceSource, string> = {
  manual: 'ตั้งเอง (Manual)',
  'api_t-ver': 'API · T-VER',
  api_verra: 'API · Verra',
}
