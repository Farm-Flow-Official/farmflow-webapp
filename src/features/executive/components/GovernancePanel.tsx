import { MapPinCheck, Gauge, TriangleAlert, Layers } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { formatNumber } from '@/lib/utils/format'
import {
  CONFIDENCE_MIN,
  confidenceTextClass,
  confidenceTone,
} from '@/features/verifier/lib/confidence'
import type { Governance } from '@/features/executive/types'

/**
 * The Governance pillar: whether the carbon numbers above can be trusted.
 *
 * Every figure here is an MRV signal the platform already computes for the
 * verifier portal (ADR 0017 spatial checks, ADR 0022 vision assessment) — this
 * is the first time any of it is stated at board altitude, and it is the part a
 * funder or an auditor actually interrogates.
 *
 * The confidence tone reuses the verifier's own thresholds rather than picking
 * fresh ones: a score that reads green to a reviewer must not read amber to the
 * board.
 */
export function GovernancePanel({ governance }: { governance: Governance }) {
  const {
    withinBoundaryRate,
    unknownBoundary,
    avgConfidence,
    scoredTrees,
    anomalyTrees,
    failedAssessments,
    overlapFlaggedFarms,
  } = governance

  const confidenceClass =
    avgConfidence === null ? 'text-ink-muted' : confidenceTextClass(avgConfidence)
  const confidenceIsLow = avgConfidence !== null && confidenceTone(avgConfidence) !== 'ok'

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={MapPinCheck}
          label="ภาพถ่ายในขอบเขตฟาร์ม"
          value={withinBoundaryRate === null ? '—' : `${withinBoundaryRate.toFixed(1)}%`}
          sub={
            unknownBoundary > 0
              ? `อีก ${formatNumber(unknownBoundary)} ภาพยังไม่มีขอบเขตให้ตรวจ`
              : 'ตรวจได้ทุกภาพ'
          }
          hint="ทุกภาพต้นไม้ถูกตรวจตอนบันทึกว่าถ่ายในขอบเขตฟาร์มที่อ้างจริงหรือไม่ (รัศมี 27 เมตร) ภาพที่ฟาร์มยังไม่ปักขอบเขตนับเป็น 'ยังไม่ทราบ' ไม่ใช่ 'นอกขอบเขต'"
        />
        <Metric
          icon={Gauge}
          label="คะแนนหลักฐานเฉลี่ย"
          value={avgConfidence === null ? '—' : avgConfidence.toFixed(2)}
          valueClass={confidenceClass}
          sub={
            avgConfidence === null
              ? 'ยังไม่มีต้นไม้ที่ให้คะแนน'
              : `${formatNumber(scoredTrees)} ต้น · เกณฑ์ผ่าน ${CONFIDENCE_MIN}`
          }
          alert={confidenceIsLow}
          hint="ความสอดคล้องระหว่างภาพถ่ายกับค่าที่วัดมา ประเมินโดยโมเดล vision — เป็นตัวจัดลำดับความสนใจของผู้ตรวจ ไม่ใช่ความน่าจะเป็นของการทุจริต และไม่มีผลต่อปริมาณคาร์บอนซึ่งคำนวณด้วยสมการ T-VER"
        />
        <Metric
          icon={TriangleAlert}
          label="ต้นไม้ที่มีสัญญาณผิดปกติ"
          value={formatNumber(anomalyTrees)}
          unit="ต้น"
          sub={
            failedAssessments > 0
              ? `+ ${formatNumber(failedAssessments)} ต้นที่ AI อ่านไม่ได้ ต้องตรวจมือ`
              : 'ไม่มีต้นที่ AI อ่านไม่ได้'
          }
          alert={anomalyTrees > 0}
          hint="โมเดลตั้งธงไว้ให้ผู้ตรวจดูเป็นพิเศษ เช่น ภาพไม่ใช่ต้นไม้ ขนาดไม่ตรงกับภาพ หรือภาพซ้ำ — โมเดลไม่เคยปฏิเสธเองโดยอัตโนมัติ"
        />
        <Metric
          icon={Layers}
          label="ฟาร์มที่ขอบเขตทับซ้อน"
          value={formatNumber(overlapFlaggedFarms)}
          unit="ฟาร์ม"
          sub={overlapFlaggedFarms > 0 ? 'ต้องชี้ขาดก่อนออกเครดิต' : 'ไม่พบการทับซ้อนเกินเกณฑ์'}
          alert={overlapFlaggedFarms > 0}
          hint="คำนวณด้วย PostGIS จากขอบเขตจริงของทุกแปลง — ฟาร์มสองแปลงที่อ้างที่ดินผืนเดียวกันจะออกเครดิตซ้อนกันไม่ได้"
        />
      </div>

      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-secondary">
        ทุกตัวเลขคาร์บอนบนหน้านี้ตรวจสอบย้อนกลับได้ถึงภาพถ่ายต้นไม้รายต้น พร้อมพิกัด เวลา
        และสมการ T-VER ที่ใช้คำนวณ
      </p>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  hint,
  valueClass = 'text-ink',
  alert = false,
}: {
  icon: typeof Gauge
  label: string
  value: string
  unit?: string
  sub: string
  hint: string
  valueClass?: string
  alert?: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border bg-panel p-4 shadow-sm ${
        alert ? 'border-warning/40' : 'border-line'
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-esg-g-bg text-esg-g">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>

      <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
        <InfoTooltip label={label}>{hint}</InfoTooltip>
      </p>
      <p className="mt-0.5 flex items-baseline gap-1">
        <span className={`text-2xl font-bold tracking-tight ${valueClass}`}>{value}</span>
        {unit && <span className="text-xs font-medium text-ink-muted">{unit}</span>}
      </p>
      <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">{sub}</p>
    </div>
  )
}
