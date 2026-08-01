import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { VERIFIER_ROLE } from '@/features/auth/roles'
import { AdminShell } from '@/components/ui/admin-shell'
import { fetchLiveAnnouncements } from '@/features/announcements/services/fetchLiveAnnouncements'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminSession()
  // The API already bars verifiers from the admin realm (sign-in + every guard);
  // this is defense-in-depth so a verifier never renders the admin chrome even
  // if a session somehow resolves.
  if (!admin || admin.roleName === VERIFIER_ROLE) {
    redirect('/admin/login')
  }

  // Fetched here so every admin screen carries the same notices without each
  // page having to ask. Both calls fail soft to [] — see the service.
  const [banner, bell] = await Promise.all([
    fetchLiveAnnouncements('admin', 'banner'),
    fetchLiveAnnouncements('admin', 'bell'),
  ])

  return (
    <AdminShell admin={admin} announcements={{ banner, bell }}>
      {children}
    </AdminShell>
  )
}
