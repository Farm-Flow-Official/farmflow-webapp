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
 * Writing the PDD is its own permission too. The wizard used to gate on
 * `projects:write`, but every route it calls checks `pdd:write` — so an admin
 * holding one without the other got an editable form whose every save 403'd.
 */
export function canWritePdd(admin: AdminProfile): boolean {
  return admin.permissions.includes('pdd:write')
}

/**
 * Filing the PDD is its own permission: writing the document and being
 * authorised to send it to the authority are different acts.
 */
export function canSubmitPdd(admin: AdminProfile): boolean {
  return admin.permissions.includes('pdd:submit')
}
