import createClient, { type Middleware } from 'openapi-fetch'
import { cookies } from 'next/headers'
import type { paths } from './schema'

const baseUrl = process.env.FARMFLOW_API_URL
if (!baseUrl) {
  throw new Error(
    'FARMFLOW_API_URL is not set. Point it at the API ORIGIN, e.g. ' +
      'http://localhost:3000 (no /api/v1 suffix — the generated paths include it).',
  )
}

/**
 * Forwards the browser's session cookies onto each server→API request. A
 * server-side `fetch` does not carry the incoming request's cookies, and the
 * admin/verifier sessions are HttpOnly cookies, so we copy them across.
 *
 * `cookies()` is request-scoped, so this re-reads fresh on every call — the
 * module-level client below is therefore safe to share across requests.
 */
const forwardCookies: Middleware = {
  async onRequest({ request }) {
    const jar = await cookies()
    const header = jar
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ')
    if (header) request.headers.set('cookie', header)
    return request
  },
}

/**
 * Typed client for the FarmFlow Elysia API.
 *
 * `baseUrl` is the API ORIGIN only; the generated paths already carry the
 * `/api/v1` prefix, so repeating it here would produce `/api/v1/api/v1/...`.
 */
export const api = createClient<paths>({ baseUrl, cache: 'no-store' })
api.use(forwardCookies)
