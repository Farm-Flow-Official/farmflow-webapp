import { Check, Clock, Smartphone, Cpu, Sparkles } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { Package } from '@/features/business/packages/types'

/** Perks every tier gets equally — surfaced once below the cards, not per-card. */
const BASELINE_FEATURES = [
  'ประเมินราคาคาร์บอน',
  'แจ้งเตือนราคาคาร์บอน',
  'รองรับ Flowder',
]

function priceLabel(pkg: Package): { main: string; sub?: string } {
  if (pkg.priceThb === 0) return { main: 'ฟรี' }
  if (pkg.code === 'PLATINUM' && pkg.overagePricePerRai != null) {
    return {
      main: `฿${formatNumber(pkg.priceThb)}`,
      sub: `+ ฿${formatNumber(pkg.overagePricePerRai)}/ไร่ ส่วนเกิน`,
    }
  }
  return { main: `฿${formatNumber(pkg.priceThb)}`, sub: '/ เดือน' }
}

function quotaLabel(pkg: Package): string {
  if (pkg.code === 'PLATINUM' && pkg.baseRai != null) return `ฐาน ${pkg.baseRai} ไร่`
  return pkg.quotaRai != null ? `สูงสุด ${pkg.quotaRai} ไร่` : '—'
}

/** Tab A — the tier catalog. Read-only cards (no catalog-edit UI in prototype). */
export function TierCatalog({ packages }: { packages: Package[] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {packages.map((pkg) => {
          const price = priceLabel(pkg)
          const highlight = pkg.code === 'GOLD'
          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-2xl border bg-panel p-5 shadow-sm ${
                highlight ? 'border-primary ring-1 ring-primary/20' : 'border-line'
              }`}
            >
              {highlight && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  ยอดนิยม
                </span>
              )}

              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {pkg.code}
              </p>
              <h3 className="mt-0.5 text-lg font-semibold text-ink">{pkg.name}</h3>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-ink">{price.main}</span>
                {price.sub && <span className="text-xs text-ink-muted">{price.sub}</span>}
              </div>

              <p className="mt-1 text-[13px] font-medium text-ink-secondary">{quotaLabel(pkg)}</p>

              {/* Feature 1 — device limit, surfaced prominently */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-surface px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                    <Smartphone className="h-3 w-3" strokeWidth={2} />
                    อุปกรณ์
                  </div>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-ink">
                    {pkg.deviceLimit}
                  </p>
                </div>
                <div className="rounded-lg bg-surface px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                    <Cpu className="h-3 w-3" strokeWidth={2} />
                    IoT ฟรี
                  </div>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-ink">
                    {pkg.iotFreeUnits}
                  </p>
                </div>
              </div>

              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-ink-secondary">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              {pkg.upcomingFeatures.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                  {pkg.upcomingFeatures.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px] text-ink-muted"
                    >
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      <span className="flex-1">{f}</span>
                      <span className="rounded bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
                        เร็ว ๆ นี้
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Baseline strip — what every tier gets equally (no PDF export: user-side
          export is deferred; today PDF is issued only via the Verifier). */}
      <div className="rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            ทุกแพ็กเกจได้เท่ากัน
          </span>
          {BASELINE_FEATURES.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary">
              <Check className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
