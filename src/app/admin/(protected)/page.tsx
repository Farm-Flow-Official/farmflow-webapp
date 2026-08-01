import type { Metadata } from 'next'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchAdminSummary } from '@/features/dashboard/services/fetchAdminSummary'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { CarbonHeroCard } from '@/features/dashboard/components/CarbonHeroCard'
import { QuickLinkCard } from '@/features/dashboard/components/QuickLinkCard'
import {
  Users,
  Sprout,
  Boxes,
  AlertTriangle,
  Map,
  Megaphone,
  Settings,
  Headphones,
  FolderTree,
  ScrollText,
  UserCog,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard — FarmFlow Admin',
}

/**
 * Quick Access mirrors the sidebar's daily-use menus (ADMIN-DASH-04).
 *
 * Projects, Audit Log and Admin Users were missing, which made the panel look
 * like a partial list rather than a shortcut set — and Projects in particular is
 * where most admin work now starts.
 */
const QUICK_LINKS = [
  {
    href: '/admin/projects',
    label: 'Projects',
    desc: 'จัดการโครงการ T-VER และเอกสาร PDD',
    Icon: FolderTree,
  },
  {
    href: '/admin/farmers',
    label: 'Farmer Management',
    desc: 'ดูและจัดการบัญชีเกษตรกรทั้งหมด',
    Icon: Users,
  },
  {
    href: '/admin/farms',
    label: 'คิวอนุมัติแปลง',
    desc: 'อนุมัติ / ไม่อนุมัติแปลงที่ขึ้นทะเบียนใหม่',
    Icon: Sprout,
  },
  {
    href: '/admin/gis',
    label: 'GIS Map',
    desc: 'ตรวจขอบเขตแปลงและพื้นที่ทับซ้อน',
    Icon: Map,
  },
  {
    href: '/admin/announcements',
    label: 'Announcements',
    desc: 'สร้างและเผยแพร่ประกาศถึงผู้ใช้',
    Icon: Megaphone,
  },
  {
    href: '/admin/settings',
    label: 'System Settings',
    desc: 'ตั้งราคาคาร์บอนและเปิด/ปิดแดชบอร์ด',
    Icon: Settings,
  },
  {
    href: '/admin/audit-log',
    label: 'Audit Log',
    desc: 'ประวัติการกระทำของผู้ดูแลทุกคน',
    Icon: ScrollText,
  },
  {
    href: '/admin/admin-users',
    label: 'Admin Users',
    desc: 'จัดการบัญชีผู้ดูแลและสิทธิ์การเข้าถึง',
    Icon: UserCog,
  },
  {
    href: '/admin/support',
    label: 'Support Tickets',
    desc: 'ช่องทางรับเรื่องจากเกษตรกรผ่าน LINE OA',
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

  // Share of farms currently flagged for GIS overlap review — a real ratio, not a trend.
  const overlapPct =
    summary.totalFarms > 0
      ? Math.round((summary.overlapFlaggedFarms / summary.totalFarms) * 100)
      : 0

  const kpiCards = [
    {
      label: 'Active Farmers',
      value: summary.activeFarmers.toLocaleString('en-US'),
      sublabel: 'registered accounts',
      alert: false,
      Icon: Users,
      accentClass: 'bg-info-bg text-info',
    },
    {
      label: 'Total Farms',
      value: summary.totalFarms.toLocaleString('en-US'),
      sublabel: 'registered plots',
      alert: false,
      Icon: Sprout,
      accentClass: 'bg-primary-subtle text-primary',
    },
    {
      label: 'Pending Sessions',
      value: String(summary.pendingSessionCount),
      sublabel: 'sessions awaiting processing',
      alert: summary.pendingSessionCount > 0,
      Icon: Boxes,
      accentClass: 'bg-warning-bg text-warning',
    },
    {
      label: 'Overlap Flags',
      value: String(summary.overlapFlaggedFarms),
      sublabel: 'farms pending GIS review',
      alert: summary.overlapFlaggedFarms > 0,
      Icon: AlertTriangle,
      accentClass: 'bg-error-bg text-error',
      foot: (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full rounded-full"
              style={{ width: `${overlapPct}%`, backgroundColor: '#F59E0B' }}
            />
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">
            {overlapPct}% ของ {summary.totalFarms.toLocaleString('en-US')} แปลง
          </p>
        </div>
      ),
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

      {/* Headline carbon hero */}
      <div className="mb-6 animate-fade-up">
        <CarbonHeroCard
          totalCarbonKgco2e={summary.totalCarbonKgco2e}
          marketPriceThb={summary.marketPriceThb}
        />
      </div>

      {/* KPI overview */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Overview
        </h2>
        {/* `items-stretch` + `h-full` on the wrapper: the animation div was
            shrink-wrapping each card, so the grid's equal-height rows never
            reached the card itself (ADMIN-DASH-01). */}
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, i) => (
            <div
              key={card.label}
              className="h-full animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
            >
              <KpiCard {...card} />
            </div>
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
