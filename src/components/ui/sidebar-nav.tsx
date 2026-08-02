'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  LayoutDashboard,
  Users,
  Sprout,
  FolderTree,
  Map,
  Megaphone,
  LifeBuoy,
  Settings,
  ScrollText,
  UserCog,
  BookOpen,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Kbd } from '@/components/ui/kbd'
import { useGuide } from '@/components/ui/guide-book'
import { LinkNavProgress } from '@/components/ui/nav-progress'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

/**
 * `key` is the second stroke of the `g` shortcut — kept next to the label so
 * the sidebar teaches the shortcut instead of hiding it in the guide.
 *
 * `permission` is the API permission code the menu needs. The server already
 * refuses these routes without it (`requirePermission`); hiding the entry stops
 * the console advertising work a role cannot do (ADMIN-USERS-05). Items with no
 * `permission` are open to every signed-in admin.
 */
type NavItem = { href: string; label: string; icon: IconType; key: string; permission?: string }
type NavSection = { heading: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, key: 'D' }],
  },
  {
    heading: 'Projects',
    items: [
      {
        href: '/admin/projects',
        label: 'Projects',
        icon: FolderTree,
        key: 'P',
        permission: 'projects:read',
      },
    ],
  },
  {
    heading: 'Farmers',
    items: [
      {
        href: '/admin/farmer-users',
        label: 'Farmer Users',
        icon: UserCog,
        key: 'U',
        // Account repair, not land management — gated on the permission that
        // actually lets you change a password.
        permission: 'farmers:manage',
      },
      {
        href: '/admin/farmers',
        label: 'Farmer Management',
        icon: Users,
        key: 'F',
        permission: 'farmers:read',
      },
      {
        href: '/admin/farms',
        label: 'คิวอนุมัติแปลง',
        icon: Sprout,
        key: 'Q',
        permission: 'farmers:read',
      },
    ],
  },
  {
    heading: 'Verification',
    items: [{ href: '/admin/gis', label: 'GIS Map', icon: Map, key: 'M', permission: 'gis:read' }],
  },
  {
    heading: 'Content',
    items: [
      {
        href: '/admin/announcements',
        label: 'Announcements',
        icon: Megaphone,
        key: 'A',
        permission: 'announcements:read',
      },
      // The dashboard has always linked to Support Tickets; the sidebar never
      // did, so the page was reachable only by knowing it was there.
      { href: '/admin/support', label: 'Support Tickets', icon: LifeBuoy, key: 'T' },
      // The bell holds the last eight; this is where the rest of them live.
      { href: '/admin/notifications', label: 'การแจ้งเตือน', icon: Bell, key: 'N' },
    ],
  },
  {
    heading: 'System',
    items: [
      {
        href: '/admin/settings',
        label: 'Settings',
        icon: Settings,
        key: 'S',
        permission: 'settings:read',
      },
      {
        href: '/admin/audit-log',
        label: 'Audit Log',
        icon: ScrollText,
        key: 'L',
        permission: 'audit:read',
      },
      {
        href: '/admin/admin-users',
        label: 'Admin Users',
        icon: UserCog,
        key: 'U',
        permission: 'admins:manage',
      },
    ],
  },
]

type Props = {
  /** Drawer open state on mobile (ignored at lg+ where the sidebar is fixed). */
  open?: boolean
  /** Called when a nav item is chosen — used to close the mobile drawer. */
  onNavigate?: () => void
  /** The signed-in admin's permission codes, from `/admin/auth/me`. */
  permissions?: string[]
}

export function AdminSidebar({ open = false, onNavigate, permissions }: Props) {
  const pathname = usePathname()
  const guide = useGuide()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  // Undefined permissions means "not loaded" rather than "none" — showing an
  // empty sidebar during that window would look broken, so fall back to showing
  // everything and let the server refuse anything the role cannot reach.
  const allowed = (item: NavItem) =>
    !item.permission || !permissions || permissions.includes(item.permission)

  const sections = NAV.map((s) => ({ ...s, items: s.items.filter(allowed) })).filter(
    (s) => s.items.length > 0,
  )

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
        {sections.map((section) => (
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
                  <LinkNavProgress />
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
