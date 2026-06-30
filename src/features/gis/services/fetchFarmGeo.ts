import { api, unwrap } from '@/lib/api'
import type {
  FarmGeo,
  FarmStatus,
  GeeStatus,
  PolygonCoords,
} from '@/features/gis/types'

/**
 * All farms for the admin map. We plot every farm that has a drawable boundary
 * ring (≥ 3 points) — the polygon is all the map needs. GEE land-check and the
 * GPS check-in point are *enrichment*: they refine the outline style and the
 * side panel, but a farm must NOT vanish from the map just because GEE hasn't
 * run yet (it's an async external Google Earth Engine step) or the check-in is
 * missing. Previously this filtered on `gee != null`, which hid valid polygons.
 */
export async function fetchFarmGeo(): Promise<FarmGeo[]> {
  const farms = await unwrap(api.GET('/api/v1/admin/gis/farms'))
  return farms
    .filter((f) => Array.isArray(f.polygon) && f.polygon.length >= 3)
    .map((f) => ({
      id: f.id,
      farmName: f.farmName,
      ownerUserId: f.ownerUserId,
      ownerName: f.ownerName,
      province: f.province ?? '',
      checkinLat: f.checkinLat ?? null,
      checkinLng: f.checkinLng ?? null,
      gee: f.gee ? { status: f.gee.status as GeeStatus, ndvi: f.gee.ndvi } : null,
      calculatedAreaRai: f.calculatedAreaRai ?? 0,
      declaredAreaRai: f.declaredAreaRai ?? 0,
      areaDiscrepancyFlag: f.areaDiscrepancyFlag,
      overlapFlag: f.overlapFlag,
      overlapPercent: f.overlapPercent,
      farmStatus: f.farmStatus as FarmStatus,
      polygon: f.polygon as PolygonCoords,
    }))
}
