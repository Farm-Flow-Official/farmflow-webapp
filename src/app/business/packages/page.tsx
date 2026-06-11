import type { Metadata } from 'next'
import { fetchPackages } from '@/features/business/packages/services/fetchPackages'
import { fetchSubscriptions } from '@/features/business/packages/services/fetchSubscriptions'
import { PackagesView } from '@/features/business/packages/components/PackagesView'

export const metadata: Metadata = {
  title: 'Packages — FarmFlow Business',
}

export default async function PackagesPage() {
  const [packages, subscriptions] = await Promise.all([
    fetchPackages(),
    fetchSubscriptions(),
  ])

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Package &amp; Subscription
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          จัดการแพ็กเกจและการสมัครสมาชิกของลูกค้า ·{' '}
          <span className="font-medium text-ink">{subscriptions.length}</span> ราย
        </p>
      </header>

      <PackagesView packages={packages} subscriptions={subscriptions} />
    </div>
  )
}
