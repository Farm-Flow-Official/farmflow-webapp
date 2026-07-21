'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Kbd } from '@/components/ui/kbd'
import { useHotkeys } from '@/lib/hooks/useHotkeys'
import { useLeaderHotkeys } from '@/lib/hooks/useLeaderHotkeys'

/** `g` + letter → destination. Letters follow the page name, not the URL. */
const DESTINATIONS: [key: string, href: string, label: string][] = [
  ['d', '/admin', 'Dashboard'],
  ['f', '/admin/farmers', 'Farmers'],
  ['m', '/admin/gis', 'GIS Map'],
  ['a', '/admin/announcements', 'Announcements'],
  ['s', '/admin/settings', 'Settings'],
  ['l', '/admin/audit-log', 'Audit Log'],
  ['u', '/admin/admin-users', 'Admin Users'],
  ['t', '/admin/support', 'Support'],
]

/**
 * Keyboard layer for the admin console. Renders only the "waiting for the
 * second key" hint.
 *
 * Admins live in a dozen list pages and switch constantly, so the shortcuts are
 * navigational (`g` + initial) rather than action keys — see `useLeaderHotkeys`
 * for why a leader beats bare letters here. `/` jumps to the page's search box,
 * which is where a list-page session actually starts.
 */
export function AdminKeyboardNav() {
  const router = useRouter()

  const armed = useLeaderHotkeys(
    'g',
    Object.fromEntries(DESTINATIONS.map(([key, href]) => [key, () => router.push(href)])),
  )

  // Prefetch every destination once the leader is armed — by the time the second
  // key lands the route is usually already there.
  useEffect(() => {
    if (!armed) return
    for (const [, href] of DESTINATIONS) router.prefetch(href)
  }, [armed, router])

  useHotkeys({
    '/': () => {
      const input = document.querySelector<HTMLInputElement>('[data-search-input]')
      input?.focus()
      input?.select()
    },
  })

  // Escape leaves the search box so the shortcuts (which stand down while typing)
  // come back, without throwing away what was typed.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const el = e.target
      if (el instanceof HTMLElement && el.matches('[data-search-input]')) el.blur()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!armed) return null

  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-[900] flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-panel px-3 py-2 shadow-lg"
    >
      <Kbd>G</Kbd>
      <span className="text-[12px] text-ink-secondary">
        กดตัวอักษรปลายทาง · <span className="text-ink-muted">D F M A S L U T</span>
      </span>
    </div>
  )
}
