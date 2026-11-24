'use client'

import { ErrorPanel } from '@/components/ui/error-panel'

/**
 * Boundary for the executive dashboard.
 *
 * The page classifies API failures itself and renders them in place, so what
 * reaches here is a render-time fault. Without this the board would get Next's
 * blank "Application error" — with the message redacted in production, and no
 * way back other than the browser's own reload.
 */
export default function ExecutiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorPanel error={error} reset={reset} what="แดชบอร์ดผู้บริหาร" />
}
