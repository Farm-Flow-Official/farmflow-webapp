'use client'

import { useEffect, useState } from 'react'
import type { VerifierProfile } from '@/features/verifier/auth/types'
import { VerifierTopbar } from '@/features/verifier/components/VerifierTopbar'
import { AnnouncementBanner } from '@/components/ui/announcement-banner'
import type { LiveAnnouncement } from '@/features/announcements/types/targets'
import type { BellSnapshot } from '@/features/notifications/actions/notificationActions'
import { VerifierSidebar } from '@/features/verifier/components/VerifierSidebar'
import { VerifierGuideProvider } from '@/features/verifier/guide/GuideBook'
import type { VerifierProject } from '@/features/verifier/services/fetchVerifierProjects'

/**
 * Client shell for the verifier portal — mirrors AdminShell. Owns the mobile
 * drawer state; auth stays in the server layout.
 */
export function VerifierShell({
  verifier,
  projects,
  announcements = { banner: [], bell: [] },
  notifications = { unread: 0, rows: [] },
  children,
}: {
  verifier: VerifierProfile
  /** Projects this verifier may review — the topbar resolves the active one. */
  projects: VerifierProject[]
  /** Live announcements targeted at this portal, split by channel. */
  announcements?: { banner: LiveAnnouncement[]; bell: LiveAnnouncement[] }
  /** First bell snapshot, rendered on the server; the bell polls from here on. */
  notifications?: BellSnapshot
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
    // The guide provider wraps the chrome too — topbar and sidebar both open it.
    <VerifierGuideProvider>
      <div className="min-h-screen bg-surface">
        <VerifierTopbar
          verifier={verifier}
          projects={projects}
          menuOpen={open}
          onMenuClick={() => setOpen((v) => !v)}
          announcements={announcements.bell}
          notifications={notifications}
        />
        <VerifierSidebar open={open} onNavigate={close} />

        {open && (
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={close}
            className="fixed inset-0 top-16 z-30 bg-ink/40 lg:hidden"
          />
        )}

        <main className="min-h-screen pt-16 lg:ml-60">
          <AnnouncementBanner announcements={announcements.banner} surface="verifier" />
          {children}
        </main>
      </div>
    </VerifierGuideProvider>
  )
}
