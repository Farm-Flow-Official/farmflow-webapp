import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Props = {
  href: string
  label: string
  desc: string
  Icon: IconType
}

/**
 * Navigable shortcut card. Subtle hover lift + chevron nudge, visible
 * focus ring for keyboard users.
 */
export function QuickLinkCard({ href, label, desc, Icon }: Props) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-line bg-panel p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle transition-colors group-hover:bg-primary/10">
        <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="truncate text-xs text-ink-secondary">{desc}</p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        strokeWidth={1.75}
      />
    </Link>
  )
}
