import { AlertTriangle, CheckCircle2, Inbox, Settings2, type LucideIcon } from 'lucide-react'

/** Which console's feed to read. Mirrors the API's `surface`. */
export type NotificationSurface = 'admin' | 'verifier'

export type NotificationType = 'action_required' | 'mrv_signal' | 'decision' | 'system'

export type StaffNotification = {
  id: string
  notificationType: NotificationType
  title: string
  body: string | null
  relatedEntityType: string | null
  relatedEntityId: string | null
  /** Console path to open, or null when the notice is not actionable. */
  href: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export type NotificationSummary = {
  notificationType: NotificationType
  total: number
  unread: number
}

/**
 * How each kind reads on screen.
 *
 * Colour carries the urgency so the list can be scanned without reading it:
 * amber is work waiting on you, red is something wrong with the data, green is
 * a decision already made, grey is the system talking about itself. Anything
 * that needs a decision has to out-rank anything that is merely news.
 */
export const NOTIFICATION_KINDS: Record<
  NotificationType,
  { label: string; icon: LucideIcon; tone: string; dot: string }
> = {
  action_required: {
    label: 'งานค้าง',
    icon: Inbox,
    tone: 'bg-warning-bg text-warning',
    dot: 'bg-warning',
  },
  mrv_signal: {
    label: 'สัญญาณเสี่ยง',
    icon: AlertTriangle,
    tone: 'bg-error-bg text-error',
    dot: 'bg-error',
  },
  decision: {
    label: 'คำตัดสิน',
    icon: CheckCircle2,
    tone: 'bg-success-bg text-success',
    dot: 'bg-success',
  },
  system: {
    label: 'ระบบ',
    icon: Settings2,
    tone: 'bg-surface text-ink-secondary',
    dot: 'bg-ink-muted',
  },
}

export const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_KINDS) as NotificationType[]

/** How many rows the "ดูทั้งหมด" page shows per page. */
export const NOTIFICATION_PAGE_SIZE = 20

/** How many the bell dropdown holds — enough to skim, not enough to scroll far. */
export const NOTIFICATION_BELL_SIZE = 8
