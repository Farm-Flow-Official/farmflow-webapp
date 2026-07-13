'use client'

import { useEffect, useState } from 'react'
import { Eye, X } from 'lucide-react'

/**
 * "ดูเต็ม" affordance for a snapshot photo. Renders a small button that opens the
 * image full-screen (object-contain) so a verifier can inspect detail on iPad.
 * Close via the backdrop, the X button, or Escape. The button positions itself
 * absolutely, so mount it inside the photo's `relative` container.
 */
export function PhotoLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-md bg-ink/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur transition-colors hover:bg-ink/80"
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.9} /> ดูเต็ม
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
