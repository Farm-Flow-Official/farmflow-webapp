import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

/**
 * Same-origin proxy for private tree-snapshot photos.
 *
 * The verifier portal needs to show snapshot photos, which the API serves from
 * `GET /api/v1/files/:id/content` as **private** files. A browser `<img>` can't
 * call the API origin directly: the `verifier_access` session cookie is httpOnly
 * and scoped to THIS webapp's origin, so a cross-origin request wouldn't carry it
 * and the API would 401. This route runs server-side on the same origin, forwards
 * the session cookies onto the API (which authorizes the verifier and audits the
 * private read per ADR 0003/0004), and streams the bytes straight back.
 */

// Private bytes — never prerender, never cache at the framework level.
export const dynamic = 'force-dynamic'

// cuid2 ids are lowercase alphanumeric. Validate before interpolating into the
// upstream URL path so a caller can't reshape the request (path traversal/SSRF).
const FILE_ID = /^[a-z0-9]{20,40}$/

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!FILE_ID.test(id)) return new Response(null, { status: 404 })

  const base = process.env.FARMFLOW_API_URL
  if (!base) return new Response(null, { status: 500 })

  const jar = await cookies()
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const upstream = await fetch(`${base}/api/v1/files/${id}/content`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: 'no-store',
  })

  // Pass through auth/not-found failures (401/403/404) so a broken/forbidden
  // photo surfaces as a missing image rather than leaking another file's bytes.
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const contentLength = upstream.headers.get('content-length')
  if (contentLength) headers.set('content-length', contentLength)
  // Mirror the API's stance on private files: don't let any shared cache keep them.
  headers.set('cache-control', 'private, no-store')

  return new Response(upstream.body, { status: 200, headers })
}
