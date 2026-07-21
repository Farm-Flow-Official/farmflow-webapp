'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Map,
  Megaphone,
  Settings,
  ScrollText,
  UserCog,
  BookOpen,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Kbd } from '@/components/ui/kbd'
import { useGuide } from '@/components/ui/guide-book'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

/** `key` is the second stroke of the `g` shortcut — kept next to the label so
 *  the sidebar teaches the shortcut instead of hiding it in the guide. */
type NavItem = { href: string; label: string; icon: IconType; key: string }
type NavSection = { heading: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, key: 'D' }],
  },
  {
    heading: 'Farmers',
    items: [{ href: '/admin/farmers', label: 'Farmer Management', icon: Users, key: 'F' }],
  },
  {
    heading: 'Verification',
    items: [{ href: '/admin/gis', label: 'GIS Map', icon: Map, key: 'M' }],
  },
  {
    heading: 'Content',
    items: [
      { href: '/admin/announcements', label: 'Announcements', icon: Megaphone, key: 'A' },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings, key: 'S' },
      { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText, key: 'L' },
      { href: '/admin/admin-users', label: 'Admin Users', icon: UserCog, key: 'U' },
    ],
  },
]

type Props = {
  /** Drawer open state on mobile (ignored at lg+ where the sidebar is fixed). */
  open?: boolean
  /** Called when a nav item is chosen — used to close the mobile drawer. */
  onNavigate?: () => void
}

export function AdminSidebar({ open = false, onNavigate }: Props) {
  const pathname = usePathname()
  const guide = useGuide()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-40 flex w-60 flex-col border-r border-line bg-panel shadow-xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Explains the key caps below — without it a lone "D" reads as a
            one-key shortcut, which it isn't. */}
        <p className="hidden px-3 pb-1 text-[10px] text-ink-muted lg:block">
          กด <Kbd>G</Kbd> แล้วตามด้วยตัวอักษรเพื่อข้ามเมนู
        </p>
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
                  title={`${item.label} · กด G แล้ว ${item.key}`}
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
                  <Kbd className="ml-auto hidden lg:inline-flex">{item.key}</Kbd>
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
          คู่มือผู้ดูแลระบบ
          <Kbd className="ml-auto">?</Kbd>
        </button>
        <p className="px-3 pt-2 text-[11px] text-ink-muted">FarmFlow Admin v1.0</p>
      </div>
    </aside>
  )
}
