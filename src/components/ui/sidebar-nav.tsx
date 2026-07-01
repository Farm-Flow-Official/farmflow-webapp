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
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type NavItem = { href: string; label: string; icon: IconType }
type NavSection = { heading: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    heading: 'Farmers',
    items: [{ href: '/admin/farmers', label: 'Farmer Management', icon: Users }],
  },
  {
    heading: 'Verification',
    items: [{ href: '/admin/gis', label: 'GIS Map', icon: Map }],
  },
  {
    heading: 'Content',
    items: [{ href: '/admin/announcements', label: 'Announcements', icon: Megaphone }],
  },
  {
    heading: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
      { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
      { href: '/admin/admin-users', label: 'Admin Users', icon: UserCog },
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

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

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
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-4 py-4">
        <p className="text-[11px] text-ink-muted">FarmFlow Admin v1.0</p>
      </div>
    </aside>
  )
}
