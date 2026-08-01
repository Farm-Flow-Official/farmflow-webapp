'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from '@/lib/hooks/useHotkeys'
import { NavProgressBar } from '@/features/verifier/components/NavProgressBar'

type Props = {
  prevHref: string | null
  nextHref: string | null
  /** Where Escape / `b` goes back to — the session review page. */
  backHref: string
}

/**
 * Keyboard driving for the per-tree inspection page (V-05): a verifier works a
 * session of 50+ photos, so reaching for the mouse on every photo is the whole
 * cost of the review.
 *
 * ← / → (or k / j) step through the session, Escape or `b` returns to the session.
 * Navigation runs in a transition so the current photo stays on screen — with a
 * progress bar — instead of blanking, and both neighbours are prefetched.
 */
export function TreeKeyboardNav({ prevHref, nextHref, backHref }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    for (const href of [prevHref, nextHref, backHref]) {
      if (href) router.prefetch(href)
    }
  }, [router, prevHref, nextHref, backHref])

  const go = (href: string | null) => {
    if (href) startTransition(() => router.push(href))
  }

  useHotkeys({
    ArrowLeft: () => go(prevHref),
    ArrowRight: () => go(nextHref),
    k: () => go(prevHref),
    j: () => go(nextHref),
    Escape: () => go(backHref),
    b: () => go(backHref),
  })

  return <NavProgressBar pending={pending} />
}
