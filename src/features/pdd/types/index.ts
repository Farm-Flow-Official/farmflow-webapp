import type { Ok } from '@/lib/api/types'

/** The PDD document with its children, as the wizard consumes it. */
export type PddDetail = Ok<'/api/v1/admin/projects/{id}/pdd', 'get'>
export type PddContact = PddDetail['contacts'][number]
export type PddAttachment = PddDetail['attachments'][number]
export type PddSamplePlot = PddDetail['samplePlots'][number]
export type PddReconciliation = PddDetail['reconciliation']

/** Attachment slots the wizard renders, keyed to the form's requirements. */
export type AttachmentSlot =
  | 'boundary_image'
  | 'land_right'
  | 'power_of_attorney'
  | 'boundary_kmz'
  | 'area_photo'
  | 'qa_diagram'
  | 'monitoring_map'
  | 'appendix'

export type StepId = 'step1' | 'step2' | 'step3' | 'step4' | 'step5'

export type StepMeta = {
  id: StepId
  /** Position in the official form, shown in the stepper. */
  number: number
  title: string
  /** Which part of `T-VER-S-F001-PDD` this step covers. */
  formRef: string
}

/**
 * Steps 1–5. Steps 6–8 (methodology, calculation, monitoring) arrive with the
 * ex-ante forecast engine; the stepper shows only what can actually be filled.
 */
export const WIZARD_STEPS: StepMeta[] = [
  { id: 'step1', number: 1, title: 'ข้อมูลหลักโครงการ', formRef: 'หน้าปก ส่วนที่ 1' },
  { id: 'step2', number: 2, title: 'ผู้เกี่ยวข้อง & ผู้จัดทำ', formRef: 'ส่วนที่ 2' },
  { id: 'step3', number: 3, title: 'รายละเอียด & ขอบเขต', formRef: 'ส่วน 1.1–1.2' },
  { id: 'step4', number: 4, title: 'เงื่อนไขการขึ้นทะเบียน', formRef: 'ส่วน 1.3–1.5' },
  { id: 'step5', number: 5, title: 'พื้นที่โครงการ', formRef: 'ส่วน 1.6' },
]

/** A PDD that has been submitted is a record of what was filed, not a draft. */
export function isEditable(pdd: PddDetail): boolean {
  return pdd.status === 'draft'
}
