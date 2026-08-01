import type { AdminProfile } from '@/features/auth/types'

/**
 * Can this admin read the audit log?
 *
 * `audit:read` is seeded to MASTER alone — the log records every other admin's
 * actions, including suspensions and their stated reasons, so it is the one
 * page where "everyone can look" is the wrong default.
 */
export function canViewAuditLog(admin: AdminProfile): boolean {
  return admin.permissions.includes('audit:read')
}
