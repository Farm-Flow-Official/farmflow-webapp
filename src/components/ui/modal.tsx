'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Selector for tabbable elements used by the focus trap. */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

type Placement = 'center' | 'right'

type Props = {
  onClose: () => void
  /** id of the element labelling the dialog (for aria-labelledby). */
  labelledBy?: string
  /** Close when the backdrop is clicked. Disable for forms with unsaved input. */
  closeOnBackdrop?: boolean
  /** `right` docks the panel as a full-height drawer (reference material the
   *  user reads *beside* their work); `center` is the default dialog. */
  placement?: Placement
  /** Classes for the panel — controls width/padding/layout. */
  panelClassName?: string
  children: ReactNode
}

const PLACEMENTS: Record<Placement, { container: string; panel: string }> = {
  center: { container: 'items-center justify-center p-4', panel: 'rounded-2xl border' },
  right: {
    container: 'items-stretch justify-end',
    panel: 'h-full border-l animate-[drawer-in_0.18s_ease-out]',
  },
}

/**
 * Accessible modal primitive. Handles, in one place for every dialog in the app:
 * Escape to close, optional backdrop-click to close, body scroll lock, and full
 * focus management (move focus in on open, trap Tab within, restore focus to the
 * trigger on close). Render only while open — mount/unmount drives the lifecycle.
 */
export function Modal({
  onClose,
  labelledBy,
  closeOnBackdrop = true,
  placement = 'center',
  panelClassName = 'w-full max-w-sm p-6',
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const place = PLACEMENTS[placement]

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current

    // Lock background scroll.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move focus into the panel (first focusable, else the panel itself).
    const initial = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(initial ?? panel)?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return

      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (nodes.length === 0) {
        e.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    // Capture phase so the trap wins over other window keydown listeners.
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    // z-index sits above Leaflet's internal panes/controls (~700–1000) so map
    // tiles never cover a dialog (e.g. the V-04 mini-map vs the approve dialog).
    <div
      className={`fixed inset-0 z-[1100] flex ${place.container}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      // Suspends page-level keyboard shortcuts while a dialog is up (useHotkeys).
      data-modal-blocking
    >
      {closeOnBackdrop ? (
        <button
          type="button"
          aria-label="ปิด"
          tabIndex={-1}
          onClick={onClose}
          className="absolute inset-0 bg-ink/40"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-ink/40" />
      )}

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative border-line bg-panel shadow-xl focus:outline-none ${place.panel} ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  )
}
