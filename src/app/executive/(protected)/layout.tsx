import { redirect } from 'next/navigation'
import { getExecutiveSession } from '@/features/executive/auth/session'
import { ExecutiveTopbar } from '@/features/executive/components/ExecutiveTopbar'
import { AnnouncementBanner } from '@/components/ui/announcement-banner'
import { fetchLiveAnnouncements } from '@/features/announcements/services/fetchLiveAnnouncements'
import { MaintenanceScreen } from '@/components/ui/maintenance-screen'
import { checkDashboard } from '@/features/settings/services/fetchAvailability'

/**
 * Executive dashboard — C-level and internal, and now behind a door of its own.
 *
 * It used to accept any admin session, which meant the only way to give a board
 * member this view was to hand them an operational account: a password that
 * could also suspend a farmer. It now takes an EXECUTIVE-role session on its own
 * `executive_access` cookie — the same arrangement the verifier portal has, for
 * the same reason.
 *
 * Still no sidebar: this is one focused view, not a portal.
 */
export default async function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ADMIN-SYS-01 — see the note in the verifier layout.
  const closed = await checkDashboard('executive')
  if (closed) {
    return (
      <MaintenanceScreen
        title="Executive Dashboard "
        reason={closed.reason}
        expectedBackAt={closed.expectedBackAt}
      />
    )
  }

  const executive = await getExecutiveSession()
  if (!executive) {
    redirect('/executive/login')
  }

  const [banner, bell] = await Promise.all([
    fetchLiveAnnouncements('executive', 'banner'),
    fetchLiveAnnouncements('executive', 'bell'),
  ])

  return (
    <div className="min-h-dvh bg-surface">
      <ExecutiveTopbar profile={executive} announcements={bell} />
      <AnnouncementBanner announcements={banner} surface="executive" />
      {/* 1440 to match the admin and verifier shells — the ESG layout runs three
          pillars of cards, and 1200 left the four-up rows cramped on a laptop. */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">{children}</div>
    </div>
  )
}
