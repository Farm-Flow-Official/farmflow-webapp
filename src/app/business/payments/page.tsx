import type { Metadata } from 'next'
import { Receipt } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export const metadata: Metadata = {
  title: 'Payments — FarmFlow Business',
}

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Payment Verification
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          ตรวจสอบสลิปการชำระเงินแพ็กเกจ (เงินขาเข้า) · อนุมัติพร้อมลงนาม หรือปฏิเสธ
        </p>
      </header>

      <ComingSoon
        icon={Receipt}
        title="Payment Verification รอ Backend API"
        description="ตรวจสลิปการชำระเงินแพ็กเกจ แล้วอนุมัติ/ปฏิเสธพร้อมลงนาม — ต้องมี endpoint payment-slips ฝั่งธุรกิจก่อนจึงจะแสดงข้อมูลจริงได้ (ไม่ใช้ mock)"
        requiredEndpoints={[
          'GET /api/v1/business/payment-slips',
          'POST /api/v1/business/payment-slips/{id}/approve',
          'POST /api/v1/business/payment-slips/{id}/reject',
        ]}
      />
    </div>
  )
}
