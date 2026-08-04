/**
 * The executive overview, exactly as `GET /api/v1/executive/overview` returns it.
 *
 * Every figure here is aggregated in the API from real rows — there is no mock
 * behind this file. What is deliberately ABSENT matters as much as what is
 * present: no sold volume, no realised revenue, no retirements. Those statuses
 * exist in the credit enum but nothing in the system writes them, so the page
 * says so out loud (`UnbackedNotice`) rather than rendering a permanent zero.
 *
 * See ADR 0025 for why "certified" here is not "issued by the registry".
 */

/** A metric with its prior-month value, so the UI can render a MoM chip. */
export type Kpi = {
  value: number
  prevValue: number
}

export type ExecutiveKpis = {
  /**
   * Cumulative carbon past the verifier gate, tCO₂e. NOT registry-issued
   * credit — a FarmFlow verifier's approval mints the batch; อบก. certification
   * is a later, external step the system does not record yet.
   */
  certified: Kpi & { estValueThb: number }
  /**
   * Assessed carbon whose session no verifier has ruled on. No `prevValue`:
   * this is a stock whose history the schema cannot reconstruct, and an
   * invented baseline would be worse than an absent one.
   */
  pipeline: { value: number; pendingSessions: number }
  farmers: Kpi & { projects: number }
  /** Total area of active farms, in rai. */
  area: Kpi & { farms: number }
}

/** One month on the cumulative trend. `month` is `YYYY-MM` (Bangkok calendar). */
export type TrendPoint = {
  month: string
  estimated: number
  certified: number
}

/**
 * Where assessed carbon currently sits. `estimatedTotal` is the whole;
 * `awaitingReview + rejected + certified` accounts for it.
 */
export type CarbonFunnel = {
  estimatedTotal: number
  awaitingReview: number
  rejected: number
  certified: number
}

export type SpeciesSlice = {
  speciesCode: string
  speciesNameTh: string
  /** Active farms growing this species — the donut's measure. */
  farms: number
  /** Certified carbon attributed to it so far; rides along in the legend. */
  tco2e: number
  /**
   * Rank across the WHOLE portfolio — the chart's colour slot. Colour follows
   * the species, never its position in the current view, so filtering to one
   * project never repaints the species that survive.
   */
  colorIndex: number
}

/** The project every figure is narrowed to; null means the whole portfolio. */
export type ExecutiveScope = { projectId: string; projectName: string } | null

export type ProjectOption = {
  id: string
  code: string
  name: string
  farms: number
}

/**
 * What the live projects said they would remove each year, from their PDD
 * forecast. An intention, not a commitment — and `projectsMissingTarget` is
 * usually the more useful half: a portfolio where nobody filled the forecast in
 * has no yardstick at all.
 */
export type ReductionTarget = {
  tco2ePerYear: number
  projectsWithTarget: number
  projectsMissingTarget: number
}

/**
 * How much the carbon figures can be trusted — the Governance pillar. Every
 * field is a real MRV signal the platform already computes (ADR 0017 / 0022),
 * surfaced at board altitude for the first time.
 */
export type Governance = {
  /** % of located tree photos taken inside the farm they claim; null if none located. */
  withinBoundaryRate: number | null
  /** Photos whose farm had no boundary to check against — unknown, not outside. */
  unknownBoundary: number
  /** Mean evidence-consistency score in [0,1]; null when nothing is scored. */
  avgConfidence: number | null
  scoredTrees: number
  anomalyTrees: number
  /** Trees the vision model could not read — a human still has to. */
  failedAssessments: number
  overlapFlaggedFarms: number
}

export type ProjectRow = {
  projectId: string
  projectCode: string
  projectName: string
  tco2e: number
  farms: number
  areaRai: number
  /** Centroid of the project's farm boundaries; null until one has a boundary. */
  lat: number | null
  lng: number | null
}

export type ProjectDistribution = {
  total: number
  rows: ProjectRow[]
  others: { projects: number; tco2e: number; farms: number; areaRai: number }
}

export type ImpactCounts = {
  treeSnapshots: number
  completedSessions: number
  speciesCount: number
}

export type ExecutiveOverview = {
  /** ISO instant the aggregates were computed — rendered as "ข้อมูล ณ ...". */
  asOf: string
  marketPriceThbPerTon: number
  scope: ExecutiveScope
  /**
   * Every project, whatever the current scope — this is how the reader moves
   * between them, so it must keep showing the ones they are not looking at.
   */
  projectOptions: ProjectOption[]
  target: ReductionTarget
  kpis: ExecutiveKpis
  trend: TrendPoint[]
  funnel: CarbonFunnel
  bySpecies: SpeciesSlice[]
  governance: Governance
  /** Portfolio-wide even under a scope — it doubles as the project navigator. */
  byProject: ProjectDistribution
  impact: ImpactCounts
}
