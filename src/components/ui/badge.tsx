import type { ReactNode } from 'react'

export type BadgeVariant =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'info'
  | 'neutral'

const VARIANTS: Record<BadgeVariant, { box: string; dot: string }> = {
  verified: { box: 'bg-success-bg text-success', dot: 'bg-success' },
  pending: { box: 'bg-warning-bg text-warning', dot: 'bg-warning' },
  rejected: { box: 'bg-error-bg text-error', dot: 'bg-error' },
  info: { box: 'bg-info-bg text-info', dot: 'bg-info' },
  neutral: { box: 'bg-sunken text-ink-secondary', dot: 'bg-ink-muted' },
}

type Props = {
  variant?: BadgeVariant
  /** Show a small leading status dot. */
  dot?: boolean
  children: ReactNode
}

/** Status pill. Never relies on colour alone — the label is always present. */
export function Badge({ variant = 'neutral', dot = false, children }: Props) {
  const v = VARIANTS[variant]
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded px-2.5 text-xs font-semibold tracking-wide ${v.box}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} aria-hidden />}
      {children}
    </span>
  )
}
