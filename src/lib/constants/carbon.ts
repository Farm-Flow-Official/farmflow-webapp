/**
 * Carbon credit market price — mirrors the canonical ERD field
 * `CARBON_MARKET_CONFIG.market_price_thb`, defined as **THB per tCO₂e** (per
 * tonne), the global variable set by Master Admin (business req §A-10).
 * The estimated value formula is `(total_carbon_kgco2e / 1000) × market_price_thb`.
 *
 * ฿200/tCO₂e is a realistic voluntary-market figure. Single source of truth for
 * both farmer carbon value and the System Settings page. When the API is ready
 * this comes from CARBON_MARKET_CONFIG, not a constant.
 */
export const MARKET_PRICE_THB_PER_TCO2E = 200

/** Sanity bounds for the editable market price — guards against fat-finger input. */
export const MARKET_PRICE_MIN_THB = 1
export const MARKET_PRICE_MAX_THB = 10_000

/** A price change beyond this fraction prompts an extra confirmation. */
export const MARKET_PRICE_LARGE_CHANGE = 0.5

/** Estimated THB value for a carbon amount given in kg CO₂e (stored unit). */
export function estimateValueThb(kgCo2e: number): number {
  // Carbon is stored in kg; the price is per tonne → divide by 1,000.
  return Math.round((kgCo2e / 1000) * MARKET_PRICE_THB_PER_TCO2E)
}
