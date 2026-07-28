import { api, unwrap, ApiError } from '@/lib/api'
import type { PddDetail } from '@/features/pdd/types'

/**
 * The project's PDD. The API creates the first draft on demand, so this both
 * opens and (on a project's first visit) starts the document.
 */
export async function fetchPdd(projectId: string): Promise<PddDetail | null> {
  try {
    return await unwrap(
      api.GET('/api/v1/admin/projects/{id}/pdd', { params: { path: { id: projectId } } }),
    )
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}
