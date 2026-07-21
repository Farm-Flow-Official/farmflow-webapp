import type { NextRequest } from 'next/server'

/**
 * Same-origin proxy for **public** farm cover photos.
 *
 * The API serves cover photos from `GET /api/v1/files/:id/content` as public
 * files (see files service — category `cover_photo` → access level `public`),
 * so unlike the verifier snapshot proxy this needs no session cookie. But the
 * browser still can't hit the API origin directly: `FARMFLOW_API_URL` is a
 * server-only env, never exposed to the client. This route runs server-side on
 * the webapp's own origin, fetches the bytes, and streams them back.
 *
 * Cover photos are public and content-addressed (a new upload gets a new file
 * id, ADR 0002), so we mirror the API's long-lived immutable cache header.
 */

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

  const upstream = await fetch(`${base}/api/v1/files/${id}/content`, {
    // Public, immutable bytes — let the runtime cache the upstream fetch too.
    cache: 'force-cache',
  })

  // Pass through not-found/forbidden so a broken cover surfaces as a missing
  // image rather than leaking another file's bytes.
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const contentLength = upstream.headers.get('content-length')
  if (contentLength) headers.set('content-length', contentLength)
  // Mirror the API's stance on public assets (files/index.ts): long-lived and
  // immutable — a repointed cover is a different file id, so this can't go stale.
  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new Response(upstream.body, { status: 200, headers })
}
