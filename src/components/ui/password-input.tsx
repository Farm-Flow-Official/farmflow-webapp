'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  id: string
  name: string
  autoComplete?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  /** Controlled value. Omit both to let the form read it by `name` on submit. */
  value?: string
  onChange?: (value: string) => void
  /**
   * Full class list for the input, replacing the default. The login screens
   * predate the design tokens and style their fields by hex, so they pass their
   * own; `pr-11` is appended either way to keep text clear of the toggle.
   */
  className?: string
  'aria-describedby'?: string
}

const DEFAULT_INPUT =
  'h-11 w-full rounded-lg border border-line bg-panel px-3.5 text-sm text-ink placeholder:text-ink-disabled transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

/**
 * Password field with a show/hide toggle (ADMIN-LOGIN-01).
 *
 * Typing a password you cannot see, on a form that only tells you it was wrong
 * after a round trip, is a bad way to find out you had caps lock on. The toggle
 * is a button rather than a checkbox so it stays out of the tab order between
 * the field and submit, and its `aria-label` states the resulting action rather
 * than the current state — screen readers announce "แสดงรหัสผ่าน", not "ซ่อน".
 */
export function PasswordInput({ className, value, onChange, ...props }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        {...(onChange
          ? { value: value ?? '', onChange: (e) => onChange(e.target.value) }
          : { defaultValue: value })}
        className={`${className ?? DEFAULT_INPUT} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
        aria-pressed={visible}
        // Never submits the form: a stray Enter while focused here would
        // otherwise toggle instead of signing in.
        tabIndex={-1}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" strokeWidth={1.9} />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={1.9} />
        )}
      </button>
    </div>
  )
}
