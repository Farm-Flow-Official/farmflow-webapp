import { Leaf, Users, HandCoins } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { ImpactMetrics } from '@/features/business/overview/types'

/** Social/environmental impact band — the "why this matters" story for pitches. */
export function ImpactStrip({ impact }: { impact: ImpactMetrics }) {
  const items = [
    {
      icon: Leaf,
      value: `${formatNumber(impact.carbonInSystemTco2e)}`,
      unit: 'tCO₂e',
      label: 'คาร์บอนในระบบ',
    },
    {
      icon: Users,
      value: formatNumber(impact.farmerCount),
      unit: 'ราย',
      label: 'เกษตรกรในแพลตฟอร์ม',
    },
    {
      icon: HandCoins,
      value: `฿${formatNumber(impact.communityValueThb)}`,
      unit: '',
      label: 'มูลค่าคาร์บอนรวม (ประเมิน)',
    },
  ]

  return (
    <section className="rounded-2xl border border-primary-muted bg-primary-subtle p-5">
      <h2 className="mb-3 text-base font-semibold text-primary">Impact</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <div key={it.label} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-panel text-primary shadow-sm">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div>
                <p className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tracking-tight text-ink">{it.value}</span>
                  {it.unit && <span className="text-xs font-medium text-ink-muted">{it.unit}</span>}
                </p>
                <p className="text-[12px] text-ink-secondary">{it.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
