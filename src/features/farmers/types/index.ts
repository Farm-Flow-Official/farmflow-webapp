/**
 * API contract types for the Farmer domain.
 *
 * Fields marked "not in DB yet" are placeholder values shown with a mock
 * indicator in the UI — they require a future schema migration to become real.
 */
export type FarmerAccountStatus = 'Active' | 'Suspended'

export type Farmer = {
  id: string
  /** Always present — the real DB username. */
  username: string
  /** Thai full name — not in DB yet. null when from live API. */
  fullName: string | null
  /** Phone number — not in DB yet. null when from live API. */
  phone: string | null
  /** Email — not in DB yet. null when from live API. */
  email: string | null
  accountStatus: FarmerAccountStatus
  farmsCount: number
  registeredAt: string
  /** true = data from live API; false = demo/mock */
  _live: boolean
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
  /** Full address string from DB. */
  farmAddress: string | null
  areaRai: number | null
  farmStatus: string
  registeredAt: string
  /** Province — not a separate DB field yet. null when from live API. */
  province: string | null
  /** Crop type — in subplot data, not directly on farm. null when from live API. */
  cropType: CropType | null
  /** Carbon estimate — requires batch join. null when from live API. */
  carbonKgCo2e: number | null
  /** true = data from live API; false = demo/mock */
  _live: boolean
}

export type FarmerDetail = Farmer & {
  farms: Farm[]
  /** null when from live API (requires batch data join). */
  totalCarbonKgCo2e: number | null
  /** null when from live API. */
  estimatedValueThb: number | null
}
