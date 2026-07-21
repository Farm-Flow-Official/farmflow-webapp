import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { VERIFIER_ROLE } from '@/features/auth/roles'
import { AdminShell } from '@/components/ui/admin-shell'

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

  return <AdminShell admin={admin}>{children}</AdminShell>
}
