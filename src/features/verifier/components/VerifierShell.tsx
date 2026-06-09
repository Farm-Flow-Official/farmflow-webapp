'use client'

import { useEffect, useState } from 'react'
import type { VerifierProfile } from '@/features/verifier/auth/types'
import { VerifierTopbar } from '@/features/verifier/components/VerifierTopbar'
import { VerifierSidebar } from '@/features/verifier/components/VerifierSidebar'

/**
 * Client shell for the verifier portal — mirrors AdminShell. Owns the mobile
 * drawer state; auth stays in the server layout.
 */
export function VerifierShell({
  verifier,
  children,
}: {
  verifier: VerifierProfile
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
      <VerifierTopbar verifier={verifier} menuOpen={open} onMenuClick={() => setOpen((v) => !v)} />
      <VerifierSidebar open={open} onNavigate={close} />

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
