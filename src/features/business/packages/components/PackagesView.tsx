'use client'

import { useState } from 'react'
import { LayoutGrid, Users } from 'lucide-react'
import type {
  CustomerSubscription,
  Package,
} from '@/features/business/packages/types'
import { TierCatalog } from '@/features/business/packages/components/TierCatalog'
import { SubscriptionTable } from '@/features/business/packages/components/SubscriptionTable'

type Tab = 'catalog' | 'customers'

const TABS: { value: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'catalog', label: 'แพ็กเกจ', icon: LayoutGrid },
  { value: 'customers', label: 'ลูกค้า', icon: Users },
]

export function PackagesView({
  packages,
  subscriptions,
}: {
  packages: Package[]
  subscriptions: CustomerSubscription[]
}) {
  const [tab, setTab] = useState<Tab>('catalog')

  return (
    <div className="flex flex-col gap-5">
      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label="มุมมองแพ็กเกจ"
        className="inline-flex gap-1 self-start rounded-lg border border-line bg-panel p-1"
      >
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.value
          const count = t.value === 'customers' ? ` (${subscriptions.length})` : ''
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setTab(t.value)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active
                  ? 'bg-primary-subtle text-primary'
                  : 'text-ink-secondary hover:bg-surface hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.9} />
              {t.label}
              {count}
            </button>
          )
        })}
      </div>

      {tab === 'catalog' ? (
        <TierCatalog packages={packages} />
      ) : (
        <SubscriptionTable subscriptions={subscriptions} packages={packages} />
      )}
    </div>
  )
}
