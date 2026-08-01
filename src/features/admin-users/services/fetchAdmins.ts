import { api, unwrap } from '@/lib/api'
import type { AdminRole, AdminStatus, AdminUser } from '@/features/admin-users/types'

/**
 * Normalises the API's admin status onto the view-model.
 *
 * The API already capitalises (`"Active"`), but this once compared against the
 * raw DB casing (`"active"`) — so every admin, including active ones, rendered
 * as a grey "ปิดใช้งาน". Matching case-insensitively means neither side can
 * silently break the other again by changing its casing.
 */
function toAdminStatus(status: string): AdminStatus {
  return status.toLowerCase() === 'active' ? 'Active' : 'Inactive'
}

/** Maps an API admin row onto the view-model (role label + Active/Inactive status). */
export function toAdminUser(a: {
  id: string
  username: string
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
}): AdminUser {
  return {
    id: a.id,
    username: a.username,
    role: a.role as AdminRole,
    status: toAdminStatus(a.status),
    lastLoginAt: a.lastLoginAt,
    createdAt: a.createdAt,
  }
}

/** All admins except the caller, newest-first. */
export async function fetchAdmins(): Promise<AdminUser[]> {
  const admins = await unwrap(api.GET('/api/v1/admin/admins/'))
  return admins
    .map(toAdminUser)
    .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
}
