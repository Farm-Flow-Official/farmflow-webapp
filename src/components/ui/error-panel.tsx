'use client'

import { useEffect } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'

/**
 * Last-resort boundary surface for an unhandled render error.
 *
 * Deliberately generic. Next.js redacts server-component error messages in
 * production — this component receives a placeholder string and a `digest`, not
 * the real cause — so it cannot honestly tell a stale API from an expired
 * session. Pages that read the API diagnose their own failures server-side with
 * `describeApiFailure`, where the status still exists; this is what catches
 * everything those pages did not expect.
 *
 * It still earns its place: it replaces a blank "Application error" with a
 * retry, and with the digest that finds the real stack in the deploy's logs.
 */
export function ErrorPanel({
  error,
  reset,
  what,
}: {
  error: Error & { digest?: string }
  reset: () => void
  what: string
}) {
  useEffect(() => {
    console.error(`[${what}]`, error.message, error.digest ? `digest=${error.digest}` : '')
  }, [error, what])

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-error-border bg-panel px-6 py-16 text-center">
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error">
          <TriangleAlert className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <p className="text-sm font-semibold text-ink">เปิด{what}ไม่ได้</p>
        <p className="max-w-md text-[13px] leading-relaxed text-ink-muted">
          เกิดข้อผิดพลาดที่ไม่คาดคิด ลองใหม่อีกครั้ง — ถ้ายังไม่หาย ให้ส่งรหัสอ้างอิงด้านล่างให้ทีมพัฒนา
          เพื่อค้นหาสาเหตุจาก log ของ deploy
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          ลองใหม่
        </button>

        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-ink-disabled">
            รหัสอ้างอิง: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
