import { Sprout, FunctionSquare } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import type { SpeciesEquation } from '@/features/verifier/types'

/**
 * Species + allometric-equation provenance for the batch, shown under the photo.
 * Every value comes from the engine's `species_equations` row (via the API) — the
 * verifier sees the real equation and whether it is TGO-approved, never a guess.
 * The equation is per registered species, so it changes batch to batch.
 */
export function SpeciesEquationBar({
  speciesNameTh,
  equation,
}: {
  speciesNameTh: string | null
  equation: SpeciesEquation
}) {
  const provisional = equation.status === 'provisional'

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-panel px-3 py-2.5 shadow-sm">
      {/* Species */}
      <span className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <Sprout className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            ชนิดพันธุ์
          </span>
          <span className="block text-sm font-semibold text-ink">
            {speciesNameTh ?? '—'}
            {equation.speciesNameEn && (
              <span className="ml-1 font-normal text-ink-muted">({equation.speciesNameEn})</span>
            )}
          </span>
        </span>
      </span>

      <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />

      {/* Equation */}
      <span className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-ink-secondary">
          <FunctionSquare className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            สมการ Allometric
          </span>
          <span className="block text-sm text-ink">
            {equation.code ? (
              <>
                <span className="font-mono font-semibold">{equation.code}</span>
                {equation.reference && (
                  <span className="ml-1.5 text-ink-secondary">· {equation.reference}</span>
                )}
              </>
            ) : (
              <span className="text-ink-muted">ไม่ระบุ</span>
            )}
          </span>
        </span>
      </span>

      {/* Status chip + methodology */}
      <span className="ml-auto flex items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            provisional ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'
          }`}
        >
          {provisional ? 'provisional' : 'approved'}
        </span>
        <InfoTooltip label="รายละเอียดสมการคาร์บอน">
          <p className="mb-1 font-semibold text-ink">สมการ &amp; ค่าคงที่</p>
          {equation.code && (
            <p>
              กลุ่มสมการ <span className="font-mono font-medium text-ink">{equation.code}</span>
              {equation.reference && ` — ${equation.reference}`}
            </p>
          )}
          {(equation.rValue != null || equation.cfValue != null) && (
            <p className="mt-1">
              ค่าคงที่:{' '}
              {equation.rValue != null && (
                <>
                  R (ราก:ยอด) = <span className="font-medium text-ink">{equation.rValue}</span>
                </>
              )}
              {equation.rValue != null && equation.cfValue != null && ' · '}
              {equation.cfValue != null && (
                <>
                  CF (สัดส่วนคาร์บอน) ={' '}
                  <span className="font-medium text-ink">{equation.cfValue}</span>
                </>
              )}
            </p>
          )}
          <p className="mt-1">
            วัดที่ DBH 1.3 ม. → ชีวมวล → ×CF → ×44/12 เป็น CO₂e ตามมาตรฐาน{' '}
            <span className="font-medium text-ink">TGO (อบก.) T‑VER‑S‑TOOL‑01‑01 v.02</span>
          </p>
          {provisional && (
            <p className="mt-1 text-warning">
              provisional = ยังรอ TGO รับรองสมการสำหรับพันธุ์นี้ (ใช้ Ogawa แทนชั่วคราว) — ตรวจสอบเพิ่มความรอบคอบ
            </p>
          )}
        </InfoTooltip>
      </span>
    </div>
  )
}
