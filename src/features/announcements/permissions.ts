import type { AdminProfile } from '@/features/auth/types'

/**
 * RBAC seam. Spec A-09 says deleting an announcement is MASTER-only, but the
 * exact `roleId` value / permission key contract from the API isn't finalized
 * yet. This is the single place to enforce it later.
 *
 * For now it returns `true` so the prototype is fully usable in a demo. When
 * the API contract is known, swap the body for the real check, e.g.:
 *
 *   return admin.roleId === 'MASTER' ||
 *     admin.permissions.includes('announcement:delete')
 */
export function canDeleteAnnouncement(admin: AdminProfile): boolean {
  void admin
  return true
}
