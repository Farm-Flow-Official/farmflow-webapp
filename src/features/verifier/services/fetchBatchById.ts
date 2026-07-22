import { api } from '@/lib/api'
import type { BatchDetail, TreeSnapshot, FormulaSnapshot } from '@/features/verifier/types'

/** Confidence below this (or a rejected/out-of-bounds verdict) flags a tree for review. */
const ANOMALY_THRESHOLD = 0.7

/** Vision flags severe enough to flag a tree for review on their own (ADR 0022). */
const HARD_VISION_FLAGS = ['not_a_tree', 'duplicate_or_stock_photo']

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
      aiFlags: t.aiFlags ?? [],
      aiRationale: t.aiRationale,
      dbhCm: t.dbhCm,
      treeHeightM: t.heightM,
      carbon: t.carbon
        ? {
            d2h: t.carbon.d2h,
            wsKg: t.carbon.wsKg,
            wbKg: t.carbon.wbKg,
            wlKg: t.carbon.wlKg,
            wtAbgKg: t.carbon.wtAbgKg,
            bAbgT: t.carbon.bAbgT,
            bBlgT: t.carbon.bBlgT,
            bTreeT: t.carbon.bTreeT,
            cTreeTc: t.carbon.cTreeTc,
            carbonTco2e: t.carbon.carbonTco2e,
            formulaSnapshot: (t.carbon.formulaSnapshot as FormulaSnapshot | null) ?? null,
          }
        : null,
      anomaly:
        t.status === 'rejected' ||
        t.status === 'failed' ||
        (t.confidence != null && t.confidence < ANOMALY_THRESHOLD) ||
        t.withinFarmBoundary === false ||
        (t.aiFlags ?? []).some((f) => HARD_VISION_FLAGS.includes(f)),
    }),
  )

  return {
    id: s.id,
    farmName: s.farm.name,
    coverPhotoFileId: s.farm.coverPhotoFileId,
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
    speciesNameTh: s.cropType,
    cultivation: {
      speciesNameTh: s.cultivation.speciesNameTh,
      speciesNameEn: s.cultivation.speciesNameEn,
      plantingYear: s.cultivation.plantingYear,
      treeDensityPerRai: s.cultivation.treeDensityPerRai,
      subplotName: s.cultivation.subplotName,
      subplotAreaRai: s.cultivation.subplotAreaRai,
      isDefaultSubplot: s.cultivation.isDefaultSubplot,
    },
    equation: {
      code: s.equation.code,
      reference: s.equation.reference,
      status: s.equation.status,
      rValue: s.equation.rValue,
      cfValue: s.equation.cfValue,
      speciesNameEn: s.equation.speciesNameEn,
    },
    trees: sortTrees(trees),
  }
}
