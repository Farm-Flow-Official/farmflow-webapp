/**
 * API contract for the Verifier Portal, aligned with ERD v3.
 * Fields marked "not in DB yet" are mock-only; shown with MockTag in UI.
 */

export type VerifierOverview = {
  pendingReview: number
  anomalyAlerts: number
  approvedThisMonth: number
  rejectedThisMonth: number
}

export type AnomalyKind = 'low_confidence' | 'metadata_mismatch'

export type AnomalyAlert = {
  id: string
  batchId: string
  farmName: string
  /** username from DB (no fullName yet) */
  ownerName: string
  treeCount: number
  aiConfidenceScore: number
  kind: AnomalyKind
  detail: string
  submittedAt: string
}

export type VerifierOverviewData = {
  summary: VerifierOverview
  alerts: AnomalyAlert[]
}

/* ── V-03 Farm Batch Queue ──────────────────────────────────────────────── */

export type BatchStatus = 'Pending' | 'Approved' | 'Rejected'

export type VerificationBatch = {
  id: string
  farmId: string
  farmName: string
  /** username from DB — no fullName yet */
  ownerName: string
  submittedAt: string
  treeCount: number
  avgConfidence: number
  anomalyFlag: boolean
  status: BatchStatus
  totalCarbonKgCo2e: number
  /** true = data from live API; false = demo/mock */
  _live: boolean
}

/* ── V-04 Batch Detail / V-05 Tree Inspect ──────────────────────────────── */

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy'

export type TreeSnapshot = {
  id: string
  captureLat: number | null
  captureLng: number | null
  capturedAt: string
  /** weather string from DB (not strongly typed) */
  weather: string | null
  aiConfidenceScore: number | null
  /** Estimated carbon sequestration for this tree in kgCO₂e. null when no AI assessment yet. */
  estimatedCarbonKgco2e: number | null
  /** AI assessment status: 'waiting' | 'completed' | 'rejected'. null when no assessment yet. */
  aiStatus: string | null
  anomaly: boolean
}

export type BatchDetail = VerificationBatch & {
  /** Phone — not in DB yet */
  phone: string | null
  farmAddress: string | null
  checkinLat: number | null
  checkinLng: number | null
  polygon: [number, number][]
  trees: TreeSnapshot[]
}
