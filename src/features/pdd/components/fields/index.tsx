'use client'

import { useFormContext, type FieldValues, type Path } from 'react-hook-form'
import { FieldShell, inputClass, useFieldError, type BaseFieldProps } from './Field'

/**
 * The PDD wizard's input kit.
 *
 * Each step stays hand-written JSX composed from these — declarative enough for
 * ~120 fields, but never so abstract that a step's layout has to fight a
 * renderer. Every control registers with the surrounding `FormProvider`.
 */

export function TextField<T extends FieldValues>({
  name,
  label,
  required,
  hint,
  placeholder,
  disabled,
}: BaseFieldProps<T>) {
  const { register } = useFormContext<T>()
  const error = useFieldError<T>(name)

  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error}>
      <input
        id={name}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`h-10 ${inputClass(Boolean(error))} disabled:bg-sunken disabled:text-ink-muted`}
        {...register(name)}
      />
    </FieldShell>
  )
}

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  required,
  hint,
  placeholder,
  rows = 4,
}: BaseFieldProps<T> & { rows?: number }) {
  const { register } = useFormContext<T>()
  const error = useFieldError<T>(name)

  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error}>
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`resize-y py-2 ${inputClass(Boolean(error))}`}
        {...register(name)}
      />
    </FieldShell>
  )
}

export function NumberField<T extends FieldValues>({
  name,
  label,
  required,
  hint,
  placeholder,
  unit,
  min,
  step,
}: BaseFieldProps<T> & { unit?: string; min?: number; step?: number }) {
  const { register } = useFormContext<T>()
  const error = useFieldError<T>(name)

  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error}>
      <div className="relative">
        <input
          id={name}
          type="number"
          min={min}
          step={step ?? 'any'}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`h-10 ${inputClass(Boolean(error))} ${unit ? 'pr-16' : ''}`}
          // An empty numeric input is "not answered yet", not 0 — a draft is
          // half-filled by design, and 0 tCO₂e would be a claim.
          {...register(name, { setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)) })}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
            {unit}
          </span>
        )}
      </div>
    </FieldShell>
  )
}

export function DateField<T extends FieldValues>({
  name,
  label,
  required,
  hint,
  disabled,
}: BaseFieldProps<T>) {
  const { register } = useFormContext<T>()
  const error = useFieldError<T>(name)

  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error}>
      <input
        id={name}
        type="date"
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`h-10 ${inputClass(Boolean(error))} disabled:bg-sunken disabled:text-ink-muted`}
        {...register(name)}
      />
    </FieldShell>
  )
}

export type Option = { value: string; label: string; hint?: string }

export function SelectField<T extends FieldValues>({
  name,
  label,
  required,
  hint,
  options,
  placeholder = 'เลือก…',
  disabled,
}: BaseFieldProps<T> & { options: Option[] }) {
  const { register } = useFormContext<T>()
  const error = useFieldError<T>(name)

  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error}>
      <select
        id={name}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`h-10 ${inputClass(Boolean(error))} disabled:bg-sunken disabled:text-ink-muted`}
        {...register(name)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

/**
 * Radio group. Rendered as cards rather than bare radios because these choices
 * (crediting period, additionality) carry consequences the user should read
 * before picking, not decode from a one-word label.
 */
export function RadioField<T extends FieldValues>({
  name,
  label,
  required,
  hint,
  options,
}: BaseFieldProps<T> & { options: Option[] }) {
  const { register, watch } = useFormContext<T>()
  const error = useFieldError<T>(name)
  const current = watch(name)

  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error}>
      <div role="radiogroup" aria-labelledby={name} className="flex flex-col gap-2 sm:flex-row">
        {options.map((o) => {
          const active = String(current) === o.value
          return (
            <label
              key={o.value}
              className={`flex flex-1 cursor-pointer items-start gap-2.5 rounded-lg border px-3.5 py-3 transition-colors focus-within:ring-2 focus-within:ring-primary ${
                active ? 'border-primary bg-primary/5' : 'border-line bg-panel hover:bg-surface'
              }`}
            >
              <input
                type="radio"
                value={o.value}
                className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                {...register(name)}
              />
              <span className="flex flex-col">
                <span className={`text-sm ${active ? 'font-semibold text-ink' : 'text-ink'}`}>
                  {o.label}
                </span>
                {o.hint && <span className="mt-0.5 text-xs text-ink-muted">{o.hint}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </FieldShell>
  )
}

/** A read-only value the form does not own — e.g. a figure locked by the form itself. */
export function ReadOnlyField({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <div className="flex h-10 items-center rounded-lg border border-line bg-sunken px-3 text-sm text-ink-secondary">
        {value}
      </div>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

/** Groups related fields under a numbered heading matching the official form. */
export function FieldGroup({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
}

export type { Path, FieldValues }
