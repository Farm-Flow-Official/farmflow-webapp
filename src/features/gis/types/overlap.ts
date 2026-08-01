import type { FarmStatus } from '@/features/farmers/types'

/**
 * Overlapping farm pairs (ADMIN-GIS-01).
 *
 * Separate from the service that fetches them: that module imports the API
 * client, which is server-only, and a client component importing these types
 * would drag it into the browser bundle.
 */
export type OverlapSide = {
  id: string
  name: string
  status: FarmStatus
  ownerName: string
}

export type OverlapPair = {
  farmA: OverlapSide
  farmB: OverlapSide
  /** Share of the *smaller* boundary — a fully-swallowed plot reads 100. */
  overlapPercent: number
  overlapAreaRai: number
  centroid: { lat: number; lng: number }
}

export type OverlapPage = {
  rows: OverlapPair[]
  total: number
  limit: number
  offset: number
}

export type OverlapSummary = {
  pairs: number
  flagged: number
  thresholdPct: number
}
