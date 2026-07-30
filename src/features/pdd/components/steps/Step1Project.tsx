'use client'

import { useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FieldGroup,
  ReadOnlyField,
  RadioField,
  TextField,
  NumberField,
  DateField,
} from '@/features/pdd/components/fields'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { useStepAutosave } from '@/features/pdd/hooks/useStepAutosave'
import { saveStep1 } from '@/features/pdd/actions/pddActions'
import { step1Draft, type Step1Values } from '@/features/pdd/schemas'
import { PROJECT_SCALE_LABELS } from '@/features/projects/types'
import type { StepProps } from '@/features/pdd/components/PddWizard'

/**
 * Step 1 — the cover sheet.
 *
 * These fields are the project itself (ADR 0023), so this step writes to
 * `projects` rather than the document's jsonb. Everything else in the portal
 * reads them, which is exactly why they are columns.
 */
export function Step1Project({ pdd, editable, onDirtyChange, onSaved, onError }: StepProps) {
  const p = pdd.project

  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Draft),
    mode: 'onBlur',
    defaultValues: {
      projectCode: p.projectCode,
      nameTh: p.nameTh,
      nameEn: p.nameEn ?? '',
      implementationMode: (p.implementationMode as 'standalone' | 'bundled') ?? 'standalone',
      creditingPeriodYears: p.creditingPeriodYears ?? undefined,
      creditingStartDate: p.creditingStartDate ?? '',
      creditingEndDate: p.creditingEndDate ?? '',
      totalInvestmentMillionThb: p.totalInvestmentMillionThb ?? undefined,
      expectedReductionTco2eYr: p.expectedReductionTco2eYr ?? undefined,
    },
  })

  useStepAutosave<Step1Values>({
    form,
    editable,
    onDirtyChange,
    onSaved,
    onError,
    save: (values) =>
      saveStep1(pdd.projectId, pdd.id, {
        projectCode: values.projectCode,
        nameTh: values.nameTh,
        nameEn: values.nameEn || undefined,
        implementationMode: values.implementationMode,
        creditingPeriodYears: values.creditingPeriodYears
          ? Number(values.creditingPeriodYears)
          : undefined,
        creditingStartDate: values.creditingStartDate || undefined,
        creditingEndDate: values.creditingEndDate || undefined,
        totalInvestmentMillionThb: values.totalInvestmentMillionThb,
        expectedReductionTco2eYr: values.expectedReductionTco2eYr,
      }),
  })

  const complete = Boolean(pdd.sectionProgress?.step1)

  return (
    <FormProvider {...form}>
      <StepFrame
        complete={complete}
        editable={editable}
        onToggleComplete={async (next) => {
          const res = await saveStep1(pdd.projectId, pdd.id, {}, next)
          if (res.ok) onSaved(res.data)
          else onError(res.error)
        }}
      >
        <FieldGroup title="1. ข้อมูลหลักโครงการ" description="ปรากฏบนหน้าปกเอกสาร PDD">
          <TextField<Step1Values>
            name="projectCode"
            label="รหัสโครงการ"
            required
            placeholder="เช่น TVER-NAN-2569"
          />
          <TextField<Step1Values>
            name="nameTh"
            label="ชื่อโครงการ (ไทย)"
            required
            hint="ควรเฉพาะเจาะจงพอที่จะไม่ซ้ำกับโครงการอื่น"
          />
          <TextField<Step1Values> name="nameEn" label="ชื่อโครงการ (อังกฤษ)" required />

          <ReadOnlyField
            label="ประเภทโครงการ"
            value="การลด ดูดซับ และการกักเก็บฯ จากภาคป่าไม้และการเกษตร"
            hint="ล็อกไว้ — FarmFlow รองรับเฉพาะสาขานี้"
          />

          <RadioField<Step1Values>
            name="implementationMode"
            label="รูปแบบการดำเนินโครงการ"
            required
            options={[
              { value: 'standalone', label: 'แบบเดี่ยว', hint: 'ผู้พัฒนาโครงการรายเดียว' },
              { value: 'bundled', label: 'แบบควบรวม', hint: 'รวมผู้พัฒนาหลายรายเข้าด้วยกัน' },
            ]}
          />

          <ReadOnlyField
            label="ขนาดโครงการ"
            value={PROJECT_SCALE_LABELS[p.projectScale as keyof typeof PROJECT_SCALE_LABELS]}
            hint="คำนวณจากค่าเฉลี่ยรายปีในขั้นตอนที่ 7 — ยังไม่เปิดใช้"
          />
        </FieldGroup>

        <FieldGroup title="ระยะเวลาคิดเครดิต">
          <CreditingPeriodField />
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField<Step1Values> name="creditingStartDate" label="วันเริ่มคิดเครดิต" required />
            <DateField<Step1Values> name="creditingEndDate" label="วันสิ้นสุดคิดเครดิต" required />
          </div>
          <CreditingEndHint />
        </FieldGroup>

        <FieldGroup title="ตัวเลขหลัก">
          <NumberField<Step1Values>
            name="totalInvestmentMillionThb"
            label="เงินลงทุนทั้งหมด"
            required
            unit="ล้านบาท"
            min={0}
          />
          <NumberField<Step1Values>
            name="expectedReductionTco2eYr"
            label="ปริมาณก๊าซที่คาดว่าจะลด/ดูดกลับ"
            required
            unit="tCO₂e/ปี"
            min={0}
            hint="กรอกเองไปก่อน — เครื่องมือคำนวณจะเติมให้อัตโนมัติในขั้นตอนที่ 7"
          />
        </FieldGroup>
      </StepFrame>
    </FormProvider>
  )
}

/* ── Crediting period ───────────────────────────────────────────────────── */

const PRESET_PERIODS = [7, 10] as const

/**
 * 7 and 10 years as one click, any whole number as a fallback.
 *
 * The two presets are the T-VER forestry norm, but the source spec marks them
 * "ตรวจสอบกับ methodology ป่าไม้ล่าสุด" — unconfirmed. The API has always
 * accepted 1–100 and the forecast engine builds one row per year whatever the
 * figure, so a two-option radio was the UI imposing a rule the standard does not
 * state. If อบก. changes the period, nothing here needs rewriting.
 */
function CreditingPeriodField() {
  const { register, setValue, watch, formState } = useFormContext<Step1Values>()
  const value = watch('creditingPeriodYears')
  const numeric = value === undefined || value === '' ? undefined : Number(value)
  const isPreset = numeric !== undefined && PRESET_PERIODS.some((y) => y === numeric)

  // Derived, not an effect: what the user last clicked, falling back to what the
  // stored value implies. "อื่น ๆ" therefore stays open while the box is empty
  // mid-retype, without a setState that would cascade a render.
  const [clicked, setClicked] = useState<'preset' | 'custom' | null>(null)
  const custom = clicked === 'custom' || (clicked === null && numeric !== undefined && !isPreset)

  const error = formState.errors.creditingPeriodYears?.message as string | undefined

  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-ink">
        ระยะเวลาคิดเครดิต<span className="ml-0.5 text-error">*</span>
      </legend>

      <div className="flex flex-col gap-2 sm:flex-row">
        {PRESET_PERIODS.map((years) => {
          const active = !custom && numeric === years
          return (
            <label
              key={years}
              className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-3 transition-colors focus-within:ring-2 focus-within:ring-primary ${
                active ? 'border-primary bg-primary/5' : 'border-line bg-panel hover:bg-surface'
              }`}
            >
              <input
                type="radio"
                name="crediting-period-choice"
                checked={active}
                onChange={() => {
                  setClicked('preset')
                  setValue('creditingPeriodYears', years, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              <span className={`text-sm ${active ? 'font-semibold text-ink' : 'text-ink'}`}>
                {years} ปี
              </span>
            </label>
          )
        })}

        <label
          className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-3 transition-colors focus-within:ring-2 focus-within:ring-primary ${
            custom ? 'border-primary bg-primary/5' : 'border-line bg-panel hover:bg-surface'
          }`}
        >
          <input
            type="radio"
            name="crediting-period-choice"
            checked={custom}
            onChange={() => setClicked('custom')}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          <span className={`text-sm ${custom ? 'font-semibold text-ink' : 'text-ink'}`}>
            อื่น ๆ (ระบุ)
          </span>
        </label>
      </div>

      {custom && (
        <div className="relative mt-2 max-w-[12rem]">
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            aria-label="ระยะเวลาคิดเครดิต (ปี)"
            aria-invalid={Boolean(error)}
            placeholder="เช่น 20"
            className={`h-10 w-full rounded-lg border bg-panel px-3 pr-10 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 ${
              error
                ? 'border-error-border focus:border-error focus:ring-error/15'
                : 'border-line focus:border-primary focus:ring-primary/15'
            }`}
            {...register('creditingPeriodYears', {
              setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
            })}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
            ปี
          </span>
        </div>
      )}

      {error ? (
        <p className="mt-1 text-xs text-error">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-ink-muted">
          7 และ 10 ปี คือค่าที่ใช้กันทั่วไปในภาคป่าไม้ — ยังต้องยืนยันกับ methodology ล่าสุดของ อบก.
        </p>
      )}
    </fieldset>
  )
}

/**
 * Fills the end date once, from start + period, and otherwise just says what it
 * would be.
 *
 * Deliberately never overwrites a date a human typed: whether a 7-year period
 * ending 2033-01-01 or 2032-12-31 is correct is a question for อบก., not for
 * this form to decide silently on a regulatory figure.
 */
function CreditingEndHint() {
  const { setValue, watch } = useFormContext<Step1Values>()
  const start = watch('creditingStartDate')
  const years = watch('creditingPeriodYears')
  const end = watch('creditingEndDate')

  const derived = derivedEnd(start, years)

  useEffect(() => {
    if (derived && !end) {
      setValue('creditingEndDate', derived, { shouldDirty: true, shouldValidate: true })
    }
  }, [derived, end, setValue])

  if (!derived) return null

  return (
    <p className="text-xs text-ink-muted">
      จากวันเริ่ม + {Number(years)} ปี จะได้ <span className="font-medium text-ink">{derived}</span>
      {end && end !== derived && ' — วันสิ้นสุดที่กรอกไว้ต่างจากนี้ ตรวจสอบอีกครั้งว่าตั้งใจ'}
    </p>
  )
}

/** `start` + `years`, as an ISO date, or undefined when either is unusable. */
function derivedEnd(start: unknown, years: unknown): string | undefined {
  if (typeof start !== 'string' || start === '') return undefined
  const n = Number(years)
  if (!Number.isInteger(n) || n < 1) return undefined

  const d = new Date(`${start}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return undefined
  d.setUTCFullYear(d.getUTCFullYear() + n)
  return d.toISOString().slice(0, 10)
}
