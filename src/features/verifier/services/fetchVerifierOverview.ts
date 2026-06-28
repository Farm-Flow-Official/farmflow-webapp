import { api, unwrap } from '@/lib/api'
import type { AnomalyAlert, VerifierOverviewData } from '@/features/verifier/types'

/** Verifier dashboard summary counts + anomaly alerts. */
export async function fetchVerifierOverview(): Promise<VerifierOverviewData> {
  const o = await unwrap(api.GET('/api/v1/verifier/overview'))

  // The overview exposes only sessionId/farmName/reason per alert; richer
  // per-alert fields aren't available here (they live on the batch detail).
  const alerts: AnomalyAlert[] = o.anomalyAlerts.map((a) => ({
    id: a.sessionId,
    batchId: a.sessionId,
    farmName: a.farmName,
    ownerName: '',
    treeCount: 0,
    aiConfidenceScore: 0,
    kind: 'low_confidence',
    detail: a.reason,
    submittedAt: '',
  }))

  return {
    summary: {
      pendingReview: o.pendingCount,
      anomalyAlerts: o.anomalyCount,
      approvedThisMonth: o.approvedCount,
      rejectedThisMonth: o.rejectedCount,
    },
    alerts,
  }
}
