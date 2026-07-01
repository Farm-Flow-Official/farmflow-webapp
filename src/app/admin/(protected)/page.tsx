import type { Metadata } from 'next'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchAdminSummary } from '@/features/dashboard/services/fetchAdminSummary'
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
  const [admin, summary] = await Promise.all([
    getAdminSession(),
    fetchAdminSummary(),
  ])
  if (!admin) return null

  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const kpiCards = [
    {
      label: 'Active Farmers',
      value: summary.activeFarmers.toLocaleString('en-US'),
      sublabel: 'registered accounts',
      alert: false,
      Icon: Users,
    },
    {
      label: 'Pending Batches',
      value: String(summary.pendingBatchCount),
      sublabel: 'sessions awaiting processing',
      alert: summary.pendingBatchCount > 0,
      Icon: Wallet,
    },
    {
      label: 'Carbon Issued',
      value: `${summary.totalCarbonKgco2e.toLocaleString('en-US')} kgCO₂e`,
      sublabel: 'total credits issued',
      alert: false,
      Icon: Leaf,
    },
    {
      label: 'Overlap Flags',
      value: String(summary.overlapFlaggedFarms),
      sublabel: 'farms pending GIS review',
      alert: summary.overlapFlaggedFarms > 0,
      Icon: AlertTriangle,
    },
    {
      label: 'Market Price',
      value: summary.marketPriceThb != null ? `฿${summary.marketPriceThb.toFixed(2)}` : '—',
      sublabel: 'per kgCO₂e',
      alert: false,
      Icon: TrendingUp,
    },
  ]

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
          {kpiCards.map((card) => (
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
