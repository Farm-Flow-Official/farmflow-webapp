import { api, unwrap, ApiError } from '@/lib/api'
import type { PddDetail } from '@/features/pdd/types'

/**
 * The project's PDD, or `null` when it has not been started.
 *
 * Reading no longer creates: opening the print preview used to write a
 * `pdd_documents` row and an audit entry, so `GET` now 404s and starting the
 * document is a deliberate `POST` (`startPdd`).
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
