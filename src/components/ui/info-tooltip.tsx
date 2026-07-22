'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'

/**
 * Small "(i)" affordance that reveals a popover on hover, keyboard focus, or tap
 * (so it works on touch too). Closes on blur, Escape, or an outside click. Use
 * for methodology / provenance notes that shouldn't clutter the default view.
 */
export function InfoTooltip({
  children,
  label = 'ข้อมูลเพิ่มเติม',
  className = '',
}: {
  children: ReactNode
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span
      ref={ref}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-lg border border-line bg-panel p-3 text-left text-[12px] font-normal leading-relaxed text-ink-secondary shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  )
}
