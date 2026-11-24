import { api, unwrap } from '@/lib/api'
import type { ExecutiveOverview } from '@/features/executive/types'

/**
 * Single data seam for the executive dashboard.
 *
 * Mounted at `/executive/overview`, NOT under `/admin` — the EXECUTIVE role sits
 * on the API's admin deny-list, so an admin-prefixed aggregate would 403 for
 * exactly the people this page is for.
 *
 * `projectId` narrows every figure to one project; the project list and the
 * distribution card come back portfolio-wide regardless, so the reader is never
 * stuck inside the scope they picked.
 *
 * Throws `ApiError` on failure; the page turns that into an `ApiFailurePanel`
 * via `describeApiFailure()` rather than swallowing it into empty widgets.
 */
export async function fetchExecutiveOverview(projectId?: string): Promise<ExecutiveOverview> {
  return unwrap(
    api.GET('/api/v1/executive/overview', {
      params: { query: projectId ? { projectId } : {} },
    }),
  )
}
