/**
 * View-model types for the Verifier Portal. The services map the Elysia
 * `/verifier/*` responses onto these shapes; fields the API does not expose
 * (phone, address, check-in point, per-snapshot weather/time) are filled with
 * null by the mappers.
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
  /** Personal name / non-PII fallback; empty when the API omits it. */
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
  farmName: string
  /** Personal name, or a non-PII fallback (ADR 0013). */
  ownerName: string
  submittedAt: string
  treeCount: number
  avgConfidence: number
  anomalyFlag: boolean
  status: BatchStatus
  totalCarbonKgCo2e: number
}

/* ── V-04 Batch Detail / V-05 Tree Inspect ──────────────────────────────── */

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy'

export type TreeSnapshot = {
  id: string
  captureLat: number | null
  captureLng: number | null
  /** Capture time; null — not exposed by the review endpoint. */
  capturedAt: string | null
  /** Weather; null — not exposed by the review endpoint. */
  weather: string | null
  aiConfidenceScore: number | null
  /** Estimated carbon for this tree in kgCO₂e; null when no AI assessment yet. */
  estimatedCarbonKgco2e: number | null
  /** AI assessment status: 'waiting' | 'completed' | 'rejected'; null when none. */
  aiStatus: string | null
  /** Diameter at Breast Height (1.3 m) in cm. */
  dbhCm: number | null
  /** Tree height in metres. */
  treeHeightM: number | null
  anomaly: boolean
}

export type BatchDetail = VerificationBatch & {
  /** Phone — not exposed by the review endpoint. */
  phone: string | null
  farmAddress: string | null
  checkinLat: number | null
  checkinLng: number | null
  polygon: [number, number][]
  trees: TreeSnapshot[]
}
