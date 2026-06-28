import { api, unwrap } from '@/lib/api'
import type { VerificationBatch } from '@/features/verifier/types'

/** Pending first, then anomalies, then lowest confidence — the review priority order. */
function smartSort(batches: VerificationBatch[]): VerificationBatch[] {
  return [...batches].sort((a, b) => {
    const aPending = a.status === 'Pending' ? 0 : 1
    const bPending = b.status === 'Pending' ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    if (a.anomalyFlag !== b.anomalyFlag) return a.anomalyFlag ? -1 : 1
    return a.avgConfidence - b.avgConfidence
  })
}

/** The verifier review queue (assessment sessions awaiting a decision). */
export async function fetchBatches(): Promise<VerificationBatch[]> {
  const batches = await unwrap(api.GET('/api/v1/verifier/batches'))
  return smartSort(
    batches.map((b) => ({
      id: b.id,
      farmName: b.farmName,
      ownerName: b.farmerName,
      submittedAt: b.submittedAt,
      treeCount: b.treeCount,
      avgConfidence: b.avgConfidence ?? 0,
      anomalyFlag: b.anomalyFlag,
      status: b.status,
      totalCarbonKgCo2e: b.totalCarbonKgCo2e,
    })),
  )
}
