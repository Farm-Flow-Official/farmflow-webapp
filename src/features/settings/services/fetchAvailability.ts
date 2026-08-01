import { api } from '@/lib/api'
import type {
  ClosableDashboard,
  DashboardAvailability,
} from '@/features/settings/types/availability'

// Re-exported for the server components that already import from here. Client
// components must import from `types/availability` instead — this module pulls
// in the server-only API client.
export type { ClosableDashboard, DashboardAvailability }

/**
 * Public availability — no session needed.
 *
 * Used by the portal layouts, which must decide whether to render the
 * maintenance screen *before* asking anyone to sign in. On failure everything
 * reads as open: a flaky availability check must never be what takes the
 * platform down.
 */
export async function fetchPublicAvailability(): Promise<DashboardAvailability[]> {
  try {
    const { data } = await api.GET('/api/v1/system/availability', {})
    if (!data?.success) return []
    return data.data as DashboardAvailability[]
  } catch {
    return []
  }
}

/** Whether one dashboard is open, with the notice to show when it is not. */
export async function checkDashboard(
  dashboard: ClosableDashboard,
): Promise<DashboardAvailability | null> {
  const rows = await fetchPublicAvailability()
  const row = rows.find((r) => r.dashboard === dashboard)
  return row && !row.isEnabled ? row : null
}

/** The admin view, including who last changed each one. */
export async function fetchAvailability(): Promise<DashboardAvailability[]> {
  const { data } = await api.GET('/api/v1/admin/system/availability', {})
  if (!data?.success) return []
  return data.data as DashboardAvailability[]
}
