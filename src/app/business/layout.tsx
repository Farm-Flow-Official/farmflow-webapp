import { redirect } from 'next/navigation'
import { getBusinessSession } from '@/features/business/auth/session'
import { BusinessShell } from '@/components/ui/business-shell'

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getBusinessSession()
  if (!profile) {
    // Mock session always resolves today; this guard is here so wiring real
    // RBAC later (redirect unauthorised staff to the portal) needs no change.
    redirect('/')
  }

  return <BusinessShell profile={profile}>{children}</BusinessShell>
}
