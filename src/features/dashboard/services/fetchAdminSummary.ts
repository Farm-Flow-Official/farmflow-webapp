import { api, unwrap } from '@/lib/api'
import type { AdminDashboardSummary } from '@/features/dashboard/types'

export async function fetchAdminSummary(): Promise<AdminDashboardSummary> {
  return unwrap(api.GET('/api/v1/admin/dashboard/summary'))
}
