/** Where an announcement can appear, and how (ADMIN-ANN-02). */
export type AnnouncementDashboard =
  | 'mobile'
  | 'admin'
  | 'verifier'
  | 'executive'
  | 'business'

export type AnnouncementChannel = 'banner' | 'bell'

export type AnnouncementTarget = {
  dashboard: AnnouncementDashboard
  channel: AnnouncementChannel
}

export const ANNOUNCEMENT_DASHBOARDS: {
  value: AnnouncementDashboard
  label: string
  hint: string
}[] = [
  { value: 'mobile', label: 'Mobile App', hint: 'เกษตรกร' },
  { value: 'admin', label: 'Admin', hint: 'ทีมภายใน' },
  { value: 'verifier', label: 'Verifier', hint: 'ผู้ตรวจรับรอง' },
  { value: 'executive', label: 'Executive', hint: 'ผู้บริหาร' },
  { value: 'business', label: 'Business', hint: 'ทีมธุรกิจ' },
]

export const ANNOUNCEMENT_CHANNELS: {
  value: AnnouncementChannel
  label: string
  hint: string
}[] = [
  {
    value: 'banner',
    label: 'แบนเนอร์',
    hint: 'เด้งกลางจอเมื่อเปิดแดชบอร์ด ต้องกดปิดก่อนใช้งานต่อ — สำหรับเรื่องที่ต้องเห็นทันที',
  },
  { value: 'bell', label: 'กระดิ่ง', hint: 'อยู่ในรายการแจ้งเตือน — สำหรับเรื่องที่ย้อนดูได้' },
]

/** `mobile+banner` → a stable key for a checkbox grid. */
export const targetKey = (t: AnnouncementTarget) => `${t.dashboard}+${t.channel}`

/**
 * Whether an announcement is showing right now, given its window.
 *
 * Both bounds are optional and mean different things: no `startAt` is "as soon
 * as it goes active", no `endAt` is "until someone takes it down". Neither is a
 * missing value to be filled in with a default date.
 */
export function windowState(
  status: string,
  startAt: string | null,
  endAt: string | null,
  now = new Date(),
): 'draft' | 'scheduled' | 'live' | 'ended' {
  if (status !== 'Active') return 'draft'
  if (startAt && new Date(startAt) > now) return 'scheduled'
  if (endAt && new Date(endAt) <= now) return 'ended'
  return 'live'
}

export const WINDOW_LABELS: Record<
  ReturnType<typeof windowState>,
  { label: string; variant: 'neutral' | 'pending' | 'verified' | 'rejected' }
> = {
  draft: { label: 'ฉบับร่าง', variant: 'neutral' },
  scheduled: { label: 'รอถึงกำหนด', variant: 'pending' },
  live: { label: 'กำลังแสดง', variant: 'verified' },
  ended: { label: 'สิ้นสุดแล้ว', variant: 'neutral' },
}

/**
 * What a dashboard renders for one announcement.
 *
 * Declared here rather than in the service that fetches it: that service
 * imports the API client, which is server-only (`next/headers`), and a bundler
 * following a type import would drag it into the browser build.
 */
export type LiveAnnouncement = {
  id: string
  title: string
  body: string
  bannerFileId: string | null
  startAt: string | null
  endAt: string | null
  createdAt: string
}

/**
 * What the banner upload accepts. Mirrors the API's own limits — kept here so
 * the browser can refuse a file instantly and say *why*, instead of relaying a
 * server validation error that reads "Invalid request data" to someone who
 * just picked a holiday photo.
 */
export const BANNER_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const BANNER_MAX_MB = 10
export const BANNER_MAX_BYTES = BANNER_MAX_MB * 1024 * 1024
export const BANNER_LIMITS_TEXT = 'JPG / PNG / WebP'
