import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * The way out of a door you did not mean to open.
 *
 * A `<Link>` to the chooser rather than `router.back()` on purpose: history-back
 * depends on how you arrived, so from a bookmark or a pasted URL it throws you
 * out of the app entirely. This always lands in the same place, which is what
 * makes it safe to press when you are already lost.
 *
 * The label names the destination instead of the direction — "back" is only
 * meaningful if you remember where you came from. It is overridable because the
 * public certificate check is reached by scanning a printed QR: that visitor has
 * no account and no business in any portal, so offering them "another portal"
 * would point at login screens they cannot pass.
 */
export function BackToPortals({
  label = 'เลือกพอร์ทัลอื่น',
  className = '',
}: {
  label?: string
  className?: string
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      {label}
    </Link>
  )
}
