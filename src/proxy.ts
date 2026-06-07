import { type NextRequest, NextResponse } from 'next/server'
import {
  parseSetCookie,
  sessionCookieOptions,
} from '@/features/auth/services/sessionCookies'

// Subdomain routing will be implemented here:
// dashboard.farmflow.* → /admin/*
// verifier.farmflow.*  → /verifier/*
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Keep admin sessions alive: when the short-lived access cookie has expired
  // but the (longer-lived) refresh cookie is still present, transparently
  // rotate the session before the page renders.
  const isProtectedAdmin =
    pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')

  if (
    isProtectedAdmin &&
    !request.cookies.has('admin_access') &&
    request.cookies.has('admin_refresh')
  ) {
    const refreshed = await refreshAdminSession(request)
    if (refreshed) return refreshed
  }

  return NextResponse.next()
}

/**
 * Calls the API's refresh endpoint with the current cookies. On success, the new
 * session cookies are (a) injected into THIS request so the downstream render
 * sees the fresh session immediately, and (b) set on the response so the browser
 * persists them. Returns null on failure (caller falls through to the page,
 * whose guard will redirect to login).
 *
 * NOTE: the API revokes the whole session family if a refresh token is reused.
 * We avoid concurrent refreshes by excluding prefetch requests in `config`
 * below. Revisit with a single-flight lock if protected pages start prefetching
 * each other heavily.
 */
async function refreshAdminSession(
  request: NextRequest,
): Promise<NextResponse | null> {
  const apiBase = process.env.FARMFLOW_API_URL
  if (!apiBase) return null

  const cookieHeader = request.cookies
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  let setCookies: string[]
  try {
    const res = await fetch(`${apiBase}/admin/auth/refresh`, {
      method: 'POST',
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null
    setCookies = res.headers.getSetCookie()
  } catch {
    return null
  }

  const parsed = setCookies
    .map(parseSetCookie)
    .filter((c): c is NonNullable<typeof c> => c !== null)
  if (parsed.length === 0) return null

  // (a) Make the rotated cookies visible to this request's render.
  const cookieMap = new Map(
    request.cookies.getAll().map((c) => [c.name, c.value] as const),
  )
  for (const c of parsed) cookieMap.set(c.name, c.value)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    'cookie',
    [...cookieMap].map(([k, v]) => `${k}=${v}`).join('; '),
  )

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // (b) Persist the rotated cookies on the browser.
  for (const c of parsed) {
    response.cookies.set(c.name, c.value, sessionCookieOptions(c.maxAge))
  }

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      // Skip prefetch requests so we never fire concurrent token refreshes.
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
