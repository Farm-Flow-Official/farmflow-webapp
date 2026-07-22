import type { ComponentType, SVGProps } from 'react'
import { Sprout, Grid2x2, CalendarDays, Trees, LandPlot } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { Cultivation } from '@/features/verifier/types'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

/** Planting year → a display label + derived age, tolerating BE or CE input. */
function plantingAge(year: number | null): { label: string; age: number | null } {
  if (year == null) return { label: '—', age: null }
  const nowCE = new Date().getFullYear()
  const isBE = year > 2400 // Thai Buddhist-era years are ~543 ahead.
  const plantedCE = isBE ? year - 543 : year
  const age = nowCE - plantedCE
  return {
    label: isBE ? `พ.ศ. ${year}` : `ค.ศ. ${year}`,
    age: age >= 0 && age < 200 ? age : null,
  }
}

/**
 * Cultivation facts of the assessed subplot (ADR 0007) — the unit the carbon is
 * actually computed for. A farm can hold several single-species subplots, so
 * this makes explicit which one this batch is, plus the planting/density facts a
 * verifier uses to judge whether the measurements are plausible.
 */
export function CultivationInfo({
  cultivation,
  fallbackAreaRai,
  equationStatus,
}: {
  cultivation: Cultivation
  /** Farm area to show when the subplot has no distinct area (default subplot). */
  fallbackAreaRai: number | null
  equationStatus: 'approved' | 'provisional'
}) {
  const provisional = equationStatus === 'provisional'
  const planting = plantingAge(cultivation.plantingYear)
  const areaRai = cultivation.subplotAreaRai ?? fallbackAreaRai
  const subplotLabel = cultivation.isDefaultSubplot
    ? 'แปลงหลัก (ทั้งฟาร์ม)'
    : (cultivation.subplotName ?? 'แปลงย่อย')

  return (
    <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          ข้อมูลแปลงปลูก
        </h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-muted">
          หน่วยที่ใช้คำนวณคาร์บอน
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Species (headline) */}
        <div className="col-span-2 sm:col-span-1">
          <Label icon={Sprout} text="ชนิดพันธุ์" />
          <p className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-base font-semibold text-ink">
              {cultivation.speciesNameTh ?? '—'}
            </span>
            {cultivation.speciesNameEn && (
              <span className="text-xs text-ink-muted">({cultivation.speciesNameEn})</span>
            )}
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                provisional ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'
              }`}
            >
              {equationStatus}
            </span>
          </p>
        </div>

        <Stat icon={Grid2x2} label="แปลงย่อย" value={subplotLabel} />
        <Stat
          icon={CalendarDays}
          label="ปีที่ปลูก"
          value={planting.label}
          sub={planting.age != null ? `อายุ ~${planting.age} ปี` : undefined}
        />
        <Stat
          icon={Trees}
          label="ความหนาแน่น"
          value={cultivation.treeDensityPerRai != null ? formatNumber(cultivation.treeDensityPerRai) : '—'}
          sub={cultivation.treeDensityPerRai != null ? 'ต้น/ไร่' : undefined}
        />
        <Stat
          icon={LandPlot}
          label="พื้นที่แปลง"
          value={areaRai != null ? formatNumber(areaRai) : '—'}
          sub={areaRai != null ? `ไร่${cultivation.subplotAreaRai == null ? ' (ทั้งฟาร์ม)' : ''}` : undefined}
        />
      </div>
    </section>
  )
}

function Label({ icon: Icon, text }: { icon: IconType; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
      {text}
    </span>
  )
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: IconType
  label: string
  value: string
  sub?: string
}) {
  return (
    <div>
      <Label icon={icon} text={label} />
      <p className="mt-1 text-sm font-semibold text-ink">
        {value}
        {sub && <span className="ml-1 text-xs font-normal text-ink-muted">{sub}</span>}
      </p>
    </div>
  )
}
