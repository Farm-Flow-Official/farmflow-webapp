import { api } from '@/lib/api'
import type { BatchDetail, TreeSnapshot } from '@/features/verifier/types'

/** Confidence below this (or a rejected/out-of-bounds verdict) flags a tree for review. */
const ANOMALY_THRESHOLD = 0.7

/** Anomalies first, then lowest confidence — same priority as the queue. */
function sortTrees(trees: TreeSnapshot[]): TreeSnapshot[] {
  return [...trees].sort((a, b) => {
    if (a.anomaly !== b.anomaly) return a.anomaly ? -1 : 1
    return (a.aiConfidenceScore ?? 1) - (b.aiConfidenceScore ?? 1)
  })
}

/** One review batch with its farm geometry and every tree's latest verdict; null when not found. */
export async function fetchBatchById(id: string): Promise<BatchDetail | null> {
  const { data } = await api.GET('/api/v1/verifier/batches/{id}', {
    params: { path: { id } },
  })
  if (!data?.success) return null

  const s = data.data
  const trees = s.trees.map(
    (t): TreeSnapshot => ({
      id: t.id,
      photoFileId: t.photoFileId,
      captureLat: t.captureLat,
      captureLng: t.captureLng,
      capturedAt: t.capturedAt,
      weather: t.weatherCondition,
      aiConfidenceScore: t.confidence,
      estimatedCarbonKgco2e: t.carbonKgCo2e,
      aiStatus: t.status,
      dbhCm: t.dbhCm,
      treeHeightM: t.heightM,
      anomaly:
        t.status === 'rejected' ||
        (t.confidence != null && t.confidence < ANOMALY_THRESHOLD) ||
        t.withinFarmBoundary === false,
    }),
  )

  return {
    id: s.id,
    farmName: s.farm.name,
    ownerName: s.farmerName,
    submittedAt: s.submittedAt,
    treeCount: s.treeCount,
    avgConfidence: s.avgConfidence ?? 0,
    anomalyFlag: s.anomalyFlag,
    status: s.status,
    totalCarbonKgCo2e: s.totalCarbonKgCo2e,
    phone: null,
    farmAddress: s.farm.address ?? s.farm.province,
    province: s.farm.province,
    checkinLat: s.farm.checkinLat,
    checkinLng: s.farm.checkinLng,
    declaredAreaRai: s.farm.declaredAreaRai,
    calculatedAreaRai: s.farm.calculatedAreaRai,
    areaDiscrepancyFlag: s.farm.areaDiscrepancyFlag,
    polygon: s.farm.polygon as [number, number][],
    trees: sortTrees(trees),
  }
}
