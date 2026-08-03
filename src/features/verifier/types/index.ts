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
 * per-alert fields (owner, tree count, confidence, timestamp) live on the session
 * detail, not here. We model exactly what the API returns rather than padding
 * missing fields with zeros (which rendered as "0%", "0 ต้น", "Invalid Date").
 */
export type AnomalyAlert = {
  /** Assessment session id — row key and session link target. */
  id: string
  sessionId: string
  farmName: string
  reason: string
}

export type VerifierOverviewData = {
  summary: VerifierOverview
  alerts: AnomalyAlert[]
}

/* ── V-03 Session Queue ──────────────────────────────────────────────── */

export type SessionStatus = 'Pending' | 'Approved' | 'Rejected'

export type VerificationSession = {
  id: string
  farmName: string
  /** The T-VER project this session belongs to; null for an unenrolled farm. */
  projectId: string | null
  projectName: string | null
  /** Personal name, or a non-PII fallback (ADR 0013). */
  ownerName: string
  submittedAt: string
  treeCount: number
  avgConfidence: number
  anomalyFlag: boolean
  status: SessionStatus
  totalCarbonKgCo2e: number
  /** This session set the farm's reference carbon stock — shows the green TAG. */
  isBaseline: boolean
}

/* ── V-04 Session Detail / V-05 Tree Inspect ──────────────────────────────── */

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
  /**
   * The **model's** verdict: 'waiting' | 'completed' | 'rejected' | 'failed'.
   * Never overwritten by a human decision — see `rejectedByVerifier`.
   */
  aiStatus: string | null
  /** The latest verdict overall: the model's, or a verifier's if they ruled. */
  status: string | null
  /** Anomaly flags the vision model raised (ADR 0022); empty when none. */
  aiFlags: string[]
  /** Vision model's Thai rationale, or a failure reason; null when not assessed. */
  aiRationale: string | null
  /** Why this tree was rejected — the farmer sees this text. */
  rejectionReason: string | null
  /** A person rejected this tree, not the model (VERIFIER-DETAIL-04). */
  rejectedByVerifier: boolean
  /** A person checked the flagged tree and accepted it — clears the anomaly. */
  confirmedByVerifier: boolean
  /** Diameter at Breast Height (1.3 m) in cm. */
  dbhCm: number | null
  /** Tree height in metres. */
  treeHeightM: number | null
  /** Reproducible carbon calculation breakdown; null when none was logged. */
  carbon: CarbonBreakdown | null
  anomaly: boolean
}

/**
 * Allometric equation provenance for the session's species — read straight from
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

/**
 * The farm's reference carbon stock in this project (VERIFIER-BASELINE-01).
 * Null when no baseline has been set — the usual state before the first
 * approval.
 */
export type SessionBaseline = {
  sessionId: string
  /** This session is the one that established it — drives the green TAG. */
  isThisSession: boolean
  carbonTco2e: number
  creditingPeriodYears: number | null
  approvedAt: string
}

/** What the farm is registered to, and when it is next due (VERIFIER-DETAIL-02). */
export type SessionRegistration = {
  creditingPeriodYears: number | null
  creditingStartDate: string | null
  creditingEndDate: string | null
  /** Null once the crediting period has ended — there is no next round. */
  nextCollectionYear: number | null
}

/**
 * The session's trees, in the states that actually occur.
 *
 * `passed + rejected` need not equal `submitted`: a tree the assessor never
 * finished is neither, carries no carbon, and used to disappear from every
 * total while still being counted as a tree.
 */
export type SessionTally = {
  submitted: number
  passed: number
  rejected: number
  unassessed: number
}

/**
 * What was decided at approval — null while the session is pending.
 *
 * The certificate cites these rather than a fresh count: they are the numbers
 * the credits were issued against, and a recount agrees with them only until
 * something changes.
 */
export type SessionResult = {
  passedTrees: number
  rejectedTrees: number
  approvedTco2e: number | null
  netAboveBaselineTco2e: number | null
  reviewedAt: string
}

export type SessionDetail = VerificationSession & {
  tally: SessionTally
  result: SessionResult | null
  projectCode: string | null
  registration: SessionRegistration
  baseline: SessionBaseline | null
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
