import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/auth/services/adminSession'

/**
 * Executive dashboard is C-level and internal — gated by the same real admin
 * session as the admin portal. No heavy sidebar: this is a single focused view,
 * not a portal, so the layout is just the auth guard + a page container.
 */
export default async function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminSession()
  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8">{children}</div>
    </div>
  )
}
