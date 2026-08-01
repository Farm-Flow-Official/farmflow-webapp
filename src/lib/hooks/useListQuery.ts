'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/** The list controls every table shares (GLOBAL-03). */
export type ListQueryState = {
  q: string
  status: string
  sort: string
  dir: 'asc' | 'desc'
  page: number
}

/**
 * Keeps search / filter / sort / page in the URL rather than component state.
 *
 * Three things fall out of that which local state cannot give: the server
 * component re-runs the query (so filtering is genuinely server-side rather
 * than a slice of a fully-downloaded table), a filtered view can be linked to
 * and reloaded, and the back button steps through the user's own filtering.
 *
 * `pending` is true while the server component re-renders, so a table can dim
 * rather than appear frozen.
 */
export function useListQuery(defaults: Partial<ListQueryState> = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const state = useMemo<ListQueryState>(
    () => ({
      q: params.get('q') ?? defaults.q ?? '',
      status: params.get('status') ?? defaults.status ?? 'all',
      sort: params.get('sort') ?? defaults.sort ?? 'createdAt',
      dir: (params.get('dir') as 'asc' | 'desc') ?? defaults.dir ?? 'desc',
      page: Number(params.get('page') ?? defaults.page ?? 1),
    }),
    [params, defaults.q, defaults.status, defaults.sort, defaults.dir, defaults.page],
  )

  const update = useCallback(
    (patch: Partial<ListQueryState>) => {
      const next = new URLSearchParams(params.toString())

      for (const [key, value] of Object.entries(patch)) {
        // Empty search and the "all" filter are the default view — leaving them
        // out keeps the URL honest and shareable rather than full of noise.
        if (value === '' || value === 'all' || value == null) next.delete(key)
        else next.set(key, String(value))
      }

      // Any change to what is being *looked for* invalidates the page number:
      // staying on page 4 of a new, shorter result set shows an empty table.
      if (!('page' in patch)) next.delete('page')

      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false })
      })
    },
    [params, pathname, router],
  )

  return { ...state, update, pending }
}
