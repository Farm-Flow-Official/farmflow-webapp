/**
 * Helpers for the API's response envelope: every endpoint returns
 * `{ success: true, message, data, meta }` on success and
 * `{ success: false, error, meta }` on failure. `unwrap` peels that off so
 * callers work with the inner `data` (or get a thrown `ApiError`).
 */

export type ApiErrorBody = {
  code: string
  message: string
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(body?.message ?? `API request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
    this.details = body?.details
  }
}

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = { success: false; error: ApiErrorBody }

/**
 * Unwraps an openapi-fetch call result `{ data, error, response }`: returns the
 * inner `data.data` on success, throws `ApiError` otherwise. `T` is inferred
 * from the endpoint's typed success payload.
 */
export async function unwrap<T>(
  call: Promise<{
    data?: SuccessEnvelope<T>
    error?: ErrorEnvelope
    response: Response
  }>,
): Promise<T> {
  const { data, error, response } = await call
  if (data?.success) return data.data
  throw new ApiError(response.status, error?.error)
}
