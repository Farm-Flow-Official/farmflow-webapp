import type { Package } from '@/features/business/packages/types'

/**
 * Temporary stand-in for the tier catalog until `/api/business/packages` lands.
 * Delete this file once `fetchPackages()` calls the real endpoint. Values match
 * the seed in the ERD v4 delta (§C): device_limit 2 / 5 / 10 / 25.
 */
export const mockPackages: Package[] = [
  {
    id: 'pkg_free',
    code: 'FREE',
    name: 'Free',
    priceThb: 0,
    quotaRai: 15,
    baseRai: null,
    overagePricePerRai: null,
    iotFreeUnits: 0,
    deviceLimit: 2,
    features: ['พื้นที่สูงสุด 15 ไร่', 'อุปกรณ์เก็บข้อมูล 2 เครื่อง'],
    upcomingFeatures: [],
    isActive: true,
    sortOrder: 0,
  },
  {
    id: 'pkg_premium',
    code: 'PREMIUM',
    name: 'Premium',
    priceThb: 1990,
    quotaRai: 50,
    baseRai: null,
    overagePricePerRai: null,
    iotFreeUnits: 0,
    deviceLimit: 5,
    features: ['พื้นที่สูงสุด 50 ไร่', 'อุปกรณ์เก็บข้อมูล 5 เครื่อง'],
    upcomingFeatures: [],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'pkg_gold',
    code: 'GOLD',
    name: 'Gold',
    priceThb: 4990,
    quotaRai: 100,
    baseRai: null,
    overagePricePerRai: null,
    iotFreeUnits: 1,
    deviceLimit: 10,
    features: [
      'พื้นที่สูงสุด 100 ไร่',
      'อุปกรณ์เก็บข้อมูล 10 เครื่อง',
      'IoT ฟรี 1 เครื่อง',
    ],
    upcomingFeatures: ['สายด่วนช่วยเหลือเฉพาะราย'],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'pkg_platinum',
    code: 'PLATINUM',
    name: 'Platinum',
    priceThb: 8900,
    quotaRai: null,
    baseRai: 200,
    overagePricePerRai: 40,
    iotFreeUnits: 3,
    deviceLimit: 25,
    features: [
      'ฐาน 200 ไร่ + ส่วนเกิน ฿40/ไร่',
      'อุปกรณ์เก็บข้อมูล 25 เครื่อง',
      'IoT ฟรี 3 เครื่อง',
    ],
    upcomingFeatures: ['สายด่วนช่วยเหลือเฉพาะราย'],
    isActive: true,
    sortOrder: 3,
  },
]
