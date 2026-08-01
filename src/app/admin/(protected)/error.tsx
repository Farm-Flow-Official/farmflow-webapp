'use client'

import { ErrorPanel } from '@/components/ui/error-panel'

/**
 * Boundary for every admin screen behind the session check.
 *
 * Without this, an `ApiError` escaping a server component gave Next's blank
 * "Application error" — the message redacted in production. The Projects page
 * did exactly that against a stale API, and nothing on screen suggested the
 * cause was a deploy order rather than the data.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorPanel error={error} reset={reset} what="หน้านี้" />
}
