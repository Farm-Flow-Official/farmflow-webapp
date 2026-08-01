'use server'

import { fetchOverlaps } from '@/features/gis/services/fetchOverlaps'
import type { OverlapPage } from '@/features/gis/types/overlap'

/**
 * Page through overlapping farm pairs from the browser.
 *
 * A server action rather than a direct fetch: the typed API client forwards the
 * admin's HttpOnly session cookie via `next/headers`, which only exists on the
 * server. Calling it from a client component would both fail to compile into the
 * browser bundle and, if it did, require exposing the session to JavaScript.
 */
export async function loadOverlapPage(params: {
  limit: number
  offset: number
  minPercent?: number
}): Promise<OverlapPage> {
  try {
    return await fetchOverlaps(params)
  } catch {
    // The panel keeps whatever it is already showing rather than blanking out.
    return { rows: [], total: 0, limit: params.limit, offset: params.offset }
  }
}
