import { cache } from 'react'
import { cookies } from 'next/headers'
import type { AdminProfile } from '@/features/auth/types'
import {
  parseSetCookie,
  sessionCookieOptions,
} from '@/features/auth/services/sessionCookies'

type CookieStore = Awaited<ReturnType<typeof cookies>>

/**
 * Re-issues the API's session cookies onto our own response so the browser
 * stores them scoped to this app. We apply our own sane attributes rather than
 * copying the upstream ones (which may set an API-specific Path/Domain/Secure).
 */
export function relaySetCookies(store: CookieStore, setCookies: string[]): void {
  for (const raw of setCookies) {
    const parsed = parseSetCookie(raw)
    if (!parsed) continue

    store.set(parsed.name, parsed.value, sessionCookieOptions(parsed.maxAge))
  }
}

/** Builds a `Cookie` request header from all cookies the browser sent us. */
async function forwardCookieHeader(): Promise<string> {
  const store = await cookies()
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
}

/**
 * Resolves the currently authenticated admin by calling the API's
 * `/admin/auth/me` with the forwarded session cookies. Returns `null` when the
 * session is missing or invalid. Memoised per-request via React `cache`.
 */
export const getAdminSession = cache(async (): Promise<AdminProfile | null> => {
  const apiBase = process.env.FARMFLOW_API_URL
  if (!apiBase) return null

  const cookieHeader = await forwardCookieHeader()
  if (!cookieHeader) return null

  try {
    const res = await fetch(`${apiBase}/admin/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null

    const json = (await res.json()) as { data?: AdminProfile }
    return json.data ?? null
  } catch {
    return null
  }
})

/**
 * Revokes the session server-side, then clears every cookie the browser holds
 * for this app (we don't know the API's exact session cookie names, so we clear
 * all — this app stores nothing else).
 */
export async function signOutAdminSession(): Promise<void> {
  const apiBase = process.env.FARMFLOW_API_URL
  const store = await cookies()
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  if (apiBase && cookieHeader) {
    try {
      await fetch(`${apiBase}/admin/auth/sign-out`, {
        method: 'POST',
        headers: { cookie: cookieHeader },
        cache: 'no-store',
      })
    } catch {
      // Even if the API call fails, still clear local cookies below.
    }
  }

  for (const c of store.getAll()) {
    store.delete(c.name)
  }
}
