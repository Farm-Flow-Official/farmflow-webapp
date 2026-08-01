import { api, unwrap } from '@/lib/api'
import type { AnomalyAlert, VerifierOverviewData } from '@/features/verifier/types'

/** Verifier dashboard summary counts + anomaly alerts, scoped to one project. */
export async function fetchVerifierOverview(projectId: string): Promise<VerifierOverviewData> {
  const o = await unwrap(
    api.GET('/api/v1/verifier/overview', { params: { query: { projectId } } }),
  )

  // The overview exposes only sessionId/farmName/reason per alert; richer
  // per-alert fields aren't available here (they live on the session detail), so
  // we map exactly those three rather than padding with zeros.
  const alerts: AnomalyAlert[] = o.anomalyAlerts.map((a) => ({
    id: a.sessionId,
    sessionId: a.sessionId,
    farmName: a.farmName,
    reason: a.reason,
  }))

  return {
    summary: {
      pendingReview: o.pendingCount,
      anomalyAlerts: o.anomalyCount,
      approvedThisMonth: o.approvedCount,
      rejectedThisMonth: o.rejectedCount,
      totalTreesAssessed: o.totalTreesAssessed,
    },
    alerts,
  }
}
