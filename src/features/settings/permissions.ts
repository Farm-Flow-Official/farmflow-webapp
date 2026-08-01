import type { AdminProfile } from '@/features/auth/types'

/**
 * Can this admin change system settings — the carbon market price, and which
 * dashboards are open?
 *
 * `settings:read` gets you the page; changing anything on it needs
 * `settings:write`, which the seed grants to MASTER alone. The API enforces the
 * same split, so this only governs whether the controls are offered.
 */
export function canManageSettings(admin: AdminProfile): boolean {
  return admin.permissions.includes('settings:write')
}
