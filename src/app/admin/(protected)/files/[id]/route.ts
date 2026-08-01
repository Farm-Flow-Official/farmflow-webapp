import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

/**
 * Same-origin proxy for private admin files — the PDD's attachments.
 *
 * The twin of the verifier portal's proxy, and needed for the same reason: the
 * API serves these bytes from `GET /api/v1/files/:id/content` as **private**
 * files, and a browser `<img src>` pointed at the API origin would not carry the
 * httpOnly `admin_access` cookie, so the API would 401. This route runs on the
 * webapp's own origin, forwards the session cookies, and streams the response
 * back — so the API still authorizes the read and still audits it (ADR 0003/0004).
 *
 * It exists so the wizard can show a person what they actually attached. A land
 * deed slot that says only "uploaded" cannot tell you that you picked the wrong
 * page of the wrong document.
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

  // Pass through auth/not-found failures so a forbidden file surfaces as a
  // broken image rather than leaking another file's bytes.
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const contentLength = upstream.headers.get('content-length')
  if (contentLength) headers.set('content-length', contentLength)
  // Mirror the API's stance on private files: no shared cache may keep them.
  headers.set('cache-control', 'private, no-store')

  return new Response(upstream.body, { status: 200, headers })
}
