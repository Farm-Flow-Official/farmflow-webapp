type Tone = 'default' | 'on-dark' | 'on-primary' | 'on-error'

/** Tone owns colour, so callers never have to out-specify the base classes. */
const TONES: Record<Tone, string> = {
  default: 'border-line bg-surface text-ink-muted',
  'on-dark': 'border-white/25 bg-white/15 text-white/90',
  'on-primary': 'border-white/30 bg-white/20 text-white',
  'on-error': 'border-error-border bg-error-bg/60 text-error',
}

/**
 * A key cap — renders the shortcut for an action next to it, so verifiers
 * discover the keyboard path without opening the help sheet (`?`).
 */
export function Kbd({
  children,
  tone = 'default',
  className = '',
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <kbd
      className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border px-1 font-mono text-[10px] font-semibold leading-none ${TONES[tone]} ${className}`}
    >
      {children}
    </kbd>
  )
}
