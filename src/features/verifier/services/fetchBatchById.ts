import type { BatchDetail } from '@/features/verifier/types'
import { mockBatchDetails } from '@/features/verifier/data/mockBatchDetails'

/**
 * Single data seam for a batch detail (V-04). Today it returns mock data; when
 * the verifier API is ready, replace ONLY the body below. The endpoint should
 * join the farm (polygon, address, owner) and the tree snapshots:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardVerifierCookie()
 *   const res = await fetch(`${apiBase}/verifier/batches/${encodeURIComponent(id)}`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (res.status === 404 || !res.ok) return null
 *   const json = (await res.json()) as { data?: BatchDetail }
 *   return json.data ?? null
 */
export async function fetchBatchById(id: string): Promise<BatchDetail | null> {
  const batch = mockBatchDetails[id]
  if (!batch) return null
  // Surface suspect photos first — anomalies, then lowest confidence. Both the
  // V-04 grid and V-05 prev/next consume this order, so they stay in sync.
  return {
    ...batch,
    trees: [...batch.trees].sort((a, b) => {
      if (a.anomaly !== b.anomaly) return a.anomaly ? -1 : 1
      return a.aiConfidenceScore - b.aiConfidenceScore
    }),
  }
}
