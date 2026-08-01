import { redirect } from 'next/navigation'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { fetchVerifierProjectsSafe } from '@/features/verifier/services/fetchVerifierProjects'
import { VerifierShell } from '@/features/verifier/components/VerifierShell'
import { fetchLiveAnnouncements } from '@/features/announcements/services/fetchLiveAnnouncements'
import { MaintenanceScreen } from '@/components/ui/maintenance-screen'
import { checkDashboard } from '@/features/settings/services/fetchAvailability'

export default async function ProtectedVerifierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Checked before the session: a closed portal should say so rather than send
  // someone to a login form that leads nowhere (ADMIN-SYS-01).
  const closed = await checkDashboard('verifier')
  if (closed) {
    return (
      <MaintenanceScreen
        title="ระบบผู้ตรวจรับรอง"
        reason={closed.reason}
        expectedBackAt={closed.expectedBackAt}
      />
    )
  }

  const verifier = await getVerifierSession()
  if (!verifier) {
    redirect('/verifier/login')
  }

  // The chrome names the project being reviewed on every screen. Resolving the
  // id → name map here keeps that a server read instead of drilling the name
  // through every page under the dynamic segment.
  //
  // Tolerant on purpose: a layout that throws takes down every route beneath it,
  // and `error.tsx` in this segment cannot catch its own layout. Losing the
  // names costs a label; losing the portal costs the review.
  const [projects, banner, bell] = await Promise.all([
    fetchVerifierProjectsSafe(),
    fetchLiveAnnouncements('verifier', 'banner'),
    fetchLiveAnnouncements('verifier', 'bell'),
  ])

  return (
    <VerifierShell verifier={verifier} projects={projects} announcements={{ banner, bell }}>
      {children}
    </VerifierShell>
  )
}
