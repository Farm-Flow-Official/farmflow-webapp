/**
 * API contract types for the Farmer domain. When the admin endpoints land,
 * only the service layer (`fetchFarmers`, `fetchFarmerById`) needs to change —
 * every UI component consumes these shapes unchanged.
 */
export type FarmerAccountStatus = 'Active' | 'Suspended'

export type Farmer = {
  /** farmer_id — stable identifier, also the route param for the detail page. */
  id: string
  fullName: string
  phone: string
  email: string | null
  accountStatus: FarmerAccountStatus
  /** Number of farms registered to this account. */
  farmsCount: number
  /** ISO 8601 registration timestamp. */
  registeredAt: string
}

export type CropType =
  | 'ข้าว'
  | 'อ้อย'
  | 'มันสำปะหลัง'
  | 'ยางพารา'
  | 'กาแฟ'
  | 'ผัก'
  | 'ผลไม้'

export type Farm = {
  id: string
  name: string
  province: string
  /** Area in rai (1 rai ≈ 1,600 m²). */
  areaRai: number
  cropType: CropType
  /**
   * Carbon sequestration in **kilograms** CO₂e — mirrors the canonical DB
   * field `total_carbon_kgco2e`. Stored in kg (not tonnes) to keep the API
   * contract honest; convert at the display layer only if needed.
   */
  carbonKgCo2e: number
  registeredAt: string
}

export type FarmerDetail = Farmer & {
  farms: Farm[]
  /** Sum of `carbonKgCo2e` across all farms, in kg CO₂e. */
  totalCarbonKgCo2e: number
  /**
   * Estimated value in THB = `totalCarbonKgCo2e × market_price_thb`
   * (see business req §Workflow 6 / A-07). This is an *estimate* of credit
   * value, not a confirmed/owed payout.
   */
  estimatedValueThb: number
}
