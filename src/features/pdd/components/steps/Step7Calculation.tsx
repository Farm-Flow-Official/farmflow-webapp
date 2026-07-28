'use client'

import { useState } from 'react'
import {
  Calculator,
  Loader2,
  Settings2,
  Pencil,
  TriangleAlert,
  Info,
  RotateCcw,
} from 'lucide-react'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { saveSection } from '@/features/pdd/actions/pddActions'
import { runForecast, type ForecastResult } from '@/features/pdd/actions/forecastActions'
import { updateProject } from '@/features/projects/actions/projectActions'
import { PROJECT_SCALE_LABELS } from '@/features/projects/types'
import type { StepProps } from '@/features/pdd/components/PddWizard'

/** One row of the §3.5 yearly table as the document stores it. */
type YearRow = {
  year?: number
  baseline?: number
  project?: number
  leakage?: number
  netReduction?: number
  /** Set once a human edits any cell in the row — drives the ✎ badge. */
  overridden?: boolean
}

type Step7Content = {
  yearlyEstimates?: YearRow[]
  totalTco2e?: number
  periodYears?: number
  avgPerYear?: number
  source?: 'engine' | 'manual'
  equationNote?: string
}

const fmt = (n: number | undefined, digits = 2) =>
  n == null ? '' : n.toLocaleString('en-US', { maximumFractionDigits: digits })

/** Truncated, never rounded — the form's rule, applied the same way client-side. */
const truncate = (n: number) => Math.trunc(n)

/**
 * Step 7 — the reduction calculation.
 *
 * The numbers here are what the authority reads to decide registration, so the
 * engine pre-fills but never decides: every cell is editable, an edited row is
 * marked as such, and the provenance of the whole table is recorded. The
 * carbon model is not TGO-verified, which the step says out loud rather than
 * burying in a tooltip.
 */
export function Step7Calculation({ pdd, editable, onSaved, onError }: StepProps) {
  const saved = (pdd.content?.step7 ?? {}) as Step7Content

  const [rows, setRows] = useState<YearRow[]>(saved.yearlyEstimates ?? [])
  const [source, setSource] = useState<'engine' | 'manual' | undefined>(saved.source)
  const [note, setNote] = useState(saved.equationNote ?? '')
  const [busy, setBusy] = useState(false)
  const [engineInfo, setEngineInfo] = useState<ForecastResult | null>(null)
  const [refusal, setRefusal] = useState<string | null>(null)

  const totals = summarise(rows)
  const dirtyRows = rows.some((r) => r.overridden)

  async function persist(next: {
    rows: YearRow[]
    source?: 'engine' | 'manual'
    note?: string
    complete?: boolean
  }) {
    const summary = summarise(next.rows)
    const res = await saveSection(
      pdd.id,
      'step7',
      {
        yearlyEstimates: next.rows,
        totalTco2e: summary.total,
        periodYears: next.rows.length,
        avgPerYear: summary.avgPerYear,
        source: next.source ?? source,
        equationNote: next.note ?? note,
      },
      next.complete,
    )
    if (res.ok) onSaved(res.data)
    else onError(res.error)
  }

  async function handleCompute() {
    setBusy(true)
    setRefusal(null)
    const res = await runForecast(pdd.id)
    setBusy(false)

    if (!res.ok) return onError(res.error)

    const f = res.data
    setEngineInfo(f)

    if (!f.supported) {
      setRefusal(f.reason ?? 'ยังคำนวณไม่ได้')
      return
    }

    const next: YearRow[] = (f.yearly ?? []).map((y) => ({
      year: y.year,
      baseline: y.baselineRemovals,
      project: y.projectRemovals,
      leakage: y.leakage,
      netReduction: y.netRemovals,
      overridden: false,
    }))

    setRows(next)
    setSource('engine')
    await persist({ rows: next, source: 'engine' })

    // Accepting a forecast re-derives the project's size band, which is what
    // decides whether Additionality must be proven in step 4.
    if (f.avgPerYear != null) {
      const scaleRes = await updateProject(pdd.projectId, { avgAnnualTco2e: f.avgPerYear })
      if (!scaleRes.ok) onError(scaleRes.error)
    }
  }

  function editCell(index: number, key: keyof YearRow, raw: string) {
    const value = raw === '' ? undefined : Number(raw)
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r
        const updated = { ...r, [key]: value, overridden: true }
        // Keep the net consistent with the parts the author just changed.
        if (key !== 'netReduction') {
          updated.netReduction =
            (updated.project ?? 0) - (updated.baseline ?? 0) - (updated.leakage ?? 0)
        }
        return updated
      }),
    )
  }

  async function commitEdits() {
    setSource('manual')
    await persist({ rows, source: 'manual' })
  }

  const scale = pdd.project.projectScale as keyof typeof PROJECT_SCALE_LABELS
  const overriddenByHuman = Boolean(pdd.project.scaleOverriddenBy)

  return (
    <StepFrame
      complete={Boolean(pdd.sectionProgress?.step7)}
      editable={editable}
      onToggleComplete={(next) => persist({ rows, complete: next })}
    >
      {/* The model's standing, stated plainly. */}
      <div className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-xs text-warning">
        <TriangleAlert className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
        <span>
          ตัวเลขในขั้นตอนนี้คือสิ่งที่ อบก. ใช้ตัดสินการขึ้นทะเบียน —{' '}
          <strong>แบบจำลองยังไม่ผ่านการรับรองจาก TGO</strong> เครื่องมือนี้ช่วยกรอกให้เท่านั้น
          ผู้เชี่ยวชาญที่ลงนามต้องตรวจและแก้ทุกค่าได้เสมอ
        </span>
      </div>

      <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Calculator className="h-4 w-4 text-primary" strokeWidth={2} />
              3.5 ตารางปริมาณการลดก๊าซรายปี
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              คำนวณจากพื้นที่และความหนาแน่นของฟาร์มที่เข้าร่วมโครงการจริง
            </p>
          </div>

          {editable && (
            <button
              type="button"
              onClick={handleCompute}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : rows.length > 0 ? (
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Calculator className="h-4 w-4" strokeWidth={2} />
              )}
              {busy ? 'กำลังคำนวณ…' : rows.length > 0 ? 'คำนวณใหม่' : 'คำนวณให้'}
            </button>
          )}
        </div>

        {refusal && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-secondary">
            <Info className="mt-px h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} />
            {refusal}
          </p>
        )}

        {rows.length === 0 && !refusal && (
          <p className="mt-4 rounded-lg border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-ink-muted">
            ยังไม่มีตารางรายปี — กด “คำนวณให้” เพื่อให้ระบบประมาณจากฟาร์มในโครงการ
            หรือกรอกเองได้ทั้งตาราง
          </p>
        )}

        {rows.length > 0 && (
          <>
            <div className="mt-4 overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-surface">
                    {['ปี', 'BE_y (กรณีฐาน)', 'PE_y (โครงการ)', 'LE_y (รั่วไหล)', 'ER_y (สุทธิ)', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap border-b border-line px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.year ?? i} className={row.overridden ? 'bg-warning-bg/30' : ''}>
                      <td className="border-b border-line px-3 py-1.5 font-medium text-ink">
                        {row.year ?? i + 1}
                      </td>
                      {(['baseline', 'project', 'leakage'] as const).map((key) => (
                        <td key={key} className="border-b border-line px-1.5 py-1.5">
                          <input
                            type="number"
                            step="any"
                            disabled={!editable}
                            value={row[key] ?? ''}
                            onChange={(e) => editCell(i, key, e.target.value)}
                            onBlur={commitEdits}
                            aria-label={`${key} ปี ${row.year ?? i + 1}`}
                            className="h-8 w-full rounded border border-transparent bg-transparent px-2 text-right text-sm text-ink hover:border-line focus:border-primary focus:bg-panel focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:text-ink-secondary"
                          />
                        </td>
                      ))}
                      <td className="border-b border-line px-3 py-1.5 text-right font-medium tabular-nums text-ink">
                        {fmt(row.netReduction)}
                      </td>
                      <td className="border-b border-line px-2 py-1.5">
                        <ProvenanceBadge overridden={Boolean(row.overridden)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface">
                    <td className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      รวม
                    </td>
                    <td colSpan={3} />
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-ink">
                      {fmt(totals.total, 0)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <SummaryTile
                label="รวมตลอดช่วงเครดิต"
                value={`${fmt(totals.total, 0)} tCO₂e`}
                hint="ตัดทศนิยมทิ้งตามข้อกำหนดฟอร์ม"
              />
              <SummaryTile label="จำนวนปี" value={`${rows.length} ปี`} />
              <SummaryTile
                label="เฉลี่ยต่อปี"
                value={`${fmt(totals.avgPerYear)} tCO₂e/ปี`}
                hint="ค่าที่ใช้กำหนดขนาดโครงการ"
              />
            </div>

            {/* The scale this table produced, and what it means for step 4. */}
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm">
              <span className="text-ink-secondary">ขนาดโครงการที่ได้:</span>
              <span className="font-semibold text-ink">{PROJECT_SCALE_LABELS[scale]}</span>
              {overriddenByHuman ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning">
                  <Pencil className="h-3 w-3" strokeWidth={2} />
                  กำหนดโดยผู้ใช้
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-info-bg px-2 py-0.5 text-xs font-medium text-info">
                  <Settings2 className="h-3 w-3" strokeWidth={2} />
                  คำนวณอัตโนมัติ
                </span>
              )}
              <span className="w-full text-xs text-ink-muted">
                {scale === 'large'
                  ? 'เกิน 60,000 tCO₂e/ปี — ต้องพิสูจน์ Additionality ในขั้นตอนที่ 4'
                  : 'ไม่เกิน 60,000 tCO₂e/ปี — เข้าเกณฑ์ Positive List ไม่ต้องพิสูจน์ Additionality'}
              </span>
            </div>

            {dirtyRows && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-warning">
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                มีบางแถวถูกแก้ด้วยมือ — ระบบบันทึกไว้ว่าค่าไม่ได้มาจากเครื่องคำนวณทั้งหมด
              </p>
            )}
          </>
        )}

        {engineInfo?.supported && engineInfo.stands && engineInfo.stands.length > 0 && (
          <details className="mt-4 rounded-lg border border-line bg-surface px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-ink">
              ที่มาของตัวเลข ({engineInfo.source === 'farms' ? 'จากฟาร์มในโครงการ' : 'จากค่าที่ระบุเอง'})
            </summary>
            <ul className="mt-2 flex flex-col gap-1.5 text-xs text-ink-secondary">
              {engineInfo.stands.map((s) => (
                <li key={s.label} className="flex flex-wrap justify-between gap-2">
                  <span className="text-ink">{s.label}</span>
                  <span>
                    {fmt(s.treeCount, 0)} ต้น · {fmt(s.annualTco2e)} tCO₂e/ปี
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
        <label htmlFor="s7-note" className="mb-1.5 block text-sm font-medium text-ink">
          หมายเหตุสมการและพารามิเตอร์
        </label>
        <textarea
          id="s7-note"
          rows={4}
          value={note}
          disabled={!editable}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => persist({ rows, note })}
          placeholder="อธิบายสมการที่ใช้ ค่าพารามิเตอร์ และแหล่งอ้างอิง — โดยเฉพาะเมื่อแก้ตัวเลขในตารางเอง"
          className="w-full resize-y rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-sunken"
        />
        {source && (
          <p className="mt-2 text-xs text-ink-muted">
            ที่มาของตาราง: {source === 'engine' ? 'เครื่องมือคำนวณของระบบ' : 'ผู้จัดทำกรอก/แก้เอง'}
          </p>
        )}
      </section>
    </StepFrame>
  )
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function ProvenanceBadge({ overridden }: { overridden: boolean }) {
  return overridden ? (
    <span
      title="แก้ไขโดยผู้ใช้"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning-bg text-warning"
    >
      <Pencil className="h-3 w-3" strokeWidth={2.5} />
      <span className="sr-only">แก้ไขโดยผู้ใช้</span>
    </span>
  ) : (
    <span
      title="คำนวณโดยระบบ"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-info-bg text-info"
    >
      <Settings2 className="h-3 w-3" strokeWidth={2.5} />
      <span className="sr-only">คำนวณโดยระบบ</span>
    </span>
  )
}

function SummaryTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

function summarise(rows: YearRow[]) {
  const exact = rows.reduce((sum, r) => sum + (r.netReduction ?? 0), 0)
  return {
    total: truncate(exact),
    avgPerYear: rows.length > 0 ? exact / rows.length : 0,
  }
}
