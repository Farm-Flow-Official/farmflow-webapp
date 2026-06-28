import { cache } from 'react'
import { cookies } from 'next/headers'
import { api } from '@/lib/api'
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

/**
 * Resolves the currently authenticated admin via `GET /admin/auth/me` (the typed
 * client forwards the session cookies). Returns `null` when the session is
 * missing or invalid. Memoised per-request via React `cache`.
 */
export const getAdminSession = cache(async (): Promise<AdminProfile | null> => {
  try {
    const { data } = await api.GET('/api/v1/admin/auth/me')
    return data?.success ? data.data : null
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
  try {
    await api.POST('/api/v1/admin/auth/sign-out')
  } catch {
    // Even if the API call fails, still clear local cookies below.
  }

  const store = await cookies()
  for (const c of store.getAll()) {
    store.delete(c.name)
  }
}
