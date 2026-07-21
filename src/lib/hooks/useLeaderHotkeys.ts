'use client'

import { useEffect, useRef, useState } from 'react'
import { isHotkeyEvent, matchHotkey, type HotkeyMap } from '@/lib/hooks/useHotkeys'

/**
 * Two-stroke shortcuts: press the leader (`g`), then a second key (`f`) to act.
 *
 * The admin console is navigation-heavy — a dozen destinations, no linear flow —
 * so single letters would collide with page-level actions and be impossible to
 * remember. `g` + initial ("go to farmers") is the established idiom for this
 * shape of app, and it keeps every single letter free for the page itself.
 *
 * Returns whether the leader is armed, so the UI can show that the app is
 * waiting for a second key. Arming times out on its own — a leader pressed by
 * accident never leaves the keyboard in a strange mode.
 */
export function useLeaderHotkeys(
  leader: string,
  map: HotkeyMap,
  { timeoutMs = 1800 }: { timeoutMs?: number } = {},
): boolean {
  const [armed, setArmed] = useState(false)
  const mapRef = useRef(map)
  useEffect(() => {
    mapRef.current = map
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isHotkeyEvent(e)) return

      if (!armed) {
        if (matchHotkey(e, { [leader]: () => {} })) {
          e.preventDefault()
          setArmed(true)
        }
        return
      }

      // Armed: this keypress resolves the sequence either way.
      setArmed(false)
      if (e.key === 'Escape') return
      const handler = matchHotkey(e, mapRef.current)
      if (!handler) return
      e.preventDefault()
      handler(e)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [armed, leader])

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), timeoutMs)
    return () => clearTimeout(timer)
  }, [armed, timeoutMs])

  return armed
}
