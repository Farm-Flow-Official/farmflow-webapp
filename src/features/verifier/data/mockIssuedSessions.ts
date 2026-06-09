/**
 * Registry of session_ids that have an issued (approved) document — the QR on a
 * PDF encodes one of these. Tied to the approved batches in the queue mock.
 * Delete once `verifySession()` calls the real public endpoint.
 *
 * Public-safe: maps session_id → issue date only. No PII (per V-06 constraint).
 */
export const mockIssuedSessions: Record<string, { issuedAt: string }> = {
  'SES-2026-0034': { issuedAt: '2026-06-03T08:00:00Z' }, // batch BATCH-2026-0034
  'SES-2026-0033': { issuedAt: '2026-06-02T09:30:00Z' }, // batch BATCH-2026-0033
  'SES-2026-0030': { issuedAt: '2026-05-29T07:15:00Z' }, // batch BATCH-2026-0030
}
