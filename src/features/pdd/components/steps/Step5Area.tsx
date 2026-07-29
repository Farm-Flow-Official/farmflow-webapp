'use client'

import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldGroup, SelectField, TextField } from '@/features/pdd/components/fields'
import { FileField } from '@/features/pdd/components/fields/FileField'
import { BoundaryPanel } from '@/features/pdd/components/BoundaryPanel'
import { SamplePlotEditor } from '@/features/pdd/components/SamplePlotEditor'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { useStepAutosave } from '@/features/pdd/hooks/useStepAutosave'
import { useAttachmentSlot } from '@/features/pdd/hooks/useAttachmentSlot'
import { saveSection } from '@/features/pdd/actions/pddActions'
import { LAND_TENURE_OPTIONS, step5Draft, type Step5Values } from '@/features/pdd/schemas'
import type { StepProps } from '@/features/pdd/components/PddWizard'

const DOC_ACCEPT = 'application/pdf,image/png,image/jpeg,image/webp'

/**
 * Step 5 — the project's land.
 *
 * FarmFlow's core step: the boundary imported here is what member farms are
 * checked against, and the land-right documents are what the authority asks for
 * before it will credit any of it.
 */
export function Step5Area({ pdd, editable, onDirtyChange, onSaved, onError }: StepProps) {
  const router = useRouter()
  const saved = (pdd.content?.step5 ?? {}) as Partial<Step5Values>

  const landRights = useAttachmentSlot(pdd, 'land_right', { onSaved, onError })
  const powerOfAttorney = useAttachmentSlot(pdd, 'power_of_attorney', { onSaved, onError })
  const areaPhotos = useAttachmentSlot(pdd, 'area_photo', { onSaved, onError })

  const form = useForm<Step5Values>({
    resolver: zodResolver(step5Draft),
    mode: 'onBlur',
    defaultValues: {
      landTenureType: saved.landTenureType ?? '',
      landTenureNote: saved.landTenureNote ?? '',
    },
  })

  useStepAutosave<Step5Values>({
    form,
    editable,
    onDirtyChange,
    onSaved,
    onError,
    save: (values) => saveSection(pdd.id, 'step5', values as Record<string, unknown>),
  })

  return (
    <FormProvider {...form}>
      <StepFrame
        complete={Boolean(pdd.sectionProgress?.step5)}
        editable={editable}
        onToggleComplete={async (next) => {
          const res = await saveSection(
            pdd.id,
            'step5',
            form.getValues() as Record<string, unknown>,
            next,
          )
          if (res.ok) onSaved(res.data)
          else onError(res.error)
        }}
      >
        <BoundaryPanel
          pdd={pdd}
          editable={editable}
          // The import rewrites the project's geometry and every farm's
          // in/out verdict, so the server data is refetched rather than patched.
          onImported={() => router.refresh()}
          onError={onError}
        />

        <FieldGroup title="สิทธิการใช้ประโยชน์ที่ดิน">
          <SelectField<Step5Values>
            name="landTenureType"
            label="ประเภทสิทธิที่ดิน"
            required
            options={LAND_TENURE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <TextField<Step5Values>
            name="landTenureNote"
            label="รายละเอียดเพิ่มเติม"
            placeholder="เช่น เลขที่เอกสารสิทธิ์ หรือเงื่อนไขการเช่า"
          />

          <FileField
            label="หลักฐานสิทธิที่ดิน"
            required
            hint="โฉนด น.ส.3 ส.ป.ก. หรือหนังสืออนุญาตใช้พื้นที่ (PDF หรือรูปภาพ)"
            accept={DOC_ACCEPT}
            files={landRights.files}
            onUpload={landRights.upload}
            onRemove={landRights.remove}
            disabled={!editable}
          />

          <FileField
            label="หนังสือมอบอำนาจใช้ประโยชน์ที่ดิน"
            hint="แนบเฉพาะกรณีที่เจ้าของที่ดินมอบอำนาจให้ผู้พัฒนาโครงการ"
            accept={DOC_ACCEPT}
            files={powerOfAttorney.files}
            onUpload={powerOfAttorney.upload}
            onRemove={powerOfAttorney.remove}
            disabled={!editable}
          />
        </FieldGroup>

        <FieldGroup
          title="รูปภาพพื้นที่โครงการ"
          description="ไม่บังคับ แต่ช่วยให้ผู้ตรวจสอบเห็นสภาพพื้นที่จริง"
        >
          <FileField
            label="รูปภาพขอบเขตพื้นที่"
            accept="image/png,image/jpeg,image/webp"
            files={areaPhotos.files}
            onUpload={areaPhotos.upload}
            onRemove={areaPhotos.remove}
            disabled={!editable}
          />
        </FieldGroup>

        <SamplePlotEditor pdd={pdd} editable={editable} onError={onError} />
      </StepFrame>
    </FormProvider>
  )
}
