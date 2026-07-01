/**
 * View-model types for the Farmer domain (admin view), aligned with the Elysia
 * `/admin/farmers` responses. The API supplies PII (or a non-PII fallback per
 * ADR 0013), so there is no separate `username`/mock-flag handling here.
 */
export type FarmerAccountStatus = 'Active' | 'Suspended'

export type Farmer = {
  id: string
  /** Personal name, or a non-PII fallback (ADR 0013) — always present. */
  fullName: string
  phone: string | null
  email: string | null
  accountStatus: FarmerAccountStatus
  farmsCount: number
  registeredAt: string
}

export type Farm = {
  id: string
  name: string
  /** Province name; null when unset. */
  province: string | null
  areaRai: number | null
  /** Crop/species name; null when there is no agricultural data yet. */
  cropType: string | null
  /** Carbon estimate (kg CO₂e); null until a credit batch is issued. */
  carbonKgCo2e: number | null
  registeredAt: string
}

export type FarmerDetail = Farmer & {
  farms: Farm[]
  totalCarbonKgCo2e: number | null
  estimatedValueThb: number | null
}
