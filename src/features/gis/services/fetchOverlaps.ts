import { api, unwrap } from '@/lib/api'
import { toPage } from '@/lib/api/page'
import type {
  OverlapPage,
  OverlapPair,
  OverlapSummary,
} from '@/features/gis/types/overlap'

export type { OverlapPage, OverlapPair, OverlapSummary }

/** Overlapping farm pairs, worst first. Each pair appears once, not once per side. */
export async function fetchOverlaps(params: {
  limit?: number
  offset?: number
  minPercent?: number
} = {}): Promise<OverlapPage> {
  const page = await unwrap(
    api.GET('/api/v1/admin/gis/overlaps', {
      params: {
        query: {
          limit: params.limit,
          offset: params.offset,
          minPercent: params.minPercent,
        },
      },
    }),
  )
  return toPage(page, (p: OverlapPair) => p)
}

/** Counts for the summary panel above the map. */
export async function fetchOverlapSummary(): Promise<OverlapSummary> {
  const { data } = await api.GET('/api/v1/admin/gis/overlaps/summary', {})
  if (!data?.success) return { pairs: 0, flagged: 0, thresholdPct: 15 }
  return data.data
}
