'use client'

import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import {
  FieldGroup,
  RadioField,
  TextField,
  TextAreaField,
  ReadOnlyField,
} from '@/features/pdd/components/fields'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { useStepAutosave } from '@/features/pdd/hooks/useStepAutosave'
import { saveSection } from '@/features/pdd/actions/pddActions'
import { step4Draft, type Step4Values } from '@/features/pdd/schemas'
import type { StepProps } from '@/features/pdd/components/PddWizard'

/**
 * Step 4 — registration conditions.
 *
 * Both halves are conditional: the double-counting details only matter if the
 * land is already registered somewhere, and the Additionality branch follows
 * project scale. Rendering the irrelevant branch would invite answers the
 * authority never asked for.
 */
export function Step4Conditions({ pdd, editable, onDirtyChange, onSaved, onError }: StepProps) {
  const saved = (pdd.content?.step4 ?? {}) as Partial<Step4Values>
  const scale = pdd.project.projectScale

  const form = useForm<Step4Values>({
    resolver: zodResolver(step4Draft),
    mode: 'onBlur',
    defaultValues: {
      doubleCounting: saved.doubleCounting ?? 'none',
      dcProjectName: saved.dcProjectName ?? '',
      dcMechanism: saved.dcMechanism ?? '',
      dcCreditPeriod: saved.dcCreditPeriod ?? '',
      // Only a `large` project must prove Additionality; the smaller bands are
      // on the Positive List. Defaulted, not locked — the author may override.
      additionalityRequirement:
        saved.additionalityRequirement ?? (scale === 'large' ? 'required' : 'not_required'),
      additionalityReasonNotReq: saved.additionalityReasonNotReq ?? '',
      additionalityResult: saved.additionalityResult,
      additionalityReason: saved.additionalityReason ?? '',
      projectStartDate: saved.projectStartDate ?? '',
      startDateReason: saved.startDateReason ?? '',
    },
  })

  useStepAutosave<Step4Values>({
    form,
    editable,
    onDirtyChange,
    onSaved,
    onError,
    save: (values) => saveSection(pdd.id, 'step4', values as Record<string, unknown>),
  })

  const doubleCounting = useWatch({ control: form.control, name: 'doubleCounting' })
  const additionality = useWatch({ control: form.control, name: 'additionalityRequirement' })

  return (
    <FormProvider {...form}>
      <StepFrame
        complete={Boolean(pdd.sectionProgress?.step4)}
        editable={editable}
        onToggleComplete={async (next) => {
          const res = await saveSection(
            pdd.id,
            'step4',
            form.getValues() as Record<string, unknown>,
            next,
          )
          if (res.ok) onSaved(res.data)
          else onError(res.error)
        }}
      >
        <FieldGroup title="1.3 การนับซ้ำ (Double Counting)">
          <RadioField<Step4Values>
            name="doubleCounting"
            label="เคยขึ้นทะเบียนกับมาตรฐานอื่นหรือไม่"
            required
            options={[
              { value: 'none', label: 'ไม่มี', hint: 'พื้นที่นี้ยังไม่เคยขึ้นทะเบียนที่ใด' },
              { value: 'yes', label: 'มี', hint: 'เช่น CDM, VCS, Gold Standard, REC' },
            ]}
          />

          {doubleCounting === 'yes' && (
            <div className="flex flex-col gap-4 rounded-lg border-l-2 border-warning bg-warning-bg/40 py-3 pl-4 pr-3">
              <TextField<Step4Values>
                name="dcProjectName"
                label="ชื่อโครงการที่ขึ้นทะเบียนไว้"
                required
              />
              <TextField<Step4Values> name="dcMechanism" label="ชื่อกลไก / มาตรฐาน" required />
              <TextField<Step4Values>
                name="dcCreditPeriod"
                label="ช่วงเวลาที่ขอรับรองเครดิต"
                placeholder="เช่น 2563–2570"
              />
            </div>
          )}
        </FieldGroup>

        <FieldGroup title="1.4 การพิสูจน์ส่วนเพิ่มเติม (Additionality)">
          <div className="flex items-start gap-2 rounded-lg bg-info-bg px-3.5 py-2.5 text-xs text-info">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>
              โครงการขนาดเล็กมากและเล็ก (≤ 60,000 tCO₂e/ปี) เข้าเกณฑ์ Positive List จึงไม่ต้องพิสูจน์
              — ค่าเริ่มต้นตั้งตามขนาดโครงการให้แล้ว แต่แก้ได้
            </span>
          </div>

          <RadioField<Step4Values>
            name="additionalityRequirement"
            label="ต้องพิสูจน์ Additionality หรือไม่"
            required
            options={[
              { value: 'not_required', label: 'ไม่ต้องพิสูจน์', hint: 'เข้าเกณฑ์ Positive List' },
              { value: 'required', label: 'ต้องพิสูจน์', hint: 'โครงการขนาดใหญ่' },
            ]}
          />

          {additionality === 'not_required' ? (
            <TextAreaField<Step4Values>
              name="additionalityReasonNotReq"
              label="เหตุผลที่ไม่ต้องพิสูจน์"
              required
              hint="เช่น เป็นโครงการขนาดเล็กที่อยู่ใน Positive List ของ อบก."
            />
          ) : (
            <div className="flex flex-col gap-4 rounded-lg border-l-2 border-warning bg-warning-bg/40 py-3 pl-4 pr-3">
              <RadioField<Step4Values>
                name="additionalityResult"
                label="ผลการพิสูจน์"
                required
                options={[
                  { value: 'has', label: 'มี Additionality' },
                  { value: 'none', label: 'ไม่มี Additionality' },
                ]}
              />
              <TextAreaField<Step4Values>
                name="additionalityReason"
                label="เหตุผลประกอบ"
                required
                hint="เช่น ระยะเวลาคืนทุนเกิน 3 ปีหากไม่มีรายได้จากคาร์บอนเครดิต"
              />
            </div>
          )}
        </FieldGroup>

        <FieldGroup title="1.5 ระยะเวลาการคิดเครดิต">
          <TextField<Step4Values>
            name="projectStartDate"
            label="วันเริ่มดำเนินโครงการ"
            required
            placeholder="YYYY-MM-DD"
            hint="ต้องสอดคล้องกับระเบียบวิธีที่เลือกใช้"
          />
          <TextAreaField<Step4Values>
            name="startDateReason"
            label="เหตุผลของวันเริ่มโครงการ"
            required
          />
          <ReadOnlyField
            label="ระยะเวลาคิดเครดิต"
            value={
              pdd.project.creditingPeriodYears ? `${pdd.project.creditingPeriodYears} ปี` : 'ยังไม่ระบุ'
            }
            hint="ตั้งค่าในขั้นตอนที่ 1"
          />
        </FieldGroup>
      </StepFrame>
    </FormProvider>
  )
}
