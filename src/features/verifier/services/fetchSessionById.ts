import { api } from '@/lib/api'
import type { SessionDetail, TreeSnapshot, FormulaSnapshot } from '@/features/verifier/types'

/** Confidence below this (or a rejected/out-of-bounds verdict) flags a tree for review. */
const ANOMALY_THRESHOLD = 0.7

/** Vision flags severe enough to flag a tree for review on their own (ADR 0022). */
const HARD_VISION_FLAGS = ['not_a_tree', 'duplicate_or_stock_photo']

/**
 * Outstanding work first: unreviewed anomalies, then unreviewed trees by rising
 * confidence, then anything a verifier has already ruled on.
 *
 * Trees the verifier has decided sink to the end whichever way they decided.
 * They are done — keeping a rejected tree at the top would put the same photo in
 * front of them every time they return to the session, and a confirmed one is by
 * definition no longer a question (VERIFIER-DETAIL-04).
 */
function sortTrees(trees: TreeSnapshot[]): TreeSnapshot[] {
  const decided = (t: TreeSnapshot) => t.rejectedByVerifier || t.confirmedByVerifier
  return [...trees].sort((a, b) => {
    if (decided(a) !== decided(b)) return decided(a) ? 1 : -1
    if (a.anomaly !== b.anomaly) return a.anomaly ? -1 : 1
    return (a.aiConfidenceScore ?? 1) - (b.aiConfidenceScore ?? 1)
  })
}

/** One review session with its farm geometry and every tree's latest verdict; null when not found. */
export async function fetchSessionById(id: string): Promise<SessionDetail | null> {
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
      aiStatus: t.aiStatus,
      status: t.status,
      aiFlags: t.aiFlags ?? [],
      aiRationale: t.aiRationale,
      rejectionReason: t.rejectionReason,
      rejectedByVerifier: t.rejectedByVerifier,
      confirmedByVerifier: t.confirmedByVerifier,
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
        // A verifier who checked the photo and accepted it ends the question —
        // mirrors `treeNeedsReview` on the server.
        !t.confirmedByVerifier &&
        (t.aiStatus === 'rejected' ||
        t.aiStatus === 'failed' ||
        (t.confidence != null && t.confidence < ANOMALY_THRESHOLD) ||
        t.withinFarmBoundary === false ||
        (t.aiFlags ?? []).some((f) => HARD_VISION_FLAGS.includes(f))),
    }),
  )

  return {
    id: s.id,
    farmName: s.farm.name,
    projectId: s.projectId,
    projectName: s.projectName,
    coverPhotoFileId: s.farm.coverPhotoFileId,
    ownerName: s.farmerName,
    submittedAt: s.submittedAt,
    treeCount: s.treeCount,
    avgConfidence: s.avgConfidence ?? 0,
    anomalyFlag: s.anomalyFlag,
    status: s.status,
    totalCarbonKgCo2e: s.totalCarbonKgCo2e,
    isBaseline: s.baseline?.isThisSession ?? false,
    projectCode: s.projectCode,
    registration: s.registration,
    baseline: s.baseline ?? null,
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
