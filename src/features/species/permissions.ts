import type { AdminProfile } from '@/features/auth/types'

/**
 * Can this admin change species and their carbon equations?
 *
 * `settings:read` gets you the page; changing anything on it needs
 * `species:write`, which the seed grants to MASTER alone. Deliberately not
 * `settings:write` — these coefficients decide how much carbon every tree of a
 * species yields, which is a different power from moving the market price. The
 * API enforces the same split, so this only governs whether the controls are
 * offered.
 */
export function canManageSpecies(admin: AdminProfile): boolean {
  return admin.permissions.includes('species:write')
}
