'use client'

import { useId, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

type Tone = 'danger' | 'primary'

type Props = {
  title: string
  description?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  tone?: Tone
  /** Shows a pending state and blocks dismissal while an action is in flight. */
  pending?: boolean
  pendingLabel?: string
  onConfirm: () => void
  onClose: () => void
}

const TONES: Record<Tone, { chip: string; button: string }> = {
  danger: {
    chip: 'bg-error-bg text-error',
    button: 'bg-error hover:bg-error/90 focus-visible:ring-error',
  },
  primary: {
    chip: 'bg-primary-subtle text-primary',
    button: 'bg-primary hover:bg-primary-hover focus-visible:ring-primary',
  },
}

/**
 * Confirmation dialog built on the Modal primitive — gets focus trap, scroll
 * lock, Esc, and focus restore for free. Cancel is focused first so a stray
 * Enter never confirms a destructive action.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'ยกเลิก',
  tone = 'danger',
  pending = false,
  pendingLabel = 'กำลังดำเนินการ…',
  onConfirm,
  onClose,
}: Props) {
  const titleId = useId()
  const t = TONES[tone]

  return (
    <Modal
      onClose={() => {
        if (!pending) onClose()
      }}
      labelledBy={titleId}
      closeOnBackdrop={!pending}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${t.chip}`}>
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <h2 id={titleId} className="text-base font-semibold text-ink">
          {title}
        </h2>
      </div>
      {description && <p className="mb-5 text-sm text-ink-secondary">{description}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${t.button}`}
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
