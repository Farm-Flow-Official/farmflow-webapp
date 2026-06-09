import type { AdminProfile } from '@/features/auth/types'

/**
 * RBAC seam. Spec A-06 says the GIS map is for **VERIFY and MASTER** (verifiers
 * resolve overlap disputes; master oversees). The exact `roleId` / permission
 * key contract from the API isn't finalized yet; this is the single place to
 * enforce it later, e.g.:
 *
 *   return admin.roleId === 'SuperAdmin' || admin.roleId === 'Verifier' ||
 *     admin.permissions.includes('gis:read')
 */
export function canViewGis(admin: AdminProfile): boolean {
  void admin
  return true
}
