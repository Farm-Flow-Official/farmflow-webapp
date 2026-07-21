'use client'

import { useEffect, useState } from 'react'
import type { AdminProfile } from '@/features/auth/types'
import { AdminTopbar } from '@/components/ui/topbar'
import { AdminSidebar } from '@/components/ui/sidebar-nav'
import { AdminGuideProvider } from '@/features/admin/guide/GuideBook'
import { AdminKeyboardNav } from '@/features/admin/components/AdminKeyboardNav'

/**
 * Client shell for the protected admin area. Owns the mobile drawer state so
 * the topbar (hamburger) and the sidebar (drawer) stay in sync. Auth stays in
 * the server layout — this component is presentation only.
 */
export function AdminShell({
  admin,
  children,
}: {
  admin: AdminProfile
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    // The guide provider wraps the chrome too — topbar and sidebar both open it.
    <AdminGuideProvider>
      <div className="min-h-screen bg-surface">
        <AdminTopbar
          admin={admin}
          menuOpen={open}
          onMenuClick={() => setOpen((v) => !v)}
        />

        <AdminSidebar open={open} onNavigate={close} />

        {/* Mobile backdrop — only when the drawer is open, never on desktop */}
        {open && (
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={close}
            className="fixed inset-0 top-16 z-30 bg-ink/40 lg:hidden"
          />
        )}

        <main className="min-h-screen pt-16 lg:ml-60">{children}</main>

        <AdminKeyboardNav />
      </div>
    </AdminGuideProvider>
  )
}
