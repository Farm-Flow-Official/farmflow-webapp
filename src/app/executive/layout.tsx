import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'

/**
 * Lightweight standalone chrome for the Executive Dashboard — a distinct
 * C-level surface, deliberately separate from the admin/business ops shells
 * (no heavy sidebar). Guards with the real admin session; unauthenticated
 * visitors go to the admin login. Re-home under its own portal/RBAC later
 * without touching the page content.
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
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">Executive Dashboard</p>
              <p className="text-[11px] text-ink-muted">FarmFlow · ภาพรวมผู้บริหาร</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-ink-secondary sm:inline">
              {admin.username}
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              กลับสู่ Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-7">{children}</main>
    </div>
  )
}
