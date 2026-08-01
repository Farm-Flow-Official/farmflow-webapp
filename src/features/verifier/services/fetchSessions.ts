import { api, unwrap } from '@/lib/api'
import type { VerificationSession } from '@/features/verifier/types'

/** Pending first, then anomalies, then lowest confidence — the review priority order. */
function smartSort(sessions: VerificationSession[]): VerificationSession[] {
  return [...sessions].sort((a, b) => {
    const aPending = a.status === 'Pending' ? 0 : 1
    const bPending = b.status === 'Pending' ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    if (a.anomalyFlag !== b.anomalyFlag) return a.anomalyFlag ? -1 : 1
    return a.avgConfidence - b.avgConfidence
  })
}

/**
 * The verifier review queue (assessment sessions awaiting a decision), scoped to
 * one project. Pass `"unassigned"` for farms enrolled in no project.
 */
export async function fetchSessions(projectId: string): Promise<VerificationSession[]> {
  const sessions = await unwrap(
    api.GET('/api/v1/verifier/batches', { params: { query: { projectId } } }),
  )
  return smartSort(
    sessions.map((b) => ({
      id: b.id,
      farmName: b.farmName,
      projectId: b.projectId,
      projectName: b.projectName,
      ownerName: b.farmerName,
      submittedAt: b.submittedAt,
      treeCount: b.treeCount,
      avgConfidence: b.avgConfidence ?? 0,
      anomalyFlag: b.anomalyFlag,
      status: b.status,
      totalCarbonKgCo2e: b.totalCarbonKgCo2e,
      isBaseline: b.isBaseline,
    })),
  )
}
