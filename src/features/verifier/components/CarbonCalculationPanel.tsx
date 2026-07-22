import { Calculator, ChevronDown } from 'lucide-react'
import type { CarbonBreakdown } from '@/features/verifier/types'

type Step = { label: string; expr: string; value: number | null; unit?: string; dp?: number }

function num(v: number | null | undefined, dp = 2): string {
  if (v == null) return '—'
  return v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

/** `[a, b]` → "a·(D²H)^b"; falls back to symbolic when coefficients are absent. */
function powLaw(coeff: unknown, symbol = 'D²H'): string {
  if (Array.isArray(coeff) && coeff.length >= 2) return `${coeff[0]}·(${symbol})^${coeff[1]}`
  return `a·(${symbol})^b`
}

/**
 * The reproducible worked calculation for a tree's carbon — the actual engine
 * steps with the real substituted numbers (carbon_calculation_logs), not just
 * the equation name. Collapsible via native <details>. Adapts to the equation
 * family: OGW shows WS/WB/WL, durian/palm show their single AGB step.
 */
export function CarbonCalculationPanel({ carbon }: { carbon: CarbonBreakdown }) {
  const fs = carbon.formulaSnapshot
  const inputs = fs?.inputs
  const coeffs = (fs?.coefficients ?? {}) as Record<string, unknown>
  const R = inputs?.rValue ?? null
  const CF = inputs?.cfValue ?? null
  const co2 = inputs?.co2Multiplier ?? null
  const dbh = inputs?.dbhCm ?? null
  const h = inputs?.heightM ?? null

  // Above-ground steps differ per family; the tail (biomass → carbon → CO₂e) is shared.
  const agbSteps: Step[] =
    carbon.wsKg != null
      ? [
          { label: 'D²H', expr: `${num(dbh, 1)}² × ${num(h, 1)}`, value: carbon.d2h, dp: 2 },
          { label: 'WS (ลำต้น)', expr: powLaw(coeffs.ws), value: carbon.wsKg, unit: 'kg' },
          { label: 'WB (กิ่ง)', expr: powLaw(coeffs.wb), value: carbon.wbKg, unit: 'kg' },
          { label: 'WL (ใบ)', expr: '(28/(WS+WB)+0.025)⁻¹', value: carbon.wlKg, unit: 'kg' },
          { label: 'ชีวมวลเหนือดิน (AGB)', expr: 'WS + WB + WL', value: carbon.wtAbgKg, unit: 'kg' },
        ]
      : [
          {
            label: 'ชีวมวลเหนือดิน (AGB)',
            expr: h != null && carbon.wsKg == null && dbh == null ? 'f(H)' : 'f(D₀)',
            value: carbon.wtAbgKg,
            unit: 'kg',
          },
        ]

  const tailSteps: Step[] = [
    { label: 'AGB → ตัน', expr: `${num(carbon.wtAbgKg, 1)} ÷ 1000`, value: carbon.bAbgT, unit: 't', dp: 4 },
    { label: 'ชีวมวลใต้ดิน (BGB)', expr: `AGB × R(${R ?? '—'})`, value: carbon.bBlgT, unit: 't', dp: 4 },
    { label: 'ชีวมวลรวม', expr: 'AGB + BGB', value: carbon.bTreeT, unit: 't', dp: 4 },
    { label: 'คาร์บอน', expr: `รวม × CF(${CF ?? '—'})`, value: carbon.cTreeTc, unit: 'tC', dp: 4 },
    { label: 'CO₂ เทียบเท่า', expr: `× 44/12 (${co2 ?? '—'})`, value: carbon.carbonTco2e, unit: 'tCO₂e', dp: 4 },
  ]

  const steps = [...agbSteps, ...tailSteps]
  const finalKg = carbon.carbonTco2e != null ? carbon.carbonTco2e * 1000 : null

  return (
    <details className="group mt-4 overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-3.5 hover:bg-surface [&::-webkit-details-marker]:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <Calculator className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-ink">การคำนวณคาร์บอน (ตรวจสอบย้อนได้)</span>
          <span className="block text-xs text-ink-muted">
            สมการ {fs?.equationFormula ?? '—'} · ค่าจริงที่ engine ใช้คำนวณทีละขั้น
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 text-ink-muted transition-transform group-open:rotate-180"
          strokeWidth={2}
        />
      </summary>

      <div className="border-t border-line p-5">
        {fs?.reference && (
          <p className="mb-3 text-[12px] text-ink-secondary">
            อ้างอิง: <span className="font-medium text-ink">{fs.reference}</span>
          </p>
        )}

        <ol className="flex flex-col divide-y divide-line">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-3 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-ink-muted tabular-nums">
                {i + 1}
              </span>
              <span className="w-40 shrink-0 text-[13px] text-ink-secondary">{s.label}</span>
              <span className="hidden flex-1 truncate font-mono text-[12px] text-ink-muted sm:block">
                {s.expr}
              </span>
              <span className="shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums text-ink">
                {num(s.value, s.dp)}
                {s.unit && <span className="ml-1 text-[11px] font-normal text-ink-muted">{s.unit}</span>}
              </span>
            </li>
          ))}
        </ol>

        {/* Final result */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-primary-subtle px-4 py-3">
          <span className="text-sm font-semibold text-primary">คาร์บอนรายต้น</span>
          <span className="font-mono text-lg font-bold tabular-nums text-primary">
            {num(finalKg, 0)}{' '}
            <span className="text-xs font-medium text-ink-muted">kgCO₂e</span>
          </span>
        </div>

        <p className="mt-3 border-t border-line pt-2 text-[11px] leading-relaxed text-ink-muted">
          ค่าทุกขั้นบันทึกโดย carbon engine ตอนคำนวณ (carbon_calculation_logs, ADR 0016) — ตรงกับตัวเลขที่ใช้ออกเครดิตจริง ตรวจสอบย้อนได้
        </p>
      </div>
    </details>
  )
}
