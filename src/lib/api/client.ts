import createClient, { type Middleware } from 'openapi-fetch'
import { cookies } from 'next/headers'
import type { paths } from './schema'

/**
 * Forwards the browser's session cookies onto each server→API request, and
 * fails fast (at REQUEST time, not module load) when the API origin is unset.
 *
 * The env guard lives here — not at module scope — so `next build` can evaluate
 * this module without `FARMFLOW_API_URL` present (dynamic pages never call the
 * API during the build's page-data collection); it only fires on a real call.
 *
 * `cookies()` is request-scoped, so this re-reads fresh on every call — the
 * module-level client below is therefore safe to share across requests.
 */
const forwardCookies: Middleware = {
  async onRequest({ request }) {
    if (!process.env.FARMFLOW_API_URL) {
      throw new Error(
        'FARMFLOW_API_URL is not set. Point it at the API ORIGIN, e.g. ' +
          'http://localhost:3000 (no /api/v1 suffix — the generated paths include it).',
      )
    }
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
export const api = createClient<paths>({
  baseUrl: process.env.FARMFLOW_API_URL ?? '',
  cache: 'no-store',
})
api.use(forwardCookies)
