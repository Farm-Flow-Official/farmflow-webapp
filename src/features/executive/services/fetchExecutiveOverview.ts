import type { ExecutiveOverview } from '@/features/executive/types'
import { mockExecutive } from '@/features/executive/data/mockExecutive'

/**
 * Single data seam for the executive overview. Today it returns a DEMO mock;
 * when the aggregation endpoint is ready, replace ONLY the body below — the UI
 * consumes `ExecutiveOverview` and never needs to change:
 *
 *   import { api } from '@/lib/api'
 *   const { data } = await api.GET('/api/v1/admin/executive/overview', {
 *     params: { query: { granularity: 'month' } },
 *   })
 *   if (!data?.success) throw new Error('executive overview unavailable')
 *   return data.data
 */
export async function fetchExecutiveOverview(): Promise<ExecutiveOverview> {
  return mockExecutive
}
