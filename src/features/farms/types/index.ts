import type { FarmStatus } from '@/features/farmers/types'

/**
 * The admin's view of a farm in the approval queue, aligned with
 * `/admin/farms` (ADMIN-POWER-01).
 */
export type AdminFarm = {
  id: string
  farmName: string
  farmStatus: FarmStatus
  ownerUserId: string
  /** Personal name, or a non-PII fallback (ADR 0013). */
  ownerName: string
  ownerAccountStatus: 'Active' | 'Suspended'
  projectId: string | null
  projectName: string | null
  /** Null until province collection exists in the farmer app. */
  province: string | null
  declaredAreaRai: number | null
  calculatedAreaRai: number | null
  /** Declared vs PostGIS-calculated area diverge by more than 15% (ADR 0008). */
  areaDiscrepancyFlag: boolean
  createdAt: string
}

/** One page of farms plus the unpaginated total the pager counts against. */
export type AdminFarmPage = {
  rows: AdminFarm[]
  total: number
  limit: number
  offset: number
}

/** A single approve / reject / suspend, with who did it and why. */
export type FarmStatusEvent = {
  oldStatus: string | null
  newStatus: string
  reason: string | null
  changedBy: string | null
  changedByType: string
  /** Admin username, when an admin was the actor. */
  changedByLabel: string | null
  createdAt: string
}

/** What an admin may move a farm to. */
export type FarmDecision = 'active' | 'rejected' | 'suspended'

export const FARM_DECISION_INFO: Record<
  FarmDecision,
  { label: string; needsReason: boolean; tone: 'primary' | 'danger' }
> = {
  active: { label: 'อนุมัติ', needsReason: false, tone: 'primary' },
  rejected: { label: 'ไม่อนุมัติ', needsReason: true, tone: 'danger' },
  suspended: { label: 'ระงับการใช้งาน', needsReason: true, tone: 'danger' },
}
