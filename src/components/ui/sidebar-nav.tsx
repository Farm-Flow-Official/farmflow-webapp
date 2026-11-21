'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'
import { useGuide } from '@/components/ui/guide-book'
import { LinkNavProgress } from '@/components/ui/nav-progress'
import { ADMIN_NAV, navItemAllowed } from '@/features/admin/lib/adminNav'

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

  const sections = ADMIN_NAV.map((s) => ({
    ...s,
    items: s.items.filter((item) => navItemAllowed(item, permissions)),
  })).filter((s) => s.items.length > 0)

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-40 flex w-60 flex-col bg-sidebar shadow-xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Explains the key caps below — without it a lone "D" reads as a
            one-key shortcut, which it isn't. */}
        <p className="hidden px-3 pb-1 text-[10px] text-sidebar-ink-muted lg:block">
          กด <Kbd tone="on-dark">G</Kbd> แล้วตามด้วยตัวอักษรเพื่อข้ามเมนู
        </p>
        {sections.map((section) => (
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
                  title={`${item.label} · กด G แล้ว ${item.key}`}
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
                  <Kbd tone="on-dark" className="ml-auto hidden lg:inline-flex">{item.key}</Kbd>
                  <LinkNavProgress />
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
          คู่มือผู้ดูแลระบบ
          <Kbd tone="on-dark" className="ml-auto">?</Kbd>
        </button>
        <p className="px-3 pt-2 text-[11px] text-sidebar-ink-muted">FarmFlow Admin v1.0</p>
      </div>
    </aside>
  )
}
