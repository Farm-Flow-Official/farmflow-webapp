'use client'

import { useCallback, useSyncExternalStore } from 'react'

/** Listeners per key, so two components sharing a key stay in step. */
const listeners = new Map<string, Set<() => void>>()

/**
 * Cached parse per key.
 *
 * `useSyncExternalStore` compares snapshots by identity, so parsing on every
 * call would return a fresh array each time and loop forever. The cache is
 * invalidated by writes and by `storage` events from other tabs.
 */
const cache = new Map<string, { raw: string | null; value: string[] }>()

const EMPTY: string[] = []

function read(key: string): string[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(key)
  } catch {
    // Private browsing can refuse reads outright.
    return EMPTY
  }

  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value

  let value: string[] = EMPTY
  try {
    const parsed = JSON.parse(raw ?? '[]')
    if (Array.isArray(parsed)) value = parsed as string[]
  } catch {
    // A corrupt entry reads as empty rather than throwing during render.
  }

  cache.set(key, { raw, value })
  return value
}

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l())
}

/**
 * A list of ids persisted in localStorage — "announcements I have seen",
 * "banners I dismissed".
 *
 * Uses `useSyncExternalStore` rather than an effect because localStorage *is* an
 * external store, and it genuinely differs between server and client: the server
 * snapshot is empty, the client's is whatever the device remembers. That is the
 * exact shape this hook exists for, and it avoids the setState-in-effect that a
 * naive `useEffect` read needs.
 *
 * Deliberately not in the database: "have I read this" is a per-device
 * convenience, and giving it a table would mean a write on every dropdown open
 * for something nobody audits.
 */
export function useStoredIds(key: string): [string[], (ids: string[]) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const set = listeners.get(key) ?? new Set()
      set.add(onChange)
      listeners.set(key, set)

      // Another tab writing the same key should update this one too.
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          cache.delete(key)
          onChange()
        }
      }
      window.addEventListener('storage', onStorage)

      return () => {
        set.delete(onChange)
        window.removeEventListener('storage', onStorage)
      }
    },
    [key],
  )

  const ids = useSyncExternalStore(
    subscribe,
    () => read(key),
    // Server snapshot: nothing is known to be seen, which errs toward showing
    // the notice rather than hiding one the reader has not actually read.
    () => EMPTY,
  )

  const write = useCallback(
    (next: string[]) => {
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Refused writes cost persistence, not the interaction — the notice
        // simply reappears next load, which is the safe direction to fail in.
      }
      cache.delete(key)
      emit(key)
    },
    [key],
  )

  return [ids, write]
}
