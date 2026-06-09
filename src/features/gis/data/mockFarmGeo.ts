import type {
  FarmGeo,
  FarmStatus,
  GeeVerification,
  PolygonCoords,
} from '@/features/gis/types'

/**
 * Temporary stand-in until the GIS API lands. Polygons sit on real Thai
 * coordinates; the two Chiang Mai plots (FARM-GIS-09 / -10) physically overlap
 * (red flag). FARM-GIS-05 "แปลงริมน้ำ" sits on water → low NDVI → fails the GEE
 * land check, demonstrating the anti-greenwashing safeguard. Coordinates are
 * GeoJSON order ([lng, lat]). Delete once `fetchFarmGeo()` calls the real API.
 */

/** Build a slightly irregular closed quad around a centre (GeoJSON [lng, lat]). */
function box(lng: number, lat: number, w: number, h: number, skew = 0): PolygonCoords {
  return [
    [lng - w, lat - h],
    [lng + w, lat - h + skew],
    [lng + w, lat + h],
    [lng - w + skew, lat + h],
    [lng - w, lat - h],
  ]
}

/** Derive the GEE land-check status from an NDVI value. */
function geeFromNdvi(ndvi: number): GeeVerification {
  const status = ndvi >= 0.4 ? 'verified' : ndvi >= 0.2 ? 'review' : 'failed'
  return { status, ndvi }
}

type Seed = {
  id: string
  farmName: string
  ownerUserId: string
  ownerName: string
  province: string
  calc: number
  decl: number
  areaDisc: boolean
  overlap: boolean
  overlapPct: number | null
  status: FarmStatus
  lng: number
  lat: number
  w: number
  h: number
  skew: number
  ndvi: number
}

const SEEDS: Seed[] = [
  { id: 'FARM-GIS-09', farmName: 'แปลงสีเขียว', ownerUserId: 'FRM-1004', ownerName: 'วันเพ็ญ สวนเขียว', province: 'เชียงใหม่', calc: 18.4, decl: 18.0, areaDisc: false, overlap: true, overlapPct: 22, status: 'Active', lng: 98.9752, lat: 18.7956, w: 0.0016, h: 0.0013, skew: 0.0003, ndvi: 0.58 },
  { id: 'FARM-GIS-10', farmName: 'ไร่หัวใจ', ownerUserId: 'FRM-1017', ownerName: 'วิชัย ไร่กาแฟ', province: 'เชียงใหม่', calc: 15.1, decl: 21.0, areaDisc: true, overlap: true, overlapPct: 19, status: 'Pending', lng: 98.9762, lat: 18.7949, w: 0.0015, h: 0.0012, skew: -0.0002, ndvi: 0.27 },
  { id: 'FARM-GIS-01', farmName: 'สวนรุ่งเรือง', ownerUserId: 'FRM-1001', ownerName: 'สมชาย ใจดี', province: 'เชียงใหม่', calc: 12.7, decl: 13.0, areaDisc: false, overlap: false, overlapPct: null, status: 'Active', lng: 98.9890, lat: 18.8021, w: 0.0018, h: 0.0014, skew: 0, ndvi: 0.64 },
  { id: 'FARM-GIS-02', farmName: 'นาอุดม', ownerUserId: 'FRM-1007', ownerName: 'ธนากร ทุ่งรวง', province: 'นครราชสีมา', calc: 31.5, decl: 32.0, areaDisc: false, overlap: false, overlapPct: null, status: 'Active', lng: 102.0840, lat: 14.9712, w: 0.0024, h: 0.0019, skew: 0.0004, ndvi: 0.61 },
  { id: 'FARM-GIS-03', farmName: 'ไร่บ้านนา', ownerUserId: 'FRM-1013', ownerName: 'เอกพงษ์ ไร่มัน', province: 'นครราชสีมา', calc: 24.2, decl: 24.5, areaDisc: false, overlap: false, overlapPct: null, status: 'Pending', lng: 102.0975, lat: 14.9651, w: 0.0021, h: 0.0017, skew: -0.0003, ndvi: 0.55 },
  { id: 'FARM-GIS-04', farmName: 'สวนทอง', ownerUserId: 'FRM-1009', ownerName: 'ชัยวัฒน์ ไร่อ้อย', province: 'ขอนแก่น', calc: 19.8, decl: 20.0, areaDisc: false, overlap: false, overlapPct: null, status: 'Active', lng: 102.8312, lat: 16.4419, w: 0.0019, h: 0.0015, skew: 0.0003, ndvi: 0.69 },
  { id: 'FARM-GIS-05', farmName: 'แปลงริมน้ำ', ownerUserId: 'FRM-1020', ownerName: 'ดวงใจ ไร่สับปะรด', province: 'ขอนแก่น', calc: 9.6, decl: 9.5, areaDisc: false, overlap: false, overlapPct: null, status: 'Active', lng: 102.8401, lat: 16.4502, w: 0.0013, h: 0.0011, skew: 0, ndvi: 0.06 },
  // Mock coordinate lands in central Chiang Rai (urban) → low NDVI → GEE flags it
  // as not-farmland, the same way the riverside plot is flagged. Kept intentionally.
  { id: 'FARM-GIS-06', farmName: 'ไร่สุขใจ', ownerUserId: 'FRM-1015', ownerName: 'ภานุพงศ์ ทุ่งทอง', province: 'เชียงราย', calc: 27.3, decl: 27.0, areaDisc: false, overlap: false, overlapPct: null, status: 'Active', lng: 99.8401, lat: 19.9105, w: 0.0022, h: 0.0018, skew: 0.0004, ndvi: 0.13 },
  { id: 'FARM-GIS-07', farmName: 'นาตากลม', ownerUserId: 'FRM-1022', ownerName: 'พิมพ์ชนก เรือนไร่', province: 'อุบลราชธานี', calc: 14.0, decl: 14.2, areaDisc: false, overlap: false, overlapPct: null, status: 'Active', lng: 104.8512, lat: 15.2287, w: 0.0017, h: 0.0014, skew: -0.0003, ndvi: 0.52 },
  { id: 'FARM-GIS-08', farmName: 'แปลงทดลอง', ownerUserId: 'FRM-1011', ownerName: 'สุรชัย นาข้าว', province: 'พิษณุโลก', calc: 11.2, decl: 11.0, areaDisc: false, overlap: false, overlapPct: null, status: 'Active', lng: 100.2588, lat: 16.8211, w: 0.0015, h: 0.0012, skew: 0.0002, ndvi: 0.60 },
]

export const mockFarmGeo: FarmGeo[] = SEEDS.map((s) => ({
  id: s.id,
  farmName: s.farmName,
  ownerUserId: s.ownerUserId,
  ownerName: s.ownerName,
  province: s.province,
  checkinLat: s.lat,
  checkinLng: s.lng,
  calculatedAreaRai: s.calc,
  declaredAreaRai: s.decl,
  areaDiscrepancyFlag: s.areaDisc,
  overlapFlag: s.overlap,
  overlapPercent: s.overlapPct,
  farmStatus: s.status,
  gee: geeFromNdvi(s.ndvi),
  polygon: box(s.lng, s.lat, s.w, s.h, s.skew),
}))
