import { api, unwrap } from '@/lib/api'
import type { AdminDashboardSummary } from '@/features/dashboard/types'

/**
 * The admin dashboard headline counts.
 *
 * The API still calls the review unit a "batch" (`pendingBatchCount`) — its
 * routes and field names are deliberately unchanged, since renaming them would
 * break the mobile app. The console calls it a Session everywhere, so the
 * translation happens here, once, rather than leaking the old word into the UI.
 */
export async function fetchAdminSummary(): Promise<AdminDashboardSummary> {
  const { pendingBatchCount, ...rest } = await unwrap(
    api.GET('/api/v1/admin/dashboard/summary'),
  )
  return { ...rest, pendingSessionCount: pendingBatchCount }
}
