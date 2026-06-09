import type { FarmGeo } from '@/features/gis/types'
import { mockFarmGeo } from '@/features/gis/data/mockFarmGeo'

/**
 * Single data seam for the farm map. Today it returns mock data; when the admin
 * API is ready, replace ONLY the body below. The endpoint should return each
 * farm's `farm_polygon_geojson` plus the validation flags and a server-computed
 * overlap percentage:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/gis/farms`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: FarmGeo[] }
 *   return json.data ?? []
 */
export async function fetchFarmGeo(): Promise<FarmGeo[]> {
  return mockFarmGeo
}
