import type { paths } from './schema'

/**
 * Extracts the inner `data` payload type of a 200 JSON response for a given
 * path + method. The upstream spec inlines every schema (no `components`), so we
 * derive named aliases here instead of importing shared model types.
 */
export type Ok<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends {
  responses: { 200: { content: { 'application/json': { data: infer D } } } }
}
  ? D
  : never

export type FarmerListItem = Ok<'/api/v1/admin/farmers/', 'get'>[number]
export type VerifierBatch = Ok<'/api/v1/verifier/batches', 'get'>[number]
export type SystemSettings = Ok<'/api/v1/admin/system/settings', 'get'>
