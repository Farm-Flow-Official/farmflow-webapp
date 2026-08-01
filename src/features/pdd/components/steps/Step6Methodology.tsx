'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldGroup, SelectField, TextField, TextAreaField } from '@/features/pdd/components/fields'
import { RepeatableSection } from '@/features/pdd/components/fields/RepeatableSection'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { useStepAutosave } from '@/features/pdd/hooks/useStepAutosave'
import { saveSection } from '@/features/pdd/actions/pddActions'
import {
  CARBON_POOL_OPTIONS,
  SCOPE_OPTIONS,
  step6Draft,
  type Step6Values,
} from '@/features/pdd/schemas'
import type { StepProps } from '@/features/pdd/components/PddWizard'

/** The forestry tool FarmFlow's carbon engine already implements (ADR 0016). */
const DEFAULT_METHODOLOGY = {
  code: 'T-VER-S-TOOL-01-01',
  version: 'v02',
  name: 'เครื่องมือคำนวณการกักเก็บคาร์บอนของต้นไม้ ภาคป่าไม้',
}

const scopeOptions = SCOPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const poolOptions = CARBON_POOL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

/**
 * Step 6 — methodology, applicability, emission sources and carbon pools.
 *
 * Four repeatable tables. The methodology defaults to the T-VER forestry tool
 * the platform's own engine implements, so the common case is confirmed rather
 * than typed from the manual.
 */
export function Step6Methodology({ pdd, editable, onDirtyChange, onSaved, onError }: StepProps) {
  const saved = (pdd.content?.step6 ?? {}) as Partial<Step6Values>

  const form = useForm<Step6Values>({
    resolver: zodResolver(step6Draft),
    mode: 'onBlur',
    defaultValues: {
      methodologies: saved.methodologies?.length ? saved.methodologies : [DEFAULT_METHODOLOGY],
      applicabilityDesc: saved.applicabilityDesc ?? '',
      applicabilityReason: saved.applicabilityReason ?? '',
      conditions: saved.conditions ?? [],
      emissionSources: saved.emissionSources ?? [],
      carbonPools: saved.carbonPools ?? [],
    },
  })

  useStepAutosave<Step6Values>({
    form,
    editable,
    onDirtyChange,
    onSaved,
    onError,
    save: (values) => saveSection(pdd.id, 'step6', values as Record<string, unknown>),
  })

  return (
    <FormProvider {...form}>
      <StepFrame
        complete={Boolean(pdd.sectionProgress?.step6)}
        editable={editable}
        onToggleComplete={async (next) => {
          const res = await saveSection(
            pdd.id,
            'step6',
            form.getValues() as Record<string, unknown>,
            next,
          )
          if (res.ok) onSaved(res.data)
          else onError(res.error)
        }}
      >
        <FieldGroup
          title="2.1 ระเบียบวิธีและเครื่องมือคำนวณ"
          description="ตั้งค่าเริ่มต้นเป็นเครื่องมือภาคป่าไม้ที่ระบบใช้คำนวณคาร์บอนอยู่แล้ว"
        >
          <RepeatableSection<Step6Values>
            name="methodologies"
            itemLabel={(i) => `ระเบียบวิธีลำดับที่ ${i}`}
            addLabel="เพิ่มระเบียบวิธี"
            min={1}
            defaultItem={{ code: '', version: '', name: '' }}
          >
            {(index) => (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<Step6Values>
                    name={`methodologies.${index}.code` as never}
                    label="รหัส"
                    required
                  />
                  <TextField<Step6Values>
                    name={`methodologies.${index}.version` as never}
                    label="เวอร์ชั่น"
                  />
                </div>
                <TextField<Step6Values>
                  name={`methodologies.${index}.name` as never}
                  label="ชื่อระเบียบวิธี / เครื่องมือ"
                  required
                />
              </>
            )}
          </RepeatableSection>
        </FieldGroup>

        <FieldGroup title="2.2 เงื่อนไขของกิจกรรมโครงการ">
          <TextAreaField<Step6Values>
            name="applicabilityDesc"
            label="ลักษณะกิจกรรมที่เข้าข่าย (Applicability)"
            required
          />
          <TextAreaField<Step6Values>
            name="applicabilityReason"
            label="เหตุผลที่เข้าข่าย"
            required
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">เงื่อนไขกิจกรรม (Project Conditions)</p>
            <RepeatableSection<Step6Values>
              name="conditions"
              itemLabel={(i) => `เงื่อนไขที่ ${i}`}
              addLabel="เพิ่มเงื่อนไข"
              emptyHint="ยังไม่ได้ระบุเงื่อนไขกิจกรรม"
              defaultItem={{ condition: '', reason: '' }}
            >
              {(index) => (
                <>
                  <TextAreaField<Step6Values>
                    name={`conditions.${index}.condition` as never}
                    label="เงื่อนไข"
                    rows={2}
                  />
                  <TextAreaField<Step6Values>
                    name={`conditions.${index}.reason` as never}
                    label="เหตุผล"
                    rows={2}
                  />
                </>
              )}
            </RepeatableSection>
          </div>
        </FieldGroup>

        <FieldGroup
          title="2.3 แหล่งปล่อยก๊าซเรือนกระจก"
          description="ระบุแยกตามขอบเขต กรณีฐาน / โครงการ / การรั่วไหล"
        >
          <RepeatableSection<Step6Values>
            name="emissionSources"
            itemLabel={(i) => `แหล่งปล่อยที่ ${i}`}
            addLabel="เพิ่มแหล่งปล่อย"
            emptyHint="โครงการปลูกป่ามักไม่มีแหล่งปล่อยที่ต้องนับ — เว้นว่างได้"
            defaultItem={{ scope: 'project', sourceName: '', gasType: 'CO2', detail: '' }}
          >
            {(index) => (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <SelectField<Step6Values>
                    name={`emissionSources.${index}.scope` as never}
                    label="ขอบเขต"
                    options={scopeOptions}
                  />
                  <TextField<Step6Values>
                    name={`emissionSources.${index}.sourceName` as never}
                    label="แหล่งปล่อย"
                  />
                  <TextField<Step6Values>
                    name={`emissionSources.${index}.gasType` as never}
                    label="ชนิดก๊าซ"
                    placeholder="CO2, CH4, N2O"
                  />
                </div>
                <TextAreaField<Step6Values>
                  name={`emissionSources.${index}.detail` as never}
                  label="รายละเอียดกิจกรรม"
                  rows={2}
                />
              </>
            )}
          </RepeatableSection>
        </FieldGroup>

        <FieldGroup
          title="2.4 แหล่งสะสมคาร์บอน (Carbon Pools)"
          description="ระบบคำนวณ ABG และ BLG อยู่แล้วผ่านค่า R ของแต่ละชนิดพันธุ์"
        >
          <RepeatableSection<Step6Values>
            name="carbonPools"
            itemLabel={(i) => `แหล่งสะสมที่ ${i}`}
            addLabel="เพิ่มแหล่งสะสม"
            emptyHint="ยังไม่ได้ระบุแหล่งสะสมคาร์บอน"
            defaultItem={{ scope: 'project', poolType: 'ABG', detail: '' }}
          >
            {(index) => (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField<Step6Values>
                    name={`carbonPools.${index}.scope` as never}
                    label="ขอบเขต"
                    options={scopeOptions}
                  />
                  <SelectField<Step6Values>
                    name={`carbonPools.${index}.poolType` as never}
                    label="แหล่งสะสม"
                    options={poolOptions}
                  />
                </div>
                <TextAreaField<Step6Values>
                  name={`carbonPools.${index}.detail` as never}
                  label="รายละเอียด"
                  rows={2}
                />
              </>
            )}
          </RepeatableSection>
        </FieldGroup>
      </StepFrame>
    </FormProvider>
  )
}
