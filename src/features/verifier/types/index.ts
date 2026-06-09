/**
 * API contract for the Verifier Portal, aligned with **ERD v3** — verifiers
 * review carbon assessment batches (CARBON_CREDIT_BATCHES) built from
 * ASSESSMENT_SESSIONS / TREE_SNAPSHOTS, judging `ai_confidence_score`.
 */

/** Verifier dashboard summary counts (V-02). */
export type VerifierOverview = {
  pendingReview: number
  anomalyAlerts: number
  approvedThisMonth: number
  rejectedThisMonth: number
}

/** Why a batch is flagged by anomaly detection. */
export type AnomalyKind = 'low_confidence' | 'metadata_mismatch'

/** A batch surfaced by the smart alert panel (V-02). */
export type AnomalyAlert = {
  id: string
  /** batch_id — route param for V-04 Batch Detail. */
  batchId: string
  /** Enriched farm/farmer display names (ordinary PII, mock — see [[A-04]]). */
  farmName: string
  ownerName: string
  treeCount: number
  /** Average ai_confidence_score across the batch (0…1). */
  aiConfidenceScore: number
  kind: AnomalyKind
  detail: string
  submittedAt: string
}

export type VerifierOverviewData = {
  summary: VerifierOverview
  alerts: AnomalyAlert[]
}
