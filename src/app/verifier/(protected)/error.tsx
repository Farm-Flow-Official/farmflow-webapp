'use client'

import { ErrorPanel } from '@/components/ui/error-panel'

/**
 * Inner boundary, so a failing page keeps the portal chrome around it.
 *
 * The one at `/verifier` is the backstop for the protected layout itself, which
 * this cannot catch. Both exist on purpose: this one keeps a verifier oriented
 * (they can still navigate), that one keeps them out of a blank page.
 */
export default function VerifierProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorPanel error={error} reset={reset} what="หน้านี้" />
}
