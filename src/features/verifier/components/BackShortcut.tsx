'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from '@/lib/hooks/useHotkeys'

/**
 * Binds Escape / `b` to a "go up one level" href and prefetches it. Renders
 * nothing — pair it with the visible back link so the shortcut is discoverable.
 */
export function BackShortcut({ href }: { href: string }) {
  const router = useRouter()

  useEffect(() => {
    router.prefetch(href)
  }, [router, href])

  useHotkeys({
    Escape: () => router.push(href),
    b: () => router.push(href),
  })

  return null
}
