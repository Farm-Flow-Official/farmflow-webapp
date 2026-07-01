/**
 * Shared helpers for handling the API's admin session cookies. Used by both the
 * login Server Action (relays cookies onto the Next response) and the proxy
 * (rotates the session). Kept free of `next/headers`/React imports so it is safe
 * to import from the proxy runtime.
 */

export type ParsedCookie = { name: string; value: string; maxAge?: number }

/**
 * Parses a single `Set-Cookie` header value into name/value/(Max-Age). The
 * cookie value may itself contain `=` (e.g. a JWT), so we split on the first
 * `=` only.
 */
export function parseSetCookie(raw: string): ParsedCookie | null {
  const [pair, ...attrs] = raw.split(';')
  const eq = pair.indexOf('=')
  if (eq === -1) return null

  const name = pair.slice(0, eq).trim()
  const value = pair.slice(eq + 1).trim()
  if (!name) return null

  let maxAge: number | undefined
  for (const attr of attrs) {
    const [k, v] = attr.split('=')
    if (k.trim().toLowerCase() === 'max-age' && v !== undefined) {
      const n = Number(v.trim())
      if (!Number.isNaN(n)) maxAge = n
    }
  }

  return { name, value, maxAge }
}

/**
 * Our own attributes for re-issuing the API's session cookies onto the browser,
 * scoped to this app (rather than copying upstream Path/Domain/Secure).
 */
export function sessionCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  }
}
