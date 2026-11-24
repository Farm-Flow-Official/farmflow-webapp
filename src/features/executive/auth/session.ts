import { cache } from 'react'
import { api } from '@/lib/api'
import type { ExecutiveProfile } from '@/features/executive/auth/types'

/**
 * The current executive, via `GET /executive/auth/me` (the typed client
 * forwards the `executive_access` cookie). Null when the session is missing,
 * expired, or belongs to an account whose role has since changed. Memoised per
 * request via React `cache`.
 */
export const getExecutiveSession = cache(async (): Promise<ExecutiveProfile | null> => {
  try {
    const { data } = await api.GET('/api/v1/executive/auth/me')
    return data?.success ? data.data : null
  } catch {
    return null
  }
})
