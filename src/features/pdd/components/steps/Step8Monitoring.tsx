'use client'

import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { FieldGroup, TextField, TextAreaField } from '@/features/pdd/components/fields'
import { FileField } from '@/features/pdd/components/fields/FileField'
import { RepeatableSection } from '@/features/pdd/components/fields/RepeatableSection'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { useStepAutosave } from '@/features/pdd/hooks/useStepAutosave'
import { useAttachmentSlot } from '@/features/pdd/hooks/useAttachmentSlot'
import { saveSection } from '@/features/pdd/actions/pddActions'
import { step8Draft, type Step8Values } from '@/features/pdd/schemas'
import type { StepProps } from '@/features/pdd/components/PddWizard'

const DOC_ACCEPT = 'application/pdf,image/png,image/jpeg,image/webp'

/** What FarmFlow already captures per tree — offered so the table starts real. */
const FARMFLOW_MONITORED = [
  {
    param: 'DBH',
    unit: 'ซม.',
    meaning: 'เส้นผ่านศูนย์กลางเพียงอก',
    source: 'FarmFlow — วัดเส้นรอบวงในแอปมือถือ',
    method: 'เกษตรกรวัดเส้นรอบวงและถ่ายภาพพร้อมพิกัด GPS ระบบคำนวณ DBH = เส้นรอบวง ÷ π',
  },
  {
    param: 'ความสูง',
    unit: 'ม.',
    meaning: 'ความสูงต้นไม้',
    source: 'FarmFlow — บันทึกในแอปมือถือ',
    method: 'บันทึกพร้อมภาพถ่ายในรอบการประเมินแต่ละครั้ง',
  },
  {
    param: 'ชนิดพันธุ์',
    unit: '—',
    meaning: 'ชนิดพันธุ์ไม้ที่ปลูก',
    source: 'FarmFlow — ข้อมูลการเพาะปลูกของแปลง',
    method: 'ระบุตอนขึ้นทะเบียนแปลง และจำกัดตามชนิดพันธุ์ที่โครงการอนุญาต',
  },
  {
    param: 'จำนวนต้นต่อแปลง',
    unit: 'ต้น/ไร่',
    meaning: 'ความหนาแน่นการปลูก',
    source: 'FarmFlow — ข้อมูลการเพาะปลูกของแปลง',
    method: 'ระบุตอนขึ้นทะเบียนแปลง และตรวจสอบกับจำนวนภาพที่บันทึกจริง',
  },
]

/**
 * Step 8 — the monitoring plan.
 *
 * The monitored-parameter table has a one-click starting point because
 * FarmFlow already captures exactly these four per tree; typing them from the
 * manual would just be transcription of what the platform does.
 */
export function Step8Monitoring({ pdd, editable, onDirtyChange, onSaved, onError }: StepProps) {
  const saved = (pdd.content?.step8 ?? {}) as Partial<Step8Values>
  const qaDiagrams = useAttachmentSlot(pdd, 'qa_diagram', { onSaved, onError })
  const monitoringMaps = useAttachmentSlot(pdd, 'monitoring_map', { onSaved, onError })
  const appendix = useAttachmentSlot(pdd, 'appendix', { onSaved, onError })

  const form = useForm<Step8Values>({
    resolver: zodResolver(step8Draft),
    mode: 'onBlur',
    defaultValues: {
      monitoringOrgStructure: saved.monitoringOrgStructure ?? '',
      monitoringDataProcess: saved.monitoringDataProcess ?? '',
      fixedParams: saved.fixedParams ?? [],
      monitoredParams: saved.monitoredParams ?? [],
    },
  })

  useStepAutosave<Step8Values>({
    form,
    editable,
    onDirtyChange,
    onSaved,
    onError,
    save: (values) => saveSection(pdd.id, 'step8', values as Record<string, unknown>),
  })

  const monitored = useWatch({ control: form.control, name: 'monitoredParams' }) ?? []

  return (
    <FormProvider {...form}>
      <StepFrame
        complete={Boolean(pdd.sectionProgress?.step8)}
        editable={editable}
        onToggleComplete={async (next) => {
          const res = await saveSection(
            pdd.id,
            'step8',
            form.getValues() as Record<string, unknown>,
            next,
          )
          if (res.ok) onSaved(res.data)
          else onError(res.error)
        }}
      >
        <FieldGroup title="4.1 สรุปแนวทางการติดตามผล">
          <TextAreaField<Step8Values>
            name="monitoringOrgStructure"
            label="โครงสร้างหน่วยงานและหน้าที่รับผิดชอบ"
            required
          />
          <TextAreaField<Step8Values>
            name="monitoringDataProcess"
            label="ขั้นตอนการจัดเก็บ บันทึก คำนวณ และรายงานข้อมูล"
            required
            rows={5}
            hint="ต้องสอดคล้องกับระเบียบวิธีที่เลือกในขั้นตอนที่ 6"
          />

          <FileField
            label="แผนผังขั้นตอนและการควบคุมคุณภาพ (QA)"
            accept={DOC_ACCEPT}
            files={qaDiagrams.files}
            onUpload={qaDiagrams.upload}
            onRemove={qaDiagrams.remove}
            disabled={!editable}
          />
          <FileField
            label="ผังจุดตรวจวัดและตัวแปรที่จัดเก็บ"
            required
            hint="ควรสอดคล้องกับแปลงตัวอย่างที่ระบุในขั้นตอนที่ 5"
            accept={DOC_ACCEPT}
            files={monitoringMaps.files}
            onUpload={monitoringMaps.upload}
            onRemove={monitoringMaps.remove}
            disabled={!editable}
          />
        </FieldGroup>

        <FieldGroup
          title="4.2 พารามิเตอร์ที่ไม่ต้องติดตามผล"
          description="ค่าคงที่ที่ใช้ตลอดโครงการ เช่น R, CF, 44/12"
        >
          <RepeatableSection<Step8Values>
            name="fixedParams"
            itemLabel={(i) => `พารามิเตอร์คงที่ที่ ${i}`}
            addLabel="เพิ่มพารามิเตอร์คงที่"
            emptyHint="ยังไม่ได้ระบุพารามิเตอร์คงที่"
            defaultItem={{ param: '', value: '', unit: '', meaning: '', source: '' }}
          >
            {(index) => (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField<Step8Values>
                    name={`fixedParams.${index}.param` as never}
                    label="พารามิเตอร์"
                  />
                  <TextField<Step8Values>
                    name={`fixedParams.${index}.value` as never}
                    label="ค่าที่ใช้"
                  />
                  <TextField<Step8Values>
                    name={`fixedParams.${index}.unit` as never}
                    label="หน่วย"
                  />
                </div>
                <TextField<Step8Values>
                  name={`fixedParams.${index}.meaning` as never}
                  label="ความหมาย"
                />
                <TextField<Step8Values>
                  name={`fixedParams.${index}.source` as never}
                  label="แหล่งข้อมูล"
                />
              </>
            )}
          </RepeatableSection>
        </FieldGroup>

        <FieldGroup
          title="4.3 พารามิเตอร์ที่ต้องติดตามผล"
          description="ข้อมูลที่เก็บทุกรอบการประเมิน"
        >
          {editable && monitored.length === 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-info-bg px-4 py-3">
              <p className="flex items-start gap-2 text-xs text-info">
                <Info className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                FarmFlow เก็บ DBH ความสูง ชนิดพันธุ์ และจำนวนต้น อยู่แล้วทุกรอบการประเมิน
              </p>
              <button
                type="button"
                onClick={() => form.setValue('monitoredParams', FARMFLOW_MONITORED, { shouldDirty: true })}
                className="shrink-0 rounded-lg border border-info/30 bg-panel px-3 py-1.5 text-xs font-semibold text-info transition-colors hover:bg-info-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info"
              >
                เติมตามที่ระบบเก็บจริง
              </button>
            </div>
          )}

          <RepeatableSection<Step8Values>
            name="monitoredParams"
            itemLabel={(i) => `พารามิเตอร์ติดตามที่ ${i}`}
            addLabel="เพิ่มพารามิเตอร์ติดตาม"
            emptyHint="ยังไม่ได้ระบุพารามิเตอร์ที่ต้องติดตามผล"
            defaultItem={{ param: '', unit: '', meaning: '', source: '', method: '' }}
          >
            {(index) => (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField<Step8Values>
                    name={`monitoredParams.${index}.param` as never}
                    label="พารามิเตอร์"
                  />
                  <TextField<Step8Values>
                    name={`monitoredParams.${index}.unit` as never}
                    label="หน่วย"
                  />
                  <TextField<Step8Values>
                    name={`monitoredParams.${index}.meaning` as never}
                    label="ความหมาย"
                  />
                </div>
                <TextField<Step8Values>
                  name={`monitoredParams.${index}.source` as never}
                  label="แหล่งข้อมูล"
                />
                <TextAreaField<Step8Values>
                  name={`monitoredParams.${index}.method` as never}
                  label="วิธีการติดตามผล"
                  rows={2}
                />
              </>
            )}
          </RepeatableSection>
        </FieldGroup>

        <FieldGroup title="ภาคผนวก" description="เอกสารและหลักฐานประกอบอื่น ๆ">
          <FileField
            label="เอกสารประกอบเพิ่มเติม"
            accept={DOC_ACCEPT}
            files={appendix.files}
            onUpload={appendix.upload}
            onRemove={appendix.remove}
            disabled={!editable}
          />
        </FieldGroup>
      </StepFrame>
    </FormProvider>
  )
}
