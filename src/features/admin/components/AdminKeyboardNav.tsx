'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Kbd } from '@/components/ui/kbd'
import { useHotkeys } from '@/lib/hooks/useHotkeys'
import { useLeaderHotkeys } from '@/lib/hooks/useLeaderHotkeys'
import { ADMIN_DESTINATIONS, navItemAllowed } from '@/features/admin/lib/adminNav'

/**
 * Keyboard layer for the admin console. Renders only the "waiting for the
 * second key" hint.
 *
 * Admins live in a dozen list pages and switch constantly, so the shortcuts are
 * navigational (`g` + initial) rather than action keys — see `useLeaderHotkeys`
 * for why a leader beats bare letters here. `/` jumps to the page's search box,
 * which is where a list-page session actually starts.
 *
 * Destinations and the hint both come from `ADMIN_NAV`, the same list the
 * sidebar paints its key caps from. They used to be written out by hand here,
 * which is how `g q` and `g n` ended up advertised but bound to nothing.
 */
export function AdminKeyboardNav({ permissions }: { permissions?: string[] }) {
  const router = useRouter()

  // A shortcut to a page this role cannot open would land on the server's
  // refusal — the sidebar already hides those entries, so hide the key too.
  const destinations = useMemo(
    () => ADMIN_DESTINATIONS.filter((item) => navItemAllowed(item, permissions)),
    [permissions],
  )

  const bindings = useMemo(
    () =>
      Object.fromEntries(
        destinations.map((item) => [item.key.toLowerCase(), () => router.push(item.href)]),
      ),
    [destinations, router],
  )

  const armed = useLeaderHotkeys('g', bindings)

  // Prefetch every destination once the leader is armed — by the time the second
  // key lands the route is usually already there.
  useEffect(() => {
    if (!armed) return
    for (const item of destinations) router.prefetch(item.href)
  }, [armed, destinations, router])

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
      className="fixed bottom-5 left-1/2 z-[900] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-panel px-3 py-2 shadow-lg"
    >
      <Kbd>G</Kbd>
      <span className="text-[12px] text-ink-secondary">
        กดตัวอักษรปลายทาง ·{' '}
        <span className="text-ink-muted">{destinations.map((d) => d.key).join(' ')}</span>
      </span>
    </div>
  )
}
