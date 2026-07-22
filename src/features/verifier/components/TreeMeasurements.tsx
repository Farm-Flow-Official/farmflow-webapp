import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Ruler, Circle, ArrowUpFromLine, Leaf } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { formatNumber } from '@/lib/utils/format'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const oneDp = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/**
 * The four dendrometric figures a verifier scans first, pulled out of the
 * metadata list into a prominent strip: DBH, circumference, height, and the
 * per-tree carbon (the payload — emphasized).
 *
 * Carbon comes straight from the backend engine (single source of truth,
 * ADR 0016) — never recomputed here. Circumference is a display-only geometric
 * derivation (C = π·D); the field crew actually measures girth and the backend
 * converts it to DBH, so this recovers ~that reading (labelled "จาก DBH").
 */
export function TreeMeasurements({
  dbhCm,
  heightM,
  carbonKgco2e,
}: {
  dbhCm: number | null
  heightM: number | null
  carbonKgco2e: number | null
}) {
  const circumferenceCm = dbhCm != null ? Math.PI * dbhCm : null

  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile
        icon={Ruler}
        label="DBH"
        hint="เส้นผ่านศูนย์กลางที่อก (1.3 ม.)"
        value={dbhCm != null ? oneDp(dbhCm) : null}
        unit="ซม."
      />
      <Tile
        icon={Circle}
        label="เส้นรอบวง"
        hint="คำนวณจาก DBH (C = π × D)"
        value={circumferenceCm != null ? oneDp(circumferenceCm) : null}
        unit="ซม."
      />
      <Tile
        icon={ArrowUpFromLine}
        label="ความสูง"
        value={heightM != null ? oneDp(heightM) : null}
        unit="ม."
      />
      <Tile
        icon={Leaf}
        label="คาร์บอนรายต้น"
        value={carbonKgco2e != null ? formatNumber(Math.round(carbonKgco2e)) : null}
        unit="kgCO₂e"
        emphasized
        tooltip={
          <>
            <p className="mb-1 font-semibold text-ink">วิธีคำนวณคาร์บอน</p>
            คำนวณโดย carbon engine ตามมาตรฐาน{' '}
            <span className="font-medium text-ink">TGO (อบก.) T‑VER‑S‑TOOL‑01‑01 v.02</span> —
            สมการ allometric ตามกลุ่มพรรณไม้ (อิงเส้นผ่านศูนย์กลาง/ความสูง) → ชีวมวลใต้ดิน
            (root:shoot) → คาร์บอน (CF) → ×44/12 เป็น CO₂e. เป็นค่าจากระบบ ไม่ได้คำนวณในหน้านี้
          </>
        }
      />
    </div>
  )
}

function Tile({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  emphasized = false,
  tooltip,
}: {
  icon: IconType
  label: string
  value: string | null
  unit: string
  hint?: string
  emphasized?: boolean
  tooltip?: ReactNode
}) {
  return (
    <div
      className={`rounded-xl border p-3 shadow-sm ${
        emphasized ? 'border-primary/30 bg-primary-subtle' : 'border-line bg-panel'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1.5">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md ${
              emphasized ? 'bg-primary/10 text-primary' : 'bg-surface text-ink-muted'
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {label}
          </span>
        </span>
        {tooltip && <InfoTooltip label="วิธีคำนวณคาร์บอน">{tooltip}</InfoTooltip>}
      </div>

      <p className="mt-2.5 flex items-baseline gap-1">
        {value != null ? (
          <>
            <span
              className={`font-mono text-2xl font-bold leading-none tabular-nums ${
                emphasized ? 'text-primary' : 'text-ink'
              }`}
            >
              {value}
            </span>
            <span className="text-[11px] font-medium text-ink-muted">{unit}</span>
          </>
        ) : (
          <span className="text-2xl font-bold text-ink-disabled">—</span>
        )}
      </p>

      {hint && <p className="mt-1 text-[10px] text-ink-muted">{hint}</p>}
    </div>
  )
}
