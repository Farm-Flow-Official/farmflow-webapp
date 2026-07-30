'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldGroup, TextAreaField } from '@/features/pdd/components/fields'
import { FileField } from '@/features/pdd/components/fields/FileField'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { useStepAutosave } from '@/features/pdd/hooks/useStepAutosave'
import { saveSection } from '@/features/pdd/actions/pddActions'
import { useAttachmentSlot } from '@/features/pdd/hooks/useAttachmentSlot'
import { step3Draft, type Step3Values } from '@/features/pdd/schemas'
import type { StepProps } from '@/features/pdd/components/PddWizard'

/**
 * Step 3 — activities and scope.
 *
 * The official form has one enormous free-text box here; splitting it into the
 * questions it actually asks is what makes it fillable. The PDF export puts
 * them back together in the authority's layout.
 */
export function Step3Details({ pdd, editable, onDirtyChange, onSaved, onError }: StepProps) {
  const saved = (pdd.content?.step3 ?? {}) as Partial<Step3Values>
  const boundaryImages = useAttachmentSlot(pdd, 'boundary_image', { onSaved, onError })

  const form = useForm<Step3Values>({
    resolver: zodResolver(step3Draft),
    mode: 'onBlur',
    defaultValues: {
      objective: saved.objective ?? '',
      orgBackground: saved.orgBackground ?? '',
      preProjectCondition: saved.preProjectCondition ?? '',
      projectActivities: saved.projectActivities ?? '',
      materialsSource: saved.materialsSource ?? '',
      expectedReductionNarrative: saved.expectedReductionNarrative ?? '',
      technologyDesc: saved.technologyDesc ?? '',
      operationScope: saved.operationScope ?? '',
    },
  })

  useStepAutosave<Step3Values>({
    form,
    editable,
    onDirtyChange,
    onSaved,
    onError,
    save: (values) => saveSection(pdd.id, 'step3', values as Record<string, unknown>),
  })

  return (
    <FormProvider {...form}>
      <StepFrame
        complete={Boolean(pdd.sectionProgress?.step3)}
        editable={editable}
        onToggleComplete={async (next) => {
          const res = await saveSection(
            pdd.id,
            'step3',
            form.getValues() as Record<string, unknown>,
            next,
          )
          if (res.ok) onSaved(res.data)
          else onError(res.error)
        }}
      >
        <FieldGroup title="1.1 รายละเอียดและกิจกรรมของโครงการ">
          <TextAreaField<Step3Values> name="objective" label="วัตถุประสงค์ของโครงการ" required />
          <TextAreaField<Step3Values>
            name="orgBackground"
            label="รายละเอียดหน่วยงาน/ชุมชนที่เกี่ยวข้อง"
            required
          />
          <TextAreaField<Step3Values>
            name="preProjectCondition"
            label="ลักษณะและการดำเนินงานก่อนมีโครงการ T-VER"
            required
            hint="คือกรณีฐาน (baseline) ที่ใช้เปรียบเทียบปริมาณการลดก๊าซ"
          />
          <TextAreaField<Step3Values>
            name="projectActivities"
            label="กิจกรรมลดก๊าซเรือนกระจกของโครงการ"
            required
            rows={5}
            hint="ภาคป่าไม้: ระบุชนิดพันธุ์ จำนวนกล้า พื้นที่ปลูก และวิธีบำรุงรักษา"
          />
          <TextAreaField<Step3Values>
            name="materialsSource"
            label="วัตถุดิบ / แหล่งที่มา / ปริมาณ"
            hint="เช่น แหล่งกล้าไม้ที่ใช้ในโครงการ"
          />
          <TextAreaField<Step3Values>
            name="expectedReductionNarrative"
            label="ปริมาณก๊าซที่คาดว่าจะลดได้ตลอดช่วงคิดเครดิต"
            required
          />
        </FieldGroup>

        <FieldGroup title="1.2 ขอบเขตการดำเนินโครงการ">
          <TextAreaField<Step3Values>
            name="technologyDesc"
            label="เทคโนโลยี / อุปกรณ์หลัก"
            hint="โครงการภาคป่าไม้อาจระบุน้อยหรือ N.A."
          />
          <TextAreaField<Step3Values>
            name="operationScope"
            label="ขอบเขตการดำเนินงานและนิติบุคคลที่เกี่ยวข้อง"
            required
          />

          <FileField
            label="ภาพ Project Boundary / แผนผังโครงการ"
            required
            hint="รองรับ PNG, JPG หรือ PDF"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            files={boundaryImages.files}
            onUpload={boundaryImages.upload}
            onRemove={boundaryImages.remove}
            disabled={!editable}
          />
        </FieldGroup>
      </StepFrame>
    </FormProvider>
  )
}
