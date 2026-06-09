/**
 * API contract for the GIS / Farm Map domain, aligned with **ERD v3** FARMS
 * (the GeoJSON polygon + validation flags). Display-only: overlap is computed
 * server-side; the UI just reads the flags.
 */

/** A GeoJSON Polygon ring: array of [lng, lat] pairs (GeoJSON order). */
export type PolygonCoords = [number, number][]

/** Mirrors FARMS.farm_status. */
export type FarmStatus = 'Draft' | 'Pending' | 'Active' | 'Rejected' | 'Suspended'

/**
 * Google Earth Engine land check (ERD: FARMS.gee_verification_result). NDVI is a
 * vegetation index (−1…1): healthy crop/forest ≳ 0.4; bare ground / water ≲ 0.2.
 * A plot sitting on a river therefore fails — the anti-greenwashing safeguard.
 */
export type GeeStatus = 'verified' | 'review' | 'failed'

export type GeeVerification = {
  status: GeeStatus
  /** NDVI value from the GEE result (−1…1). */
  ndvi: number
}

export type FarmGeo = {
  /** farm_id. */
  id: string
  farmName: string
  /** owner_user_id — links to the farmer detail page. */
  ownerUserId: string
  /** Enriched farmer name via JOIN to USERS — null if unavailable. */
  ownerName?: string | null
  /** Province — enriched from farm_address / reverse-geocode (not a discrete ERD column). */
  province: string
  /** GPS check-in point (ERD: checkin_lat / checkin_lng, system-set). */
  checkinLat: number
  checkinLng: number
  /** Google Earth Engine land-validity result. */
  gee: GeeVerification
  /** calculated_area_rai — system-derived from the polygon (authoritative). */
  calculatedAreaRai: number
  /** declared_area_rai — what the farmer claimed. */
  declaredAreaRai: number
  /** area_discrepancy_flag — |declared − calculated| > 15%. */
  areaDiscrepancyFlag: boolean
  /** overlap_validation_flag — polygon overlaps another farm (> 15%). */
  overlapFlag: boolean
  /**
   * Server-computed overlap percentage for display. ERD stores only the boolean
   * `overlap_validation_flag`; this % is enriched at query time (null if none).
   */
  overlapPercent?: number | null
  farmStatus: FarmStatus
  /** GeoJSON polygon outer ring ([lng, lat] pairs). */
  polygon: PolygonCoords
}

/** Map pin colour category derived from status + flags (display logic). */
export type FarmMapState = 'flagged' | 'pending' | 'verified'

export function farmMapState(farm: FarmGeo): FarmMapState {
  if (farm.overlapFlag) return 'flagged'
  if (farm.farmStatus === 'Pending') return 'pending'
  return 'verified'
}
