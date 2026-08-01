'use client'

import { useEffect, useRef } from 'react'

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>

/** Keys typed into a field must never trigger a shortcut. */
export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Physical-key fallback for `KeyboardEvent.key`. Verifiers work in Thai, and on
 * a Thai layout the A key reports `key: 'ฟ'` — matching `code` as well keeps
 * every letter shortcut working without switching layout back to English.
 */
function physicalKey(code: string): string | null {
  if (code.startsWith('Key')) return code.slice(3).toLowerCase()
  if (code === 'Slash') return '?'
  return null
}

/**
 * Is this keypress a candidate for a shortcut at all? Two guards keep shortcuts
 * from firing where they would surprise the user: anything typed into an
 * input/textarea/contenteditable, and any key pressed while a blocking dialog is
 * open (`Modal` marks itself `data-modal-blocking`). Combos with Ctrl/Cmd/Alt
 * are left to the browser.
 */
export function isHotkeyEvent(e: KeyboardEvent): boolean {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return false
  if (isTypingTarget(e.target)) return false
  return !document.querySelector('[data-modal-blocking]')
}

/** Resolves the handler for a keypress, applying the layout fallbacks. */
export function matchHotkey(
  e: KeyboardEvent,
  map: HotkeyMap,
): ((e: KeyboardEvent) => void) | undefined {
  const fallback = physicalKey(e.code)
  return map[e.key] ?? map[e.key.toLowerCase()] ?? (fallback ? map[fallback] : undefined)
}

/**
 * Window-level keyboard shortcuts for desktop (MacBook / PC) power use.
 *
 * Keys in `map` are matched against `KeyboardEvent.key`, case-insensitively for
 * letters (`'a'` also catches Shift+A) — so use `'ArrowLeft'`, `'j'`, `'?'`.
 * Letters and `?` also match the physical key, so they survive a Thai layout.
 * Handlers are read through a ref, so passing fresh closures every render does
 * not re-bind the listener.
 *
 * Two guards keep shortcuts from firing where they would surprise the user:
 * anything typed into an input/textarea/contenteditable, and any key pressed
 * while a blocking dialog is open (`Modal` marks itself `data-modal-blocking`).
 * Combos with Ctrl/Cmd/Alt are left to the browser.
 */
export function useHotkeys(map: HotkeyMap, { enabled = true }: { enabled?: boolean } = {}) {
  const mapRef = useRef(map)
  useEffect(() => {
    mapRef.current = map
  })

  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e: KeyboardEvent) {
      if (!isHotkeyEvent(e)) return
      const handler = matchHotkey(e, mapRef.current)
      if (!handler) return
      e.preventDefault()
      handler(e)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
