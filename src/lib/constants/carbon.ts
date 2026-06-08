/**
 * Carbon credit market price in THB per **kg** CO₂e — the platform-wide
 * `market_price_thb` set by Master Admin (business req §Workflow 6 / A-07).
 * The estimated payout formula is `total_carbon_kgco2e × market_price_thb`.
 *
 * ฿0.45/kg ≈ ฿450/tCO₂e, a realistic voluntary-market figure. Single source of
 * truth for both farmer carbon value and payout estimates. When the API is
 * ready this comes from settings/config, not a constant.
 */
export const MARKET_PRICE_THB_PER_KG = 0.45

/** Estimated THB value for a given carbon amount in kg CO₂e. */
export function estimateValueThb(kgCo2e: number): number {
  return Math.round(kgCo2e * MARKET_PRICE_THB_PER_KG)
}
