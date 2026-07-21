'use client'

import { useLinkStatus } from 'next/link'

/**
 * Thin indeterminate bar pinned under the topbar while a navigation is in
 * flight. The tree route is dynamic and has no `loading.js` — without feedback,
 * an arrow-key press looks like nothing happened until the server responds.
 *
 * `NavProgressBar` renders the bar directly (drive it from your own pending
 * state); `LinkNavProgress` must be rendered *inside* a `<Link>` and picks the
 * pending state up from it.
 */
export function NavProgressBar({ pending }: { pending: boolean }) {
  if (!pending) return null
  return (
    <span
      aria-hidden
      className="fixed inset-x-0 top-16 z-40 h-0.5 overflow-hidden bg-primary-subtle"
    >
      <span className="block h-full w-1/3 animate-[nav-progress_0.9s_ease-in-out_infinite] rounded-full bg-primary" />
    </span>
  )
}

export function LinkNavProgress() {
  const { pending } = useLinkStatus()
  return <NavProgressBar pending={pending} />
}
