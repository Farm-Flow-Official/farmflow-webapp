'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Receipt,
  Banknote,
  Image as ImageIcon,
  Contact,
  Megaphone,
  Cpu,
  Headphones,
  Users,
  ScrollText,
  Settings,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type NavItem = {
  href: string
  label: string
  icon: IconType
  /** Planned page not built yet — shown dimmed (roadmap) instead of linked. */
  disabled?: boolean
}
type NavSection = { heading: string; items: NavItem[] }

// Only Packages is built this round; the rest are shown dimmed so the mentor
// sees the full Business Dashboard map. Drop `disabled` as each page lands.
const NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [
      { href: '/business/overview', label: 'Overview', icon: LayoutDashboard, disabled: true },
    ],
  },
  {
    heading: 'Commerce',
    items: [
      { href: '/business/packages', label: 'Packages', icon: Package },
      { href: '/business/payments', label: 'Payments', icon: Receipt, disabled: true },
      { href: '/business/payouts', label: 'Payouts', icon: Banknote, disabled: true },
    ],
  },
  {
    heading: 'Growth',
    items: [
      { href: '/business/banners', label: 'Banners', icon: ImageIcon, disabled: true },
      { href: '/business/crm', label: 'CRM', icon: Contact, disabled: true },
      { href: '/business/campaigns', label: 'Campaigns', icon: Megaphone, disabled: true },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { href: '/business/iot', label: 'IoT HaaS', icon: Cpu, disabled: true },
      { href: '/business/support', label: 'Support', icon: Headphones, disabled: true },
    ],
  },
  {
    heading: 'Customers',
    items: [
      { href: '/business/customers', label: 'Customers', icon: Users, disabled: true },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/business/audit', label: 'Audit Log', icon: ScrollText, disabled: true },
      { href: '/business/settings', label: 'Settings', icon: Settings, disabled: true },
    ],
  },
]

type Props = {
  open?: boolean
  onNavigate?: () => void
}

export function BusinessSidebar({ open = false, onNavigate }: Props) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname.startsWith(href)

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
              const Icon = item.icon

              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    aria-disabled
                    title="เร็ว ๆ นี้"
                    className="mb-0.5 flex h-10 cursor-default items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-disabled"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-ink-disabled" strokeWidth={1.75} />
                    {item.label}
                    <span className="ml-auto rounded bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
                      Soon
                    </span>
                  </div>
                )
              }

              const active = isActive(item.href)
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
        <p className="text-[11px] text-ink-muted">FarmFlow Business v1.0</p>
      </div>
    </aside>
  )
}
