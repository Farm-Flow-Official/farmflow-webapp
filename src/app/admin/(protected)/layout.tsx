import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { AdminShell } from '@/components/ui/admin-shell'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminSession()
  if (!admin) {
    redirect('/admin/login')
  }

  return <AdminShell admin={admin}>{children}</AdminShell>
}
