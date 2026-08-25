'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { fetchGrowthForecast } from '@/features/species/actions/speciesActions'
import type { SpeciesGrowthForecast, SpeciesRow } from '@/features/species/types'

/**
 * What one tree of this species is projected to be worth over ten years.
 *
 * The species editor moves numbers whose effect nobody can see: R, CF and the
 * equation family are coefficients, not outcomes. This turns them into a curve
 * — the same maths the ex-post engine runs, on a tree grown forward a year at a
 * time — so a person can tell a plausible edit from an implausible one before
 * saving it.
 *
 * It is a projection, and the banner says so. Credits come from measuring real
 * trees at every verification cycle, never from this table.
 */
export function SpeciesGrowthPreview({ species }: { species: SpeciesRow }) {
  const [dbhCm, setDbhCm] = useState(10)
  const [heightM, setHeightM] = useState(8)
  const [result, setResult] = useState<SpeciesGrowthForecast | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    // Debounced: the inputs are number fields someone drags, and each keystroke
    // would otherwise be a round trip. The previous result stays on screen
    // through the wait rather than blanking on every digit.
    const timer = setTimeout(async () => {
      if (live) setLoading(true)
      const res = await fetchGrowthForecast(species.id, { dbhCm, heightM })
      if (!live) return
      setLoading(false)
      if (res.ok) {
        setResult(res.data)
        setError(null)
      } else {
        setError(res.error)
      }
    }, 300)

    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [species.id, dbhCm, heightM])

  const forecast = result?.forecast

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          <TrendingUp className="h-4 w-4 text-primary" strokeWidth={2} />
          ค่าพยากรณ์ 10 ปี — {species.speciesNameTh}
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-secondary">
          คำนวณจากสมการ <span className="font-mono">{species.equationFormula ?? '—'}</span>{' '}
          โดยเพิ่มขนาดต้นไม้ปีละ ΔDBH/ΔH แล้วคิดคาร์บอนใหม่ทุกปี — ปีที่ 1 คือปีขึ้นทะเบียน
          ส่วนที่ขายได้คือคาร์บอนที่เพิ่มจากปีนั้น
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="เส้นผ่านศูนย์กลางเริ่มต้น (ซม.)" value={dbhCm} onChange={setDbhCm} />
        <NumberField label="ความสูงเริ่มต้น (ม.)" value={heightM} onChange={setHeightM} />
      </div>

      {error && <Note tone="error">{error}</Note>}

      {!error && forecast && !forecast.supported && <Note tone="muted">{forecast.reason}</Note>}

      {!error && result && forecast?.supported && (
        <>
          {result.incrementIsPublished === false && (
            <Note tone="warning">
              อัตราการเติบโตของกลุ่มนี้เป็นค่าสมมติ ไม่ได้มาจากคู่มือ 2554 —
              ต้องวัดแปลงจริงก่อนออกเครดิต
            </Note>
          )}
          {result.incrementNote && <Note tone="muted">{result.incrementNote}</Note>}

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="กลุ่มการเติบโต"
              value={result.incrementNameTh ?? '—'}
              sub={`${result.dbhCmPerYear ?? '—'} ซม./ปี · ${result.heightMPerYear ?? '—'} ม./ปี`}
            />
            <Stat
              label="คาร์บอนสะสมปีที่ 10"
              value={`${forecast.years[forecast.years.length - 1].cumulativeTco2e.toFixed(4)} tCO₂e`}
              sub={`ปีที่ 1 = ${forecast.baselineTco2e.toFixed(4)} tCO₂e`}
            />
            <Stat
              label="ส่วนที่ขายได้ (ΔC)"
              value={`${forecast.totalDeltaTco2e.toFixed(4)} tCO₂e`}
              sub={
                result.carbonPriceThb != null
                  ? `≈ ${(forecast.totalDeltaTco2e * result.carbonPriceThb).toLocaleString(
                      'th-TH',
                      {
                        maximumFractionDigits: 2,
                      },
                    )} บาท ที่ ${result.carbonPriceThb} บาท/tCO₂e`
                  : 'ยังไม่ได้ตั้งราคาคาร์บอน'
              }
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-[12px]">
              <thead className="bg-surface text-ink-secondary">
                <tr>
                  <Th align="left">ปี</Th>
                  <Th>DBH (ซม.)</Th>
                  <Th>สูง (ม.)</Th>
                  <Th>คาร์บอนสะสม</Th>
                  <Th>เพิ่มจากปีที่ 1</Th>
                  <Th>มูลค่า (บาท)</Th>
                </tr>
              </thead>
              <tbody>
                {forecast.years.map((y) => (
                  <tr key={y.year} className="border-t border-line">
                    <td className="px-3 py-2 text-ink">{y.year}</td>
                    <Td>{y.dbhCm?.toFixed(2) ?? '—'}</Td>
                    <Td>{y.heightM?.toFixed(2) ?? '—'}</Td>
                    <Td>{y.cumulativeTco2e.toFixed(4)}</Td>
                    <Td strong>{y.deltaTco2e.toFixed(4)}</Td>
                    <Td>
                      {y.valueThb == null
                        ? '—'
                        : y.valueThb.toLocaleString('th-TH', {
                            maximumFractionDigits: 2,
                          })}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] leading-relaxed text-ink-muted">
            ค่าพยากรณ์ล่วงหน้า (ex-ante) ยังไม่ผ่านการรับรองจาก อบก. — ใช้ประกอบการวางแผนเท่านั้น
            เครดิตจริงต้องวัดต้นไม้จริงทุกรอบทวนสอบ และหักสำรองความเสี่ยง 3% ที่ระดับโครงการ
          </p>
        </>
      )}

      {loading && !result && <p className="text-[12px] text-ink-muted">กำลังคำนวณ…</p>}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-ink">{label}</span>
      <input
        type="number"
        step="any"
        min={0.1}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value)
          // A zero or blank field would make the API reject the whole request;
          // hold the last usable value instead of flashing an error.
          if (Number.isFinite(next) && next > 0) onChange(next)
        }}
        className="mt-1.5 h-10 w-full rounded-lg border border-line bg-panel px-3 font-mono text-sm tabular-nums text-ink outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-relaxed text-ink-secondary">{sub}</p>}
    </div>
  )
}

function Note({
  tone,
  children,
}: {
  tone: 'warning' | 'error' | 'muted'
  children: React.ReactNode
}) {
  const styles = {
    warning: 'border-warning/30 bg-warning-bg text-warning',
    error: 'border-error/30 bg-error-bg text-error',
    muted: 'border-line bg-surface text-ink-secondary',
  }[tone]

  return (
    <p
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-[12px] leading-relaxed ${styles}`}
    >
      {tone !== 'muted' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.9} />}
      <span>{children}</span>
    </p>
  )
}

function Th({
  children,
  align = 'right',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th className={`px-3 py-2 font-medium ${align === 'left' ? 'text-left' : 'text-right'}`}>
      {children}
    </th>
  )
}

function Td({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <td
      className={`px-3 py-2 text-right font-mono tabular-nums ${
        strong ? 'font-semibold text-ink' : 'text-ink-secondary'
      }`}
    >
      {children}
    </td>
  )
}
