/**
 * API contract for the Announcement domain. When the admin endpoints land,
 * only the service layer changes — every UI component consumes these shapes
 * unchanged.
 */
export type AnnouncementStatus = 'Active' | 'Draft'

export type Announcement = {
  id: string
  title: string
  /** Plain-text / lightweight markdown body (rich text deferred — see A-09 note). */
  body: string
  /** `Active` = published & visible to farmers; `Draft` = saved but hidden. */
  status: AnnouncementStatus
  /** ISO 8601. */
  createdAt: string
  /** ISO 8601 — bumped on every edit. */
  updatedAt: string
}

/** Payload the create/edit form produces; id/timestamps are server-assigned. */
export type AnnouncementInput = {
  title: string
  body: string
  status: AnnouncementStatus
}
