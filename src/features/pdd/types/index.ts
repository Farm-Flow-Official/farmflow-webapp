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
  | 'boundary_kmz'
  | 'area_photo'
  | 'qa_diagram'
  | 'monitoring_map'
  | 'appendix'

export type StepId = 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'step8'

export type StepMeta = {
  id: StepId
  /** Position in the official form, shown in the stepper. */
  number: number
  title: string
  /** Which part of `T-VER-S-F001-PDD` this step covers. */
  formRef: string
}

/** Every step of the official form, in its order. */
export const WIZARD_STEPS: StepMeta[] = [
  { id: 'step1', number: 1, title: 'ข้อมูลหลักโครงการ', formRef: 'หน้าปก ส่วนที่ 1' },
  { id: 'step2', number: 2, title: 'ผู้เกี่ยวข้อง & ผู้จัดทำ', formRef: 'ส่วนที่ 2' },
  { id: 'step3', number: 3, title: 'รายละเอียด & ขอบเขต', formRef: 'ส่วน 1.1–1.2' },
  { id: 'step4', number: 4, title: 'เงื่อนไขการขึ้นทะเบียน', formRef: 'ส่วน 1.3–1.5' },
  { id: 'step5', number: 5, title: 'พื้นที่โครงการ', formRef: 'ส่วน 1.6' },
  { id: 'step6', number: 6, title: 'ระเบียบวิธี & แหล่งปล่อย', formRef: 'ส่วนที่ 2' },
  { id: 'step7', number: 7, title: 'การคำนวณการลดก๊าซ', formRef: 'ส่วนที่ 3' },
  { id: 'step8', number: 8, title: 'แผนติดตามผล', formRef: 'ส่วนที่ 4' },
]

/**
 * A value that changes whenever anything the wizard renders has changed.
 *
 * `updatedAt` alone is not enough: sample plots hang off the *project*, and the
 * declared boundary is a project column, so a change to either leaves the
 * document's own timestamp untouched. Anything keyed on freshness — the
 * wizard's own copy of the document, the review panel's readiness check —
 * keys on this instead.
 */
export function pddFingerprint(pdd: PddDetail): string {
  return [
    pdd.id,
    pdd.version,
    pdd.status,
    pdd.updatedAt,
    pdd.contacts.length,
    pdd.attachments.length,
    pdd.samplePlots.length,
    pdd.project.declaredAreaRai ?? '',
  ].join('|')
}

/** A PDD that has been submitted is a record of what was filed, not a draft. */
export function isEditable(pdd: PddDetail): boolean {
  return pdd.status === 'draft'
}
