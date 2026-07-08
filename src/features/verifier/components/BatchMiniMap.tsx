'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Eye, X } from 'lucide-react'

const Map = dynamic(() => import('@/features/verifier/components/LeafletMiniMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-ink-muted">
      โหลดแผนที่…
    </div>
  ),
})

type Props = {
  polygon: [number, number][]
  pin?: [number, number]
  pinColor?: string
  /**
   * Adds an "ขยาย" button over the locked thumbnail that opens a full, pan/zoom
   * enabled map in a modal. The inline map stays locked (iPad-safe) either way.
   */
  expandable?: boolean
}

export function BatchMiniMap({ polygon, pin, pinColor, expandable = false }: Props) {
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

  if (!expandable) {
    return <Map polygon={polygon} pin={pin} pinColor={pinColor} />
  }

  return (
    <div className="relative h-full w-full">
      <Map polygon={polygon} pin={pin} pinColor={pinColor} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute right-2 top-2 z-[1000] inline-flex items-center gap-1 rounded-lg border border-line bg-panel/90 px-2 py-1 text-[11px] font-medium text-ink-secondary shadow-sm backdrop-blur transition-colors hover:text-ink"
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.9} /> ขยาย
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1000] flex flex-col bg-ink/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="text-sm font-medium text-ink">
                แผนที่ฟาร์ม — ลากเพื่อเลื่อน · จีบนิ้วเพื่อซูม
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Map polygon={polygon} pin={pin} pinColor={pinColor} interactive />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
