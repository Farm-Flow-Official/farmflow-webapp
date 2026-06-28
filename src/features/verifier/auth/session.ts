import { cache } from 'react'
import { api } from '@/lib/api'
import type { VerifierProfile } from '@/features/verifier/auth/types'

/**
 * Resolves the current verifier via `GET /verifier/auth/me` (the typed client
 * forwards the `verifier_access` session cookie). Returns `null` when the
 * session is missing or invalid. Memoised per-request via React `cache`.
 */
export const getVerifierSession = cache(async (): Promise<VerifierProfile | null> => {
  try {
    const { data } = await api.GET('/api/v1/verifier/auth/me')
    return data?.success ? data.data : null
  } catch {
    return null
  }
})
