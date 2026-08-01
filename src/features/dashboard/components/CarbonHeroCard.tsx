import { Leaf, TrendingUp } from 'lucide-react'
import { formatCarbonKg, formatNumber } from '@/lib/utils/format'

/**
 * Hero panel for the headline metric — total carbon issued — on a deep brand-green
 * gradient. Shows the proud number plus a *derived* estimated market value
 * (carbon × market price); no fabricated trend, just the real figures made big.
 *
 * Leads in tonnes because that is the unit the number is *for*: the market price
 * beneath it is quoted per tonne, so the two used to disagree on the same card.
 */
export function CarbonHeroCard({
  totalCarbonKgco2e,
  marketPriceThb,
}: {
  totalCarbonKgco2e: number
  marketPriceThb: number | null
}) {
  // marketPriceThb is THB per tonne (tCO₂e); carbon is stored in kg → divide by 1,000.
  const estimatedValueThb =
    marketPriceThb != null
      ? Math.round((totalCarbonKgco2e / 1000) * marketPriceThb)
      : null

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
            {(totalCarbonKgco2e / 1000).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-sm font-medium text-primary-muted">tCO₂e</span>
        </p>
        <p className="mt-1 font-mono text-sm tabular-nums text-white/50">
          {formatCarbonKg(totalCarbonKgco2e)}
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
              @ ฿{formatNumber(marketPriceThb)} / tCO₂e
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
