import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/auth/services/adminSession'

/**
 * Guards every route under /admin/(protected). Verifies the admin session
 * against the API; unauthenticated visitors are sent to the login page.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminSession()
  if (!admin) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
