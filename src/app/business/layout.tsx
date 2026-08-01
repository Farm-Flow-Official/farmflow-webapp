import { redirect } from 'next/navigation'
import { getBusinessSession } from '@/features/business/auth/session'
import { BusinessShell } from '@/components/ui/business-shell'
import { MaintenanceScreen } from '@/components/ui/maintenance-screen'
import { checkDashboard } from '@/features/settings/services/fetchAvailability'

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ADMIN-SYS-01 — checked before the session so a closed dashboard explains
  // itself rather than bouncing the visitor to the portal.
  const closed = await checkDashboard('business')
  if (closed) {
    return (
      <MaintenanceScreen
        title="Business Dashboard "
        reason={closed.reason}
        expectedBackAt={closed.expectedBackAt}
      />
    )
  }

  const profile = await getBusinessSession()
  if (!profile) {
    // Mock session always resolves today; this guard is here so wiring real
    // RBAC later (redirect unauthorised staff to the portal) needs no change.
    redirect('/')
  }

  return <BusinessShell profile={profile}>{children}</BusinessShell>
}
