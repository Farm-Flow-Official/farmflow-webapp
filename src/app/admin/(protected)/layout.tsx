import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { AdminSidebar } from '@/components/ui/sidebar-nav'
import { AdminTopbar } from '@/components/ui/topbar'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminSession()
  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminTopbar admin={admin} />
      <AdminSidebar />
      <main className="min-h-screen pt-16 ml-60">{children}</main>
    </div>
  )
}
