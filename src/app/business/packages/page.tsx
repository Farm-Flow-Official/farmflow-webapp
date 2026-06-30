import type { Metadata } from 'next'
import { Package } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export const metadata: Metadata = {
  title: 'Packages — FarmFlow Business',
}

export default function PackagesPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Package &amp; Subscription
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          จัดการแพ็กเกจและการสมัครสมาชิกของลูกค้า
        </p>
      </header>

      <ComingSoon
        icon={Package}
        title="Package & Subscription รอ Backend API"
        description="จัดการ tier แพ็กเกจ และดูการสมัครสมาชิกของลูกค้า — ต้องมี endpoint ฝั่งธุรกิจก่อนจึงจะแสดงข้อมูลจริงได้ (ไม่ใช้ mock)"
        requiredEndpoints={[
          'GET /api/v1/business/packages',
          'GET /api/v1/business/subscriptions',
          'PATCH /api/v1/business/subscriptions/{id}',
        ]}
      />
    </div>
  )
}
