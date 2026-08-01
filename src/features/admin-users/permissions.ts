import type { AdminProfile } from '@/features/auth/types'

/**
 * Can this admin manage other admin accounts?
 *
 * The permission catalogue is seeded server-side and `/admin/auth/me` returns
 * the caller's codes, so this is a real check now rather than the `return true`
 * placeholder it started as. The API enforces the same code through
 * `requirePermission`; this only decides whether the console *offers* the
 * action, so a role is never shown a button that answers 403.
 */
export function canManageAdmins(admin: AdminProfile): boolean {
  return admin.permissions.includes('admins:manage')
}
