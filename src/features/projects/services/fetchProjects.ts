import { api, unwrap, ApiError } from '@/lib/api'
import type { Ok } from '@/lib/api/types'
import type { ProjectDetail, ProjectListItem } from '@/features/projects/types'

export type ProjectLookups = Ok<'/api/v1/admin/projects/lookups', 'get'>

/** Species catalogue, unenrolled farms, and accrediting bodies for the editor pickers. */
export async function fetchProjectLookups(): Promise<ProjectLookups> {
  return unwrap(api.GET('/api/v1/admin/projects/lookups'))
}

/** Every project, newest first (the API already orders by creation). */
export async function fetchProjects(): Promise<ProjectListItem[]> {
  return unwrap(api.GET('/api/v1/admin/projects/'))
}

/** One project with its allowed species and member farms; null when it is gone. */
export async function fetchProject(id: string): Promise<ProjectDetail | null> {
  try {
    return await unwrap(api.GET('/api/v1/admin/projects/{id}', { params: { path: { id } } }))
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}
