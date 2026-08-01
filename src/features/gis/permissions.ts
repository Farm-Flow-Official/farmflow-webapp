import type { AdminProfile } from '@/features/auth/types'

/**
 * Can this admin open the GIS map?
 *
 * `gis:read` is seeded to MASTER, VERIFIER and PROJECT_DEV — verifiers resolve
 * overlap disputes, project developers need to see what they are enrolling.
 * FINANCE and GENERAL have no business with farm boundaries.
 */
export function canViewGis(admin: AdminProfile): boolean {
  return admin.permissions.includes('gis:read')
}
