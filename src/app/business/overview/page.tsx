import type { Metadata } from 'next'
import { LayoutDashboard } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export const metadata: Metadata = {
  title: 'Overview — FarmFlow Business',
}

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Business Overview
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          ภาพรวมสุขภาพธุรกิจ — รายได้ MRR สัดส่วนแพ็กเกจ และคิวงาน
        </p>
      </header>

      <ComingSoon
        icon={LayoutDashboard}
        title="Business Overview รอ Backend API"
        description="หน้านี้สรุปรายได้ MRR สัดส่วนแพ็กเกจ และคิวงาน ซึ่งต้องรวบรวมจากข้อมูลฝั่งธุรกิจ (subscriptions, payment slips, payouts) ที่ API v3.0.3-1 ยังไม่ครอบคลุม — จะแสดงข้อมูลจริงทันทีเมื่อ endpoint พร้อม โดยไม่ใช้ mock"
        requiredEndpoints={[
          'GET /api/v1/business/overview',
          'GET /api/v1/business/subscriptions',
          'GET /api/v1/business/payment-slips',
        ]}
      />
    </div>
  )
}
