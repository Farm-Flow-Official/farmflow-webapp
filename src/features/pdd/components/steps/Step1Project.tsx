'use client'

import { FormProvider, useForm } from 'react-hook-form'
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
          <RadioField<Step1Values>
            name="creditingPeriodYears"
            label="ระยะเวลาคิดเครดิต"
            required
            options={[
              { value: '7', label: '7 ปี' },
              { value: '10', label: '10 ปี' },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField<Step1Values> name="creditingStartDate" label="วันเริ่มคิดเครดิต" required />
            <DateField<Step1Values> name="creditingEndDate" label="วันสิ้นสุดคิดเครดิต" required />
          </div>
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
