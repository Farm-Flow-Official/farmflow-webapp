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

/* ── V-03 Farm Batch Queue ──────────────────────────────────────────────── */

/** Verifier review status of a batch (distinct from the credit-lifecycle status). */
export type BatchStatus = 'Pending' | 'Approved' | 'Rejected'

export type VerificationBatch = {
  /** batch_id — route param for V-04 Batch Detail. */
  id: string
  farmId: string
  /** Enriched farm/farmer names (ordinary PII, mock — see [[A-04]]). */
  farmName: string
  ownerName: string
  /** When the farmer submitted the batch for verification. */
  submittedAt: string
  /** Number of tree snapshots in the batch. */
  treeCount: number
  /** Average ai_confidence_score across the batch (0…1). */
  avgConfidence: number
  /** True when anomaly detection flags the batch (low confidence / metadata mismatch). */
  anomalyFlag: boolean
  status: BatchStatus
  /** Carbon backing the batch, in kg CO₂e (context for V-04). */
  totalCarbonKgCo2e: number
}

/* ── V-04 Batch Detail / V-05 Tree Inspect ──────────────────────────────── */

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy'

/** One tree photo + metadata (ERD: TREE_SNAPSHOTS). Feeds V-04 grid & V-05. */
export type TreeSnapshot = {
  /** snapshot_id — route param for V-05 deep inspect. */
  id: string
  /** capture_lat / capture_lng — GPS of the photo. */
  captureLat: number
  captureLng: number
  capturedAt: string
  weather: WeatherCondition
  /** ai_confidence_score (0…1). */
  aiConfidenceScore: number
  /** Flagged by anomaly detection (low confidence / metadata mismatch). */
  anomaly: boolean
}

/** Full batch for the detail/review page (V-04). */
export type BatchDetail = VerificationBatch & {
  /** Enriched ordinary PII (mock — see [[A-04]]). */
  phone: string
  farmAddress: string
  /** Farm GPS + polygon (ERD: checkin_lat/lng, farm_polygon_geojson). */
  checkinLat: number
  checkinLng: number
  /** GeoJSON polygon outer ring ([lng, lat]). */
  polygon: [number, number][]
  trees: TreeSnapshot[]
}

