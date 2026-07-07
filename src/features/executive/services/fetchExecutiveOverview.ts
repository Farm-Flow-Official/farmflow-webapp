import type { ExecutiveOverview } from '@/features/executive/types'
import { mockExecutive } from '@/features/executive/data/mockExecutive'

/**
 * Single data seam for the Executive Dashboard. Today it returns a mock
 * aggregate; when the API is ready, replace ONLY the body below (the UI reads
 * the typed `ExecutiveOverview` and never needs to change):
 *
 *   import { api, unwrap } from '@/lib/api'
 *   return unwrap(
 *     api.GET('/api/v1/admin/executive/overview', {
 *       params: { query: { granularity: 'month' } },
 *     }),
 *   )
 *
 * Then delete `data/mockExecutive.ts`.
 */
export async function fetchExecutiveOverview(): Promise<ExecutiveOverview> {
  return mockExecutive
}
