import type { AdminProfile } from '@/features/auth/types'

/**
 * RBAC seam. Spec A-11 says the Audit Log is **MASTER (SuperAdmin) only**, but
 * the exact `roleId` / permission key contract from the API isn't finalized yet.
 * This is the single place to enforce it later.
 *
 * For now it returns `true` so the prototype is fully usable in a demo. When the
 * API contract is known, swap the body for the real check, e.g.:
 *
 *   return admin.roleId === 'SuperAdmin' ||
 *     admin.permissions.includes('audit:read')
 */
export function canViewAuditLog(admin: AdminProfile): boolean {
  void admin
  return true
}
