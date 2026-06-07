import type { Metadata } from 'next'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { QuickLinkCard } from '@/features/dashboard/components/QuickLinkCard'
import {
  Users,
  Wallet,
  Leaf,
  AlertTriangle,
  TrendingUp,
  Map,
  Megaphone,
  Settings,
  Headphones,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard — FarmFlow Admin',
}

// Mock KPI data — wire to GET /admin/dashboard/summary when API is ready
const KPI = {
  activeFarmers: 124,
  pendingPayouts: 5,
  totalCarbonKgco2e: 42500,
  overlapFlaggedFarms: 3,
  marketPriceThb: 48.5,
}

const KPI_CARDS = [
  {
    label: 'Active Farmers',
    value: KPI.activeFarmers.toLocaleString('en-US'),
    sublabel: 'registered accounts',
    alert: false,
    Icon: Users,
  },
  {
    label: 'Pending Payouts',
    value: String(KPI.pendingPayouts),
    sublabel: 'withdrawal requests',
    alert: KPI.pendingPayouts > 0,
    Icon: Wallet,
  },
  {
    label: 'Carbon Issued',
    value: `${KPI.totalCarbonKgco2e.toLocaleString('en-US')} kgCO₂e`,
    sublabel: 'total credits issued',
    alert: false,
    Icon: Leaf,
  },
  {
    label: 'Overlap Flags',
    value: String(KPI.overlapFlaggedFarms),
    sublabel: 'farms pending GIS review',
    alert: KPI.overlapFlaggedFarms > 0,
    Icon: AlertTriangle,
  },
  {
    label: 'Market Price',
    value: `฿${KPI.marketPriceThb.toFixed(2)}`,
    sublabel: 'per kgCO₂e',
    alert: false,
    Icon: TrendingUp,
  },
]

const QUICK_LINKS = [
  {
    href: '/admin/farmers',
    label: 'Farmer Management',
    desc: 'View and manage all farmer accounts',
    Icon: Users,
  },
  {
    href: '/admin/gis',
    label: 'GIS Map',
    desc: 'Inspect farm polygons and overlap flags',
    Icon: Map,
  },
  {
    href: '/admin/payouts',
    label: 'Payout Queue',
    desc: 'Process farmer withdrawal requests',
    Icon: Wallet,
  },
  {
    href: '/admin/announcements',
    label: 'Announcements',
    desc: 'Create and publish news banners',
    Icon: Megaphone,
  },
  {
    href: '/admin/settings',
    label: 'System Settings',
    desc: 'Update market price and configuration',
    Icon: Settings,
  },
  {
    href: '/admin/support',
    label: 'Support Tickets',
    desc: 'Handle farmer support requests',
    Icon: Headphones,
  },
]

export default async function AdminDashboardPage() {
  const admin = await getAdminSession()
  if (!admin) return null

  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-[1440px] px-8 py-8">
      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          ยินดีต้อนรับ, <span className="font-medium text-ink">{admin.username}</span> — {today}
        </p>
      </header>

      {/* KPI overview */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {KPI_CARDS.map((card) => (
            <KpiCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* Quick access */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <QuickLinkCard key={link.href} {...link} />
          ))}
        </div>
      </section>
    </div>
  )
}
