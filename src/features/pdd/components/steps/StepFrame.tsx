'use client'

import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

/**
 * Wraps a step's fields with its completeness control.
 *
 * "Complete" is the author's own assertion, not a validation result — the form
 * is only truly checked at submit. Marking a step done is how they keep track
 * across weeks of work, so the toggle is theirs to set even mid-draft.
 */
export function StepFrame({
  complete,
  editable,
  onToggleComplete,
  children,
}: {
  complete: boolean
  editable: boolean
  onToggleComplete: (next: boolean) => void
  children: ReactNode
}) {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      {children}

      {editable && (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-panel px-5 py-4 shadow-sm">
          <span className="flex items-start gap-2.5">
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${complete ? 'text-success' : 'text-ink-disabled'}`}
              strokeWidth={2}
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">ทำขั้นตอนนี้เสร็จแล้ว</span>
              <span className="text-xs text-ink-muted">
                ใช้ติดตามความคืบหน้าเท่านั้น — ระบบจะตรวจความครบถ้วนจริงตอนกดส่ง
              </span>
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={complete}
            onClick={() => onToggleComplete(!complete)}
            className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              complete ? 'bg-success' : 'bg-ink-disabled'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                complete ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      )}
    </form>
  )
}
