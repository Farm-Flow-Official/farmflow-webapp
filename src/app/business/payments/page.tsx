import type { Metadata } from 'next'
import { getBusinessSession } from '@/features/business/auth/session'
import { fetchPaymentSlips } from '@/features/business/payments/services/fetchPaymentSlips'
import { PaymentsView } from '@/features/business/payments/components/PaymentsView'

export const metadata: Metadata = {
  title: 'Payments — FarmFlow Business',
}

export default async function PaymentsPage() {
  const [slips, session] = await Promise.all([
    fetchPaymentSlips(),
    getBusinessSession(),
  ])

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

      <PaymentsView slips={slips} reviewerName={session?.username ?? 'finance'} />
    </div>
  )
}
