'use client'

import { useEffect, useState } from 'react'
import type { BusinessProfile } from '@/features/business/auth/types'
import { BusinessTopbar } from '@/components/ui/business-topbar'
import { BusinessSidebar } from '@/components/ui/business-sidebar'

/**
 * Client shell for the Business Dashboard. Mirrors `AdminShell`: owns the mobile
 * drawer state so the topbar (hamburger) and sidebar (drawer) stay in sync.
 * Auth stays in the server layout — this component is presentation only.
 */
export function BusinessShell({
  profile,
  children,
}: {
  profile: BusinessProfile
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-screen bg-surface">
      <BusinessTopbar
        profile={profile}
        menuOpen={open}
        onMenuClick={() => setOpen((v) => !v)}
      />

      <BusinessSidebar open={open} onNavigate={close} />

      {open && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={close}
          className="fixed inset-0 top-16 z-30 bg-ink/40 lg:hidden"
        />
      )}

      <main className="min-h-screen pt-16 lg:ml-60">{children}</main>
    </div>
  )
}
