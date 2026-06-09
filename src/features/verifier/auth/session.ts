import { cookies } from 'next/headers'
import { cache } from 'react'
import type { VerifierProfile } from '@/features/verifier/auth/types'

export const VERIFIER_COOKIE = 'ff_verifier'

/**
 * Reads the verifier session. MOCK for BETA: the session is a local cookie set
 * by `loginVerifier` (the API has no verifier auth yet — only an admin/MASTER
 * account exists). When the backend adds `POST /auth/verifier/login`, replace
 * this with a real call to `/auth/verifier/me` using forwarded cookies, mirroring
 * `features/auth/services/adminSession.ts`.
 */
export const getVerifierSession = cache(async (): Promise<VerifierProfile | null> => {
  const store = await cookies()
  const raw = store.get(VERIFIER_COOKIE)?.value
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as { id: string; username: string; org: string }
    if (!data.id || !data.username) return null
    return { id: data.id, username: data.username, org: data.org, role: 'Verifier' }
  } catch {
    return null
  }
})
