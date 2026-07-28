'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, type ArrayPath, type FieldValues } from 'react-hook-form'

/**
 * A repeating block of fields (co-developers, methodologies, emission sources…).
 *
 * The PDD has eleven of these. Wrapping `useFieldArray` once means each step
 * declares what one row looks like and nothing else — no per-step add/remove
 * bookkeeping to get subtly wrong.
 */
export function RepeatableSection<T extends FieldValues>({
  name,
  itemLabel,
  addLabel,
  emptyHint,
  defaultItem,
  min = 0,
  children,
}: {
  name: ArrayPath<T>
  /** Heading for one row; receives the 1-based index. */
  itemLabel: (index: number) => string
  addLabel: string
  emptyHint?: string
  /** A blank row, so adding one never starts from undefined fields. */
  defaultItem: Record<string, unknown>
  /** Rows that cannot be removed — the form requires at least this many. */
  min?: number
  /** Renders one row's fields; `index` builds the dotted field paths. */
  children: (index: number) => React.ReactNode
}) {
  const { control } = useFormContext<T>()
  const { fields, append, remove } = useFieldArray<T>({ control, name })

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && emptyHint && (
        <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-5 text-center text-sm text-ink-muted">
          {emptyHint}
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {itemLabel(index + 1)}
            </p>
            {fields.length > min && (
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`ลบ${itemLabel(index + 1)}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4">{children(index)}</div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append(defaultItem as never)}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        {addLabel}
      </button>
    </div>
  )
}
