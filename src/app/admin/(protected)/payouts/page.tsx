import type { Metadata } from 'next'
import { fetchPayouts } from '@/features/payouts/services/fetchPayouts'
import { PayoutTable } from '@/features/payouts/components/PayoutTable'

export const metadata: Metadata = {
  title: 'Payout Queue — FarmFlow Admin',
}

export default async function PayoutsPage() {
  const payouts = await fetchPayouts()
  const pendingCount = payouts.filter((p) => p.status === 'Pending').length

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Payout Queue
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          คำขอถอนเงินจากเกษตรกร ·{' '}
          <span className="font-medium text-ink">{payouts.length}</span> รายการ ·{' '}
          <span className="font-medium text-warning">{pendingCount}</span> รอดำเนินการ
        </p>
      </header>

      <PayoutTable payouts={payouts} />
    </div>
  )
}
