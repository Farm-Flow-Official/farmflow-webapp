import { mockIssuedSessions } from '@/features/verifier/data/mockIssuedSessions'

export type SessionVerification = {
  sessionId: string
  valid: boolean
  /** ISO issue date when valid, else null. */
  issuedAt: string | null
}

/**
 * Public document-verification seam (V-06). Checks only that a session_id has an
 * issued document and returns its issue date — **no PII**. When the API is ready,
 * replace the body with the public endpoint (no auth):
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const res = await fetch(
 *     `${apiBase}/verify/qr-check?session_id=${encodeURIComponent(id)}`,
 *     { cache: 'no-store' },
 *   )
 *   if (!res.ok) return { sessionId: id, valid: false, issuedAt: null }
 *   const json = (await res.json()) as { data?: { issuedAt: string } }
 *   return { sessionId: id, valid: Boolean(json.data), issuedAt: json.data?.issuedAt ?? null }
 */
export async function verifySession(sessionId: string): Promise<SessionVerification> {
  const id = sessionId.trim()
  const rec = mockIssuedSessions[id]
  return { sessionId: id, valid: Boolean(rec), issuedAt: rec?.issuedAt ?? null }
}
