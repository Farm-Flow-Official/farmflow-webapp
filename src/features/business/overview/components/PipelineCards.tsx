import Link from 'next/link'
import { Receipt, Banknote, Headphones, Contact, ArrowRight } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { PipelineCounts } from '@/features/business/overview/types'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Item = {
  label: string
  count: number
  icon: IconType
  /** Linked when the destination page exists; otherwise a static tile. */
  href?: string
}

/** Action-queue tiles. Pending slips deep-links to the (built) Payments page. */
export function PipelineCards({ pipeline }: { pipeline: PipelineCounts }) {
  const items: Item[] = [
    { label: 'สลิปรอตรวจสอบ', count: pipeline.pendingSlips, icon: Receipt, href: '/business/payments' },
    { label: 'จ่ายเงินรออนุมัติ', count: pipeline.pendingPayouts, icon: Banknote },
    { label: 'ตั๋วซัพพอร์ตเปิดอยู่', count: pipeline.openTickets, icon: Headphones },
    { label: 'ลีดใหม่', count: pipeline.newLeads, icon: Contact },
  ]

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-ink">รายการที่ต้องดำเนินการ</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon
          const linked = Boolean(it.href)

          return linked ? (
            <Link
              key={it.label}
              href={it.href!}
              className="group flex flex-col rounded-2xl border border-line bg-panel p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <ArrowRight
                  className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{it.count}</p>
              <p className="text-[12px] text-ink-secondary">{it.label}</p>
            </Link>
          ) : (
            <div
              key={it.label}
              className="flex flex-col rounded-2xl border border-dashed border-line bg-surface/60 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sunken text-ink-muted">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="rounded bg-panel px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
                  เร็ว ๆ นี้
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-ink-secondary">{it.count}</p>
              <p className="text-[12px] text-ink-muted">{it.label}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
