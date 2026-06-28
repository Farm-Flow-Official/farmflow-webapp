import { api } from '@/lib/api'

export type SessionVerification = {
  sessionId: string
  valid: boolean
  /** ISO issue date when valid, else null. */
  issuedAt: string | null
}

/**
 * Public document verification (V-06): checks whether a session has an issued
 * carbon-credit document and returns its issue date — no PII, no auth required.
 */
export async function verifySession(sessionId: string): Promise<SessionVerification> {
  const id = sessionId.trim()
  const { data } = await api.GET('/api/v1/verify/qr-check', {
    params: { query: { sessionId: id } },
  })
  if (!data?.success) return { sessionId: id, valid: false, issuedAt: null }
  return {
    sessionId: data.data.sessionId,
    valid: data.data.valid,
    issuedAt: data.data.issuedAt,
  }
}
