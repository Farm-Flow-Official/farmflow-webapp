'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { PddDetail } from '@/features/pdd/types'

type SaveFn<T> = (values: T) => Promise<{ ok: true; data: PddDetail } | { ok: false; error: string }>

/**
 * Only what this hook actually uses. Typed structurally rather than as
 * `UseFormReturn<T>` so it doesn't have to track React Hook Form's generic
 * signature — every step passes a differently-shaped form and none of that
 * matters to a debounced save.
 */
type WatchableForm<T> = {
  watch: (callback: (values: unknown) => void) => { unsubscribe: () => void }
  getValues: () => T
}

/**
 * Autosave a wizard step.
 *
 * Debounced per step rather than per field: a Server Action round trip on every
 * keystroke would both hammer the server and make save ordering ambiguous. The
 * step also flushes when it unmounts, so switching steps never loses the last
 * few characters typed.
 */
export function useStepAutosave<T extends FieldValues>({
  form,
  save,
  editable,
  onDirtyChange,
  onSaved,
  onError,
  delayMs = 2000,
}: {
  form: WatchableForm<T>
  save: SaveFn<T>
  editable: boolean
  onDirtyChange: (dirty: boolean) => void
  onSaved: (pdd: PddDetail) => void
  onError: (message: string) => void
  delayMs?: number
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef<T | null>(null)
  const saving = useRef(false)
  const pending = useRef(false)

  // Held in a ref so the watch subscription below can be set up exactly once —
  // re-subscribing on every render would rebuild the debounce with it. Updated
  // in an effect, never during render.
  const callbacks = useRef({ save, onSaved, onError, onDirtyChange })
  useEffect(() => {
    callbacks.current = { save, onSaved, onError, onDirtyChange }
  }, [save, onSaved, onError, onDirtyChange])

  const flush = useCallback(async () => {
    // Coalesce: a save requested while another is in flight is folded into the
    // loop below rather than queueing a second round trip.
    if (saving.current) {
      pending.current = true
      return
    }

    saving.current = true
    try {
      do {
        pending.current = false
        const values = latest.current
        if (!values) break
        latest.current = null

        const res = await callbacks.current.save(values)
        if (res.ok) callbacks.current.onSaved(res.data)
        else callbacks.current.onError(res.error)
      } while (pending.current)
    } finally {
      saving.current = false
    }
  }, [])

  useEffect(() => {
    if (!editable) return

    const subscription = form.watch((values) => {
      latest.current = values as T
      callbacks.current.onDirtyChange(true)

      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => void flush(), delayMs)
    })

    return () => {
      subscription.unsubscribe()
      if (timer.current) clearTimeout(timer.current)
      // Leaving the step is an explicit save point — the user expects what they
      // typed to survive navigating away.
      void flush()
    }
  }, [form, editable, delayMs, flush])

  /** Save immediately, e.g. when the user marks the step complete. */
  const saveNow = useCallback(
    async (values: T) => {
      if (timer.current) clearTimeout(timer.current)
      latest.current = values
      await flush()
    },
    [flush],
  )

  return { saveNow }
}
