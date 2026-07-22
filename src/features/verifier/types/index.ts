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
  /** Total tree snapshots the AI has assessed (cumulative). */
  totalTreesAssessed: number
}

/**
 * Anomaly alert as exposed by `GET /verifier/overview`. The endpoint only
 * provides the session id, farm name, and a human-readable reason — richer
 * per-alert fields (owner, tree count, confidence, timestamp) live on the batch
 * detail, not here. We model exactly what the API returns rather than padding
 * missing fields with zeros (which rendered as "0%", "0 ต้น", "Invalid Date").
 */
export type AnomalyAlert = {
  /** Assessment session id — row key and batch link target. */
  id: string
  batchId: string
  farmName: string
  reason: string
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

/** Coefficient + input snapshot the engine recorded for a tree's calculation. */
export type FormulaSnapshot = {
  equationFormula: string
  equationStatus: string | null
  reference: string | null
  inputs: {
    dbhCm: number | null
    heightM: number | null
    rValue: number
    cfValue: number
    co2Multiplier: number
  }
  /** Family-specific coefficients, e.g. { ws: [0.0396, 0.933], wb: [...], wl: "…" }. */
  coefficients: Record<string, unknown>
}

/**
 * The reproducible worked breakdown the carbon engine logged for one tree
 * (carbon_calculation_logs, ADR 0016): every intermediate from D²H through to
 * the final tCO₂e, plus the coefficient snapshot actually used. Values in null
 * for the steps a given equation family doesn't use (e.g. WS/WB/WL only for OGW).
 */
export type CarbonBreakdown = {
  d2h: number | null
  wsKg: number | null
  wbKg: number | null
  wlKg: number | null
  wtAbgKg: number | null
  bAbgT: number | null
  bBlgT: number | null
  bTreeT: number | null
  cTreeTc: number | null
  carbonTco2e: number | null
  formulaSnapshot: FormulaSnapshot | null
}

export type TreeSnapshot = {
  id: string
  /** Snapshot photo file id; null when no photo was captured. */
  photoFileId: string | null
  captureLat: number | null
  captureLng: number | null
  /** Field capture time (ISO 8601); null when unset or encrypted at rest. */
  capturedAt: string | null
  /** Field-recorded weather ('sunny' | 'cloudy' | 'rainy'); null when not recorded. */
  weather: string | null
  aiConfidenceScore: number | null
  /** Estimated carbon for this tree in kgCO₂e; null when no AI assessment yet. */
  estimatedCarbonKgco2e: number | null
  /** AI assessment status: 'waiting' | 'completed' | 'rejected' | 'failed'; null when none. */
  aiStatus: string | null
  /** Anomaly flags the vision model raised (ADR 0022); empty when none. */
  aiFlags: string[]
  /** Vision model's Thai rationale, or a failure reason; null when not assessed. */
  aiRationale: string | null
  /** Diameter at Breast Height (1.3 m) in cm. */
  dbhCm: number | null
  /** Tree height in metres. */
  treeHeightM: number | null
  /** Reproducible carbon calculation breakdown; null when none was logged. */
  carbon: CarbonBreakdown | null
  anomaly: boolean
}

/**
 * Allometric equation provenance for the batch's species — read straight from
 * the engine's `species_equations` row (the one that produced the carbon), so
 * the verifier sees the real equation, never a frontend guess.
 */
export type SpeciesEquation = {
  /** Family code, e.g. 'D2H_OGW'. */
  code: string | null
  /** Citation, e.g. 'Ogawa et al. (1965)'. */
  reference: string | null
  /** 'provisional' = pending TGO sign-off / approximation (ADR 0016). */
  status: 'approved' | 'provisional'
  /** Root:shoot ratio (R). */
  rValue: number | null
  /** Carbon fraction (CF). */
  cfValue: number | null
  speciesNameEn: string | null
}

/**
 * Cultivation facts of the assessed subplot (the unit carbon is computed for,
 * ADR 0007). A farm has ≥1 subplot; a single-species farm is one whole-farm
 * `isDefaultSubplot` unit. `plantingYear` may be Buddhist- or Gregorian-era.
 */
export type Cultivation = {
  speciesNameTh: string | null
  speciesNameEn: string | null
  plantingYear: number | null
  treeDensityPerRai: number | null
  subplotName: string | null
  subplotAreaRai: number | null
  isDefaultSubplot: boolean
}

export type BatchDetail = VerificationBatch & {
  /** Registered species (Thai), e.g. 'ยางพารา'. */
  speciesNameTh: string | null
  /** Cultivation facts of the assessed subplot. */
  cultivation: Cultivation
  /** Allometric equation used by the carbon engine for this species. */
  equation: SpeciesEquation
  /** Farm cover photo file id (public); null when the farmer set none. */
  coverPhotoFileId: string | null
  /** Phone — not exposed by the review endpoint. */
  phone: string | null
  /** Free-text farm address; falls back to the province name when absent. */
  farmAddress: string | null
  /** Province name (structured), shown as a secondary line under the address. */
  province: string | null
  checkinLat: number | null
  checkinLng: number | null
  /** Farmer-declared area in rai; null when not provided. */
  declaredAreaRai: number | null
  /** PostGIS-calculated area in rai; null when the boundary is unset. */
  calculatedAreaRai: number | null
  /** Declared vs calculated area diverge >15% (ADR 0008). */
  areaDiscrepancyFlag: boolean
  polygon: [number, number][]
  trees: TreeSnapshot[]
}
