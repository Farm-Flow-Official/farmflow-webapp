import type { Ok } from '@/lib/api/types'

/**
 * Species catalogue, unenrolled farms, and accrediting bodies for the editor
 * pickers.
 *
 * Declared here rather than beside the fetcher: `ProjectWorkspace` is a client
 * component and needs the type, but the fetcher imports the server-only API
 * client. `@/lib/api/types` is types-all-the-way-down, so it is safe to follow.
 */
export type ProjectLookups = Ok<'/api/v1/admin/projects/lookups', 'get'>
