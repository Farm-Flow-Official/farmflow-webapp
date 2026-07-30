'use client'

import { useRouter } from 'next/navigation'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import type { ApiFailure } from '@/lib/api/describe-failure'

/**
 * The screen a page shows when its data could not be read.
 *
 * The words are computed on the server by `describeApiFailure`, because that is
 * the only place the real status still exists — see the note there. This
 * component only renders them and offers the retry.
 */
export function ApiFailurePanel({ title, detail, reference }: ApiFailure) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-error-border bg-panel px-6 py-16 text-center">
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error">
        <TriangleAlert className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="max-w-md text-[13px] leading-relaxed text-ink-muted">{detail}</p>

      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={2} />
        ลองใหม่
      </button>

      {reference && (
        <p className="mt-3 font-mono text-[11px] text-ink-disabled">{reference}</p>
      )}
    </div>
  )
}
