/**
 * Dashboard availability shapes (ADMIN-SYS-01).
 *
 * Kept apart from the service that fetches them: the service imports the API
 * client, which uses `next/headers` and is therefore server-only. Client
 * components need these types, and a type-only import is not enough — the
 * bundler follows the module and pulls the whole thing into the browser build.
 */
export type ClosableDashboard = 'verifier' | 'business' | 'executive' | 'mobile'

export type DashboardAvailability = {
  dashboard: ClosableDashboard
  isEnabled: boolean
  reason: string | null
  expectedBackAt: string | null
  updatedByLabel?: string | null
  updatedAt?: string | null
}

export const CLOSABLE_DASHBOARDS: ClosableDashboard[] = [
  'verifier',
  'business',
  'executive',
  'mobile',
]

export const DASHBOARD_LABELS: Record<ClosableDashboard, string> = {
  verifier: 'Verifier Portal',
  business: 'Business Dashboard',
  executive: 'Executive Dashboard',
  mobile: 'Mobile App',
}
