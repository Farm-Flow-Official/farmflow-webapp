import { api, unwrap } from '@/lib/api'
import type { AdminRole, AdminStatus, AdminUser } from '@/features/admin-users/types'

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
    status: a.status === 'active' ? 'Active' : ('Inactive' as AdminStatus),
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
