'use client'

import { ErrorPanel } from '@/components/ui/error-panel'

/**
 * Boundary for the verifier portal, deliberately placed at `/verifier` rather
 * than inside `(protected)`.
 *
 * A segment's `error.tsx` cannot catch a throw from that same segment's layout,
 * and the protected layout is where the portal chrome is built. Sitting one level
 * up means a failure there still renders something a verifier can read and
 * retry, instead of an empty error page across the entire portal.
 */
export default function VerifierError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorPanel error={error} reset={reset} what="พอร์ทัลผู้ตรวจสอบ" />
}
