/**
 * API contract for the Announcement domain. When the admin endpoints land,
 * only the service layer changes — every UI component consumes these shapes
 * unchanged.
 */
import type { AnnouncementTarget } from '@/features/announcements/types/targets'

export type AnnouncementStatus = 'Active' | 'Draft'

export type { AnnouncementTarget }

export type Announcement = {
  id: string
  title: string
  /** Plain-text / lightweight markdown body (rich text deferred — see A-09 note). */
  body: string
  /** `Active` = published & visible to farmers; `Draft` = saved but hidden. */
  status: AnnouncementStatus
  /** Uploaded banner image (files module); null when none. */
  bannerFileId: string | null
  /** ISO 8601. Null = show as soon as it is Active (ADMIN-ANN-02). */
  startAt: string | null
  /** ISO 8601. Null = show until someone takes it down. */
  endAt: string | null
  /** Which dashboards see it, and how. */
  targets: AnnouncementTarget[]
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
  bannerFileId?: string | null
  startAt?: string | null
  endAt?: string | null
  /** Replaces the existing set wholesale — the form always sends all of them. */
  targets?: AnnouncementTarget[]
}
