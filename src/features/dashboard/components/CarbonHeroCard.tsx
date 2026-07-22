import { Leaf, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'

/**
 * Hero panel for the headline metric — total carbon issued — on a deep brand-green
 * gradient. Shows the proud number plus a *derived* estimated market value
 * (carbon × market price); no fabricated trend, just the real figures made big.
 */
export function CarbonHeroCard({
  totalCarbonKgco2e,
  marketPriceThb,
}: {
  totalCarbonKgco2e: number
  marketPriceThb: number | null
}) {
  const estimatedValueThb =
    marketPriceThb != null ? totalCarbonKgco2e * marketPriceThb : null

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-6 shadow-sm sm:p-7"
      style={{ background: 'linear-gradient(135deg, #004C22 0%, #003A1A 100%)' }}
    >
      {/* Oversized leaf watermark */}
      <Leaf
        className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-white/[0.06]"
        strokeWidth={1}
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
            <Leaf className="h-4 w-4 text-primary-muted" strokeWidth={2} />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-muted">
            Carbon Issued · คาร์บอนที่ออกให้แล้ว
          </p>
        </div>

        <p className="mt-4 flex items-baseline gap-2">
          <span className="font-mono text-4xl font-bold tracking-tight tabular-nums text-white sm:text-5xl">
            {formatNumber(totalCarbonKgco2e)}
          </span>
          <span className="text-sm font-medium text-primary-muted">kgCO₂e</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          {estimatedValueThb != null ? (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-muted" strokeWidth={2} />
              <span className="text-sm text-white/70">มูลค่าตลาดโดยประมาณ</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-white">
                ฿{formatNumber(estimatedValueThb)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-white/50">ยังไม่มีราคาตลาดอ้างอิง</span>
          )}
          {marketPriceThb != null && (
            <span className="text-xs text-white/50">
              @ ฿{marketPriceThb.toFixed(2)} / kgCO₂e
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
