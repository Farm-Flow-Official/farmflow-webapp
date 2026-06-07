import type { FarmerDetail, Farm, CropType } from '@/features/farmers/types'
import { mockFarmers } from './mockFarmers'

const PROVINCES = [
  'เชียงใหม่', 'นครราชสีมา', 'ขอนแก่น', 'สุรินทร์', 'พิษณุโลก',
  'อุบลราชธานี', 'เลย', 'สกลนคร', 'กาญจนบุรี', 'ลำปาง',
  'เชียงราย', 'นครสวรรค์', 'บึงกาฬ', 'มุกดาหาร',
]

const CROPS: CropType[] = [
  'ข้าว', 'อ้อย', 'มันสำปะหลัง', 'ยางพารา', 'กาแฟ', 'ผัก', 'ผลไม้',
]

const FARM_NAMES = [
  'แปลงสีเขียว', 'ไร่สุขใจ', 'นาอุดม', 'สวนรุ่งเรือง',
  'แปลงทดลอง', 'ไร่หัวใจ', 'สวนทอง', 'แปลงริมน้ำ',
  'ไร่บ้านนา', 'สวนธรรมชาติ', 'นาตากลม', 'แปลงใหม่',
]

/**
 * Carbon credit market price in THB per **kg** CO₂e — stands in for the
 * platform-wide `market_price_thb` set by Master Admin. The payout formula is
 * `total_carbon_kgco2e × market_price_thb` (business req §Workflow 6 / A-07).
 * ฿0.45/kg ≈ ฿450/tCO₂e, a realistic voluntary-market figure. When the API is
 * ready, this comes from settings/config, not a constant.
 */
const MARKET_PRICE_THB_PER_KG = 0.45

/** Deterministic pseudo-random integer in [min, max] seeded by `seed`. */
function seededInt(seed: number, min: number, max: number): number {
  const frac = (Math.sin(seed + 1) * 10_000) % 1
  return Math.floor(Math.abs(frac) * (max - min + 1)) + min
}

function buildFarms(farmerId: string, count: number, baseDate: string): Farm[] {
  const seed = farmerId.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0)
  const baseMs = new Date(baseDate).getTime()

  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 13
    const areaRai = seededInt(s + 3, 50, 500) / 10
    // ~800–1,600 kg CO₂e per rai — a plausible sequestration yield.
    const carbonKgCo2e = Math.round(areaRai * seededInt(s + 4, 800, 1600))
    const daysAfter = seededInt(s + 5, 7, 60) + i * 14

    return {
      id: `FARM-${farmerId.slice(-4)}${String(i + 1).padStart(2, '0')}`,
      name: FARM_NAMES[seededInt(s + 2, 0, FARM_NAMES.length - 1)],
      province: PROVINCES[seededInt(s + 1, 0, PROVINCES.length - 1)],
      areaRai,
      cropType: CROPS[seededInt(s, 0, CROPS.length - 1)],
      carbonKgCo2e,
      registeredAt: new Date(baseMs + daysAfter * 86_400_000).toISOString(),
    }
  })
}

export const mockFarmerDetails: Record<string, FarmerDetail> = Object.fromEntries(
  mockFarmers.map((farmer) => {
    const farms = buildFarms(farmer.id, farmer.farmsCount, farmer.registeredAt)
    const totalCarbonKgCo2e = farms.reduce((s, f) => s + f.carbonKgCo2e, 0)
    const estimatedValueThb = Math.round(totalCarbonKgCo2e * MARKET_PRICE_THB_PER_KG)

    return [farmer.id, { ...farmer, farms, totalCarbonKgCo2e, estimatedValueThb }]
  }),
)
