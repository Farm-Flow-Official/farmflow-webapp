import type { Ok } from '@/lib/api/types'

/**
 * Project shapes, derived from the generated OpenAPI schema so the UI cannot
 * drift from the API. The upstream spec inlines every response, so these are
 * aliases rather than shared model imports.
 */
export type ProjectListItem = Ok<'/api/v1/admin/projects/', 'get'>[number]
export type ProjectDetail = Ok<'/api/v1/admin/projects/{id}', 'get'>
export type ProjectMemberFarm = ProjectDetail['farms'][number]
export type AllowedSpecies = ProjectDetail['allowedSpecies'][number]

export type ProjectStatus = ProjectListItem['status']
export type ImplementationMode = ProjectListItem['implementationMode']

/** Payload the create/edit form produces; ids and timestamps are server-assigned. */
export type ProjectInput = {
  projectCode: string
  nameTh: string
  nameEn?: string
  status?: ProjectStatus
  implementationMode?: ImplementationMode
  creditingPeriodYears?: number
  creditingStartDate?: string
  creditingEndDate?: string
  expectedReductionTco2eYr?: number
  totalInvestmentMillionThb?: number
  verifierOrgId?: string | null
}

/** Thai labels for the project lifecycle, shared by the table and the form. */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'ฉบับร่าง',
  open: 'เปิดรับสมัคร',
  active: 'ดำเนินการ',
  closed: 'ปิดโครงการ',
  archived: 'เก็บถาวร',
}

export const IMPLEMENTATION_MODE_LABELS: Record<ImplementationMode, string> = {
  standalone: 'แบบเดี่ยว',
  bundled: 'แบบควบรวม',
}

/** Size bands from the T-VER forestry rule; `undetermined` means no forecast yet. */
export const PROJECT_SCALE_LABELS: Record<ProjectListItem['projectScale'], string> = {
  undetermined: 'ยังไม่ระบุ',
  xsmall: 'เล็กมาก',
  small: 'เล็ก',
  large: 'ใหญ่',
}
