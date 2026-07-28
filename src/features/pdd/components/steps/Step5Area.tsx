'use client'

import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldGroup, SelectField, TextField } from '@/features/pdd/components/fields'
import { FileField } from '@/features/pdd/components/fields/FileField'
import { BoundaryPanel } from '@/features/pdd/components/BoundaryPanel'
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

        {/* Sample plots need a map to draw on, which the wizard does not have
            yet — declaring that plainly beats a control that cannot work. */}
        <section className="rounded-xl border border-dashed border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink">แปลงตัวอย่าง (Sample Plots)</h3>
          <p className="mt-1 text-xs text-ink-muted">
            {pdd.samplePlots.length > 0
              ? `บันทึกไว้แล้ว ${pdd.samplePlots.length} แปลง`
              : 'ยังไม่มีแปลงตัวอย่าง — จะเปิดให้วาดขอบเขตบนแผนที่พร้อมแผนติดตามผล (ขั้นตอนที่ 8)'}
          </p>
          {pdd.samplePlots.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {pdd.samplePlots.map((plot) => (
                <li
                  key={plot.id}
                  className="flex items-center justify-between rounded-lg border border-line bg-panel px-3 py-2 text-sm"
                >
                  <span className="text-ink">{plot.plotName}</span>
                  <span className="text-xs text-ink-secondary">
                    {plot.areaRai != null ? `${plot.areaRai.toFixed(2)} ไร่` : '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </StepFrame>
    </FormProvider>
  )
}
