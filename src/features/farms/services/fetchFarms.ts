import { api, unwrap } from '@/lib/api'
import { toPage } from '@/lib/api/page'
import type { AdminFarm, AdminFarmPage, FarmStatusEvent } from '@/features/farms/types'

/** The query a farm list page can express. Mirrors the API's list contract. */
export type FarmQuery = {
  /** Statuses to include; empty/omitted means every status. */
  status?: string[]
  q?: string
  sort?: 'createdAt' | 'farmName' | 'farmStatus' | 'areaRai'
  dir?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * A page of farms.
 *
 * Filtering and paging happen on the server: a pilot with a hundred thousand
 * farms cannot ship the whole table to the browser and filter it there, which
 * is what every list in this app used to do.
 */
export async function fetchFarms(query: FarmQuery = {}): Promise<AdminFarmPage> {
  const page = await unwrap(
    api.GET('/api/v1/admin/farms/', {
      params: {
        query: {
          status: query.status?.length ? query.status.join(',') : undefined,
          q: query.q || undefined,
          sort: query.sort,
          dir: query.dir,
          limit: query.limit,
          offset: query.offset,
        },
      },
    }),
  )
  return toPage(page, (f: AdminFarm) => f)
}

/** One farm; null when it does not exist. */
export async function fetchFarmById(id: string): Promise<AdminFarm | null> {
  const { data } = await api.GET('/api/v1/admin/farms/{id}', { params: { path: { id } } })
  if (!data?.success) return null
  return data.data as AdminFarm
}

/** The farm's approve / reject / suspend trail, newest first. */
export async function fetchFarmHistory(id: string): Promise<FarmStatusEvent[]> {
  const { data } = await api.GET('/api/v1/admin/farms/{id}/history', {
    params: { path: { id } },
  })
  if (!data?.success) return []
  return data.data as FarmStatusEvent[]
}

/** How many farms are waiting on a decision — the dashboard/sidebar badge. */
export async function fetchPendingFarmCount(): Promise<number> {
  const { data } = await api.GET('/api/v1/admin/farms/pending-count', {})
  return data?.success ? data.data.pending : 0
}
