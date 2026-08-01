import type { AdminProfile } from '@/features/auth/types'

/**
 * Can this admin delete an announcement?
 *
 * Deletion is separated from `announcements:write` on purpose: GENERAL staff
 * draft and publish notices, but removing one that farmers have already seen is
 * a MASTER decision. The API grants the codes the same way.
 */
export function canDeleteAnnouncement(admin: AdminProfile): boolean {
  return admin.permissions.includes('announcements:delete')
}

/** Can this admin create or edit an announcement? */
export function canWriteAnnouncement(admin: AdminProfile): boolean {
  return admin.permissions.includes('announcements:write')
}
