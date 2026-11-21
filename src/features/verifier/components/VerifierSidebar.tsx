'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  LayoutDashboard,
  Boxes,
  QrCode,
  ExternalLink,
  BookOpen,
  FolderTree,
  LifeBuoy,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { LINE_OA_URL } from '@/lib/constants/contact'
import { Kbd } from '@/components/ui/kbd'
import { useGuide } from '@/components/ui/guide-book'
import { LinkNavProgress } from '@/components/ui/nav-progress'

type IconType = ComponentType<SVGProps<SVGSVGElement>>
type NavItem = { href: string; label: string; icon: IconType; newTab?: boolean }
type NavSection = { heading: string; items: NavItem[] }

/**
 * Review links hang off the project the verifier is currently inside, so the
 * sidebar reads the active project out of the URL rather than holding it in
 * state — a stale switcher must never point the queue at another project.
 */
function navFor(projectId: string | null): NavSection[] {
  const projectSections: NavSection[] = projectId
    ? [
        {
          heading: 'Overview',
          items: [
            {
              href: `/verifier/projects/${projectId}`,
              label: 'Dashboard',
              icon: LayoutDashboard,
            },
          ],
        },
        {
          heading: 'Verification',
          items: [
            {
              href: `/verifier/projects/${projectId}/sessions`,
              label: 'Session Queue',
              icon: Boxes,
            },
          ],
        },
      ]
    : []

  return [
    {
      heading: 'Projects',
      items: [{ href: '/verifier', label: 'เลือกโครงการ', icon: FolderTree }],
    },
    ...projectSections,
    {
      heading: 'Tools',
      // Public, shell-less page → open in a new tab so the portal stays put.
      items: [
        // The bell holds the last eight; this is where the rest of them live.
        { href: '/verifier/notifications', label: 'การแจ้งเตือน', icon: Bell },
        { href: '/verifier/verify/qr-check', label: 'QR Verify', icon: QrCode, newTab: true },
        // VERIFIER-NAV-01 — external verifiers had no way to reach a human from
        // inside the portal, unlike Admin. Same LINE OA both portals use.
        { href: LINE_OA_URL, label: 'Help Desk', icon: LifeBuoy, newTab: true },
      ],
    },
  ]
}

type Props = {
  open?: boolean
  onNavigate?: () => void
}

export function VerifierSidebar({ open = false, onNavigate }: Props) {
  const pathname = usePathname()
  const guide = useGuide()

  // /verifier/projects/<id>[/...] — the segment after "projects".
  const projectId = pathname.match(/^\/verifier\/projects\/([^/]+)/)?.[1] ?? null
  const NAV = navFor(projectId)

  const isActive = (href: string) => {
    if (href === '/verifier') return pathname === '/verifier'
    // The project overview would otherwise stay lit while inside its own queue.
    if (projectId && href === `/verifier/projects/${projectId}`) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-40 flex w-60 flex-col bg-sidebar shadow-xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.heading} className="mb-1.5">
            <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-sidebar-ink-muted">
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
                  className={`mb-0.5 flex h-10 items-center gap-3 rounded-lg border-l-[3px] px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar ${
                    active
                      ? 'border-sidebar-indicator bg-sidebar-active font-semibold text-sidebar-indicator'
                      : 'border-transparent font-medium text-sidebar-ink hover:bg-sidebar-active/60 hover:text-sidebar-indicator'
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-sidebar-indicator' : 'text-sidebar-ink'}`}
                    strokeWidth={1.75}
                  />
                  {item.label}
                  {item.newTab ? (
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-sidebar-ink-muted" strokeWidth={1.75} />
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
      <div className="border-t border-sidebar-active px-3 py-3">
        <button
          type="button"
          onClick={() => {
            guide.open()
            onNavigate?.()
          }}
          className="flex h-10 w-full items-center gap-3 rounded-lg border-l-[3px] border-transparent px-3 text-sm font-medium text-sidebar-ink transition-colors hover:bg-sidebar-active/60 hover:text-sidebar-indicator focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar"
        >
          <BookOpen className="h-[18px] w-[18px] shrink-0 text-sidebar-ink" strokeWidth={1.75} />
          คู่มือผู้ตรวจสอบ
          <Kbd tone="on-dark" className="ml-auto">?</Kbd>
        </button>
        <p className="px-3 pt-2 text-[11px] text-sidebar-ink-muted">FarmFlow Verifier v1.0</p>
      </div>
    </aside>
  )
}
