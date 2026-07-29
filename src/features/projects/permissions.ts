import type { AdminProfile } from '@/features/auth/types'

/**
 * Project RBAC. Unlike the older feature stubs, the API ships real permission
 * codes for this domain (`projects:*`), so these check the session's granted
 * codes directly. The server enforces the same codes on every route — this is
 * for hiding controls the admin cannot use, not for security.
 */
export function canReadProjects(admin: AdminProfile): boolean {
  return admin.permissions.includes('projects:read')
}

export function canWriteProjects(admin: AdminProfile): boolean {
  return admin.permissions.includes('projects:write')
}

export function canDeleteProjects(admin: AdminProfile): boolean {
  return admin.permissions.includes('projects:delete')
}

/**
 * Filing the PDD is its own permission: writing the document and being
 * authorised to send it to the authority are different acts.
 */
export function canSubmitPdd(admin: AdminProfile): boolean {
  return admin.permissions.includes('pdd:submit')
}
