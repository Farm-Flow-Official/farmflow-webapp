import { api, unwrap } from '@/lib/api'
import type {
  FarmGeo,
  FarmStatus,
  GeeStatus,
  PolygonCoords,
} from '@/features/gis/types'

/**
 * All farms for the admin map. Only farms with a check-in point and a GEE result
 * are returned — a farm with no location can't be plotted, and the map UI assumes
 * those fields are present.
 */
export async function fetchFarmGeo(): Promise<FarmGeo[]> {
  const farms = await unwrap(api.GET('/api/v1/admin/gis/farms'))
  return farms
    .filter((f) => f.checkinLat != null && f.checkinLng != null && f.gee != null)
    .map((f) => ({
      id: f.id,
      farmName: f.farmName,
      ownerUserId: f.ownerUserId,
      ownerName: f.ownerName,
      province: f.province ?? '',
      checkinLat: f.checkinLat as number,
      checkinLng: f.checkinLng as number,
      gee: { status: f.gee!.status as GeeStatus, ndvi: f.gee!.ndvi },
      calculatedAreaRai: f.calculatedAreaRai ?? 0,
      declaredAreaRai: f.declaredAreaRai ?? 0,
      areaDiscrepancyFlag: f.areaDiscrepancyFlag,
      overlapFlag: f.overlapFlag,
      overlapPercent: f.overlapPercent,
      farmStatus: f.farmStatus as FarmStatus,
      polygon: f.polygon as PolygonCoords,
    }))
}
