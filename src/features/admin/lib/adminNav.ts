import {
  Bell,
  LayoutDashboard,
  Users,
  Sprout,
  FolderTree,
  // Aliased: the bare name would shadow the global `Map` used by the duplicate
  // -key check at the bottom of this file.
  Map as MapIcon,
  Megaphone,
  LifeBuoy,
  Settings,
  ScrollText,
  TreePine,
  UserCog,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

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
export type NavItem = {
  href: string
  label: string
  icon: IconType
  key: string
  permission?: string
}
export type NavSection = { heading: string; items: NavItem[] }

/**
 * The admin console's menu — and the single source of truth for its `g`
 * shortcuts.
 *
 * This list used to live in `sidebar-nav.tsx`, with a second hand-written copy
 * in `AdminKeyboardNav` deciding what the keys actually did and a third in the
 * guide telling people what to press. Adding a menu meant editing three files,
 * and four shortcuts had already drifted: `g q` and `g n` were painted on the
 * sidebar but bound to nothing, `g u` was claimed twice so Farmer Users landed
 * on Admin Users, and `g e` worked but appeared in neither the hint nor the
 * guide. Everything now derives from here, so that class of bug is unreachable.
 *
 * Deliberately not a `'use client'` module: the guide's content is pulled in on
 * the server, and a constant exported from a client module arrives there as
 * `undefined` — silently, with nothing for `tsc` to catch.
 */
export const ADMIN_NAV: NavSection[] = [
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
        // `C` for account, because `U` belongs to Admin Users — that pairing is
        // in the guide and in people's fingers, so this is the side that moves.
        key: 'C',
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
    items: [{ href: '/admin/gis', label: 'GIS Map', icon: MapIcon, key: 'M', permission: 'gis:read' }],
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
        href: '/admin/species',
        label: 'ชนิดพันธุ์ไม้',
        icon: TreePine,
        key: 'E',
        // Reading is open to anyone who can see system settings; changing the
        // coefficients needs species:write, which the API enforces.
        permission: 'settings:read',
      },
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

/** Every menu entry, flattened — the shortcut layer and the guide read this. */
export const ADMIN_DESTINATIONS: NavItem[] = ADMIN_NAV.flatMap((s) => s.items)

/**
 * Can this admin reach the entry? Undefined permissions means "not loaded"
 * rather than "none" — an empty sidebar during that window would look broken,
 * so fall back to showing everything and let the server refuse what the role
 * cannot reach.
 */
export function navItemAllowed(item: NavItem, permissions?: string[]): boolean {
  return !item.permission || !permissions || permissions.includes(item.permission)
}

// A duplicate key silently steals a destination — `g u` pointed at two menus for
// weeks. Fail loudly the moment it is introduced rather than in a bug report.
if (process.env.NODE_ENV !== 'production') {
  const seen = new Map<string, string>()
  for (const item of ADMIN_DESTINATIONS) {
    const clash = seen.get(item.key)
    if (clash) {
      throw new Error(
        `ADMIN_NAV: shortcut "${item.key}" is claimed by both ${clash} and ${item.href}`,
      )
    }
    seen.set(item.key, item.href)
  }
}
