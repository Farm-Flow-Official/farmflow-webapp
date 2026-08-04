import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, ShieldCheck, Briefcase, LayoutGrid, ArrowRight, QrCode } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { getAdminSession } from '@/features/auth/services/adminSession'

export const metadata: Metadata = {
  title: 'FarmFlow — เข้าสู่ระบบ',
}

const PORTALS = [
  {
    href: '/admin/login',
    icon: LayoutDashboard,
    title: 'Admin Dashboard',
    sub: 'สำหรับทีมภายใน',
    desc: 'จัดการเกษตรกร แปลงเพาะปลูก GIS ประกาศ และตั้งค่าระบบ',
    cta: 'เข้าสู่ระบบ',
  },
  {
    href: '/verifier/login',
    icon: ShieldCheck,
    title: 'Verifier Portal',
    sub: 'สำหรับผู้ตรวจรับรองภายนอก',
    desc: 'ตรวจรับรองข้อมูลคาร์บอน (MRV) อนุมัติ/ปฏิเสธชุดข้อมูล',
    cta: 'เข้าสู่ระบบ',
  },
  {
    href: '/business',
    icon: Briefcase,
    title: 'Business Dashboard',
    sub: 'สำหรับทีมธุรกิจ / การเงิน',
    desc: 'จัดการแพ็กเกจ ตรวจสลิป จ่ายเงินเกษตรกร และภาพรวมรายได้ (รอ backend API)',
    cta: 'ดูรายละเอียด',
  },
  {
    href: '/executive/login',
    icon: LayoutGrid,
    title: 'Executive Dashboard',
    sub: 'สำหรับผู้บริหาร (C-Level)',
    desc: 'ภาพรวม ESG — คาร์บอน เกษตรกร พื้นที่ และธรรมาภิบาลข้อมูล แยกดูรายโครงการได้',
    cta: 'เข้าสู่ระบบ',
  },
] as const

export default async function PortalLandingPage() {
  // Skip the chooser for an already-signed-in user. Verifier first (cookie-only,
  // no API call); anonymous visitors have no cookies, so neither check hits the API.
  if (await getVerifierSession()) redirect('/verifier')
  if (await getAdminSession()) redirect('/admin')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <div className="w-full max-w-5xl">
        {/* Brand */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Logo size={48} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary">FarmFlow</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              Carbon FinTech Platform · เลือกพอร์ทัลเพื่อเข้าสู่ระบบ
            </p>
          </div>
        </div>

        {/* Portal cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PORTALS.map((p) => {
            const Icon = p.icon
            return (
              <Link
                key={p.href}
                href={p.href}
                className="group flex flex-col rounded-2xl border border-line bg-panel p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h2 className="text-base font-semibold text-ink">{p.title}</h2>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  {p.sub}
                </p>
                <p className="mt-2 flex-1 text-[13px] text-ink-secondary">{p.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {p.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </span>
              </Link>
            )
          })}
        </div>

        {/*
          PORTAL-02 — this was a grey 12px link under the cards, and UAT users
          did not realise it was clickable at all. It is the platform's public
          anti-greenwashing check: the one door here that is *for* outsiders,
          who have no account and no reason to guess that small text is a
          button. Given its own card, on the brand green, so it reads as a
          destination rather than a footnote.
        */}
        <Link
          href="/verifier/verify/qr-check"
          className="group mt-6 flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary-subtle p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:flex-row sm:items-center"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <QrCode className="h-6 w-6" strokeWidth={1.9} />
          </span>

          <div className="flex-1">
            <h2 className="text-base font-semibold text-ink">ตรวจสอบเอกสารคาร์บอนเครดิต</h2>
            <p className="mt-1 text-[13px] text-ink-secondary">
              สแกน QR หรือกรอกรหัสเพื่อตรวจสอบว่าใบรับรองเป็นของจริง —{' '}
              <span className="font-medium text-primary">สาธารณะ ไม่ต้องเข้าสู่ระบบ</span>
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-primary-hover">
            ตรวจสอบเอกสาร
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </span>
        </Link>

        <p className="mt-6 text-center text-xs text-ink-muted">
          FarmFlow Carbon Platform
        </p>
      </div>
    </main>
  )
}
