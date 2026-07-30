'use client'

import type { ReactNode } from 'react'
import { useFormContext, type FieldValues, type Path } from 'react-hook-form'

/**
 * Shared chrome for every wizard input: label, required marker, hint, and the
 * error slot. Keeping it in one place is what lets ~120 PDD fields stay
 * declarative without each step re-deriving aria wiring.
 */

export const INPUT_BASE =
  'w-full rounded-lg border bg-panel px-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:outline-none focus:ring-2'
export const INPUT_OK = 'border-line focus:border-primary focus:ring-primary/15'
export const INPUT_ERR = 'border-error-border focus:border-error focus:ring-error/15'

export function inputClass(hasError: boolean): string {
  return `${INPUT_BASE} ${hasError ? INPUT_ERR : INPUT_OK}`
}

type FieldShellProps = {
  name: string
  label: string
  required?: boolean
  hint?: ReactNode
  error?: string
  children: ReactNode
}

export function FieldShell({ name, label, required, hint, error, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-error">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  )
}

/**
 * The message for one field, or undefined. React Hook Form nests errors by path
 * segment, so a dotted name (`contacts.0.email`) has to be walked.
 */
export function useFieldError<T extends FieldValues>(name: Path<T>): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<T>()

  const node = name
    .split('.')
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], errors)

  const message = (node as { message?: unknown } | undefined)?.message
  return typeof message === 'string' ? message : undefined
}

/** Props every concrete field shares. */
export type BaseFieldProps<T extends FieldValues> = {
  name: Path<T>
  label: string
  required?: boolean
  hint?: ReactNode
  placeholder?: string
  disabled?: boolean
}
