'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Boxes, QrCode, ExternalLink, BookOpen } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Kbd } from '@/components/ui/kbd'
import { useGuide } from '@/components/ui/guide-book'
import { LinkNavProgress } from '@/components/ui/nav-progress'

type IconType = ComponentType<SVGProps<SVGSVGElement>>
type NavItem = { href: string; label: string; icon: IconType; newTab?: boolean }
type NavSection = { heading: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ href: '/verifier', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    heading: 'Verification',
    items: [{ href: '/verifier/batches', label: 'Batch Queue', icon: Boxes }],
  },
  {
    heading: 'Tools',
    // Public, shell-less page → open in a new tab so the portal stays put.
    items: [
      { href: '/verifier/verify/qr-check', label: 'QR Verify', icon: QrCode, newTab: true },
    ],
  },
]

type Props = {
  open?: boolean
  onNavigate?: () => void
}

export function VerifierSidebar({ open = false, onNavigate }: Props) {
  const pathname = usePathname()
  const guide = useGuide()

  const isActive = (href: string) =>
    href === '/verifier' ? pathname === '/verifier' : pathname.startsWith(href)

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-40 flex w-60 flex-col border-r border-line bg-panel shadow-xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.heading} className="mb-1.5">
            <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {section.heading}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  target={item.newTab ? '_blank' : undefined}
                  rel={item.newTab ? 'noopener noreferrer' : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`mb-0.5 flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                    active
                      ? 'bg-primary-subtle font-semibold text-primary'
                      : 'font-medium text-ink-secondary hover:bg-surface hover:text-ink'
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-primary' : 'text-ink-muted'}`}
                    strokeWidth={1.75}
                  />
                  {item.label}
                  {item.newTab ? (
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
                  ) : (
                    <LinkNavProgress />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Help sits at the foot of the nav — out of the daily path, but in the
          place users have learned to look for it. */}
      <div className="border-t border-line px-3 py-3">
        <button
          type="button"
          onClick={() => {
            guide.open()
            onNavigate?.()
          }}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          <BookOpen className="h-[18px] w-[18px] shrink-0 text-ink-muted" strokeWidth={1.75} />
          คู่มือผู้ตรวจสอบ
          <Kbd className="ml-auto">?</Kbd>
        </button>
        <p className="px-3 pt-2 text-[11px] text-ink-muted">FarmFlow Verifier v1.0</p>
      </div>
    </aside>
  )
}
