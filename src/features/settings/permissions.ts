import type { AdminProfile } from '@/features/auth/types'

/**
 * RBAC seam. Spec A-10 says System Settings is **MASTER (SuperAdmin) only** —
 * only the Master Admin configures `market_price_thb`. The exact `roleId` /
 * permission key contract from the API isn't finalized yet; this is the single
 * place to enforce it later, e.g.:
 *
 *   return admin.roleId === 'SuperAdmin' ||
 *     admin.permissions.includes('settings:write')
 */
export function canManageSettings(admin: AdminProfile): boolean {
  void admin
  return true
}
