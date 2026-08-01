/**
 * View-model types for the Farmer domain (admin view), aligned with the Elysia
 * `/admin/farmers` responses. The API supplies PII (or a non-PII fallback per
 * ADR 0013), so there is no separate `username`/mock-flag handling here.
 */
import type { BadgeVariant } from '@/components/ui/badge'

export type FarmerAccountStatus = 'Active' | 'Suspended'

export type Farmer = {
  id: string
  /** Personal name, or a non-PII fallback (ADR 0013) — always present. */
  fullName: string
  /** **Masked** (`08x-xxx-5678`). The real value needs an audited reveal. */
  phone: string | null
  /** **Masked** (`s•••i@gmail.com`). The real value needs an audited reveal. */
  email: string | null
  /** Whether any contact detail exists at all, without saying what it is. */
  hasContact: boolean
  accountStatus: FarmerAccountStatus
  farmsCount: number
  registeredAt: string
}

/**
 * Where a farm sits in the admin approval lifecycle (ADMIN-POWER-01).
 *
 * `draft` and `pending` both mean "awaiting a decision" — the farmer app has no
 * submit step yet, so every farm a farmer registers arrives as `draft`.
 */
export type FarmStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'suspended'

export type Farm = {
  id: string
  name: string
  /** Farm cover photo file id (public); null when the farmer set none. */
  coverPhotoFileId: string | null
  /** Province name; null when unset. */
  province: string | null
  areaRai: number | null
  /** Crop/species name; null when there is no agricultural data yet. */
  cropType: string | null
  farmStatus: FarmStatus
  /** The T-VER project this farm is registered to; null when it has joined none. */
  projectId: string | null
  projectName: string | null
  /** Carbon estimate (kg CO₂e); null until a credit session is issued. */
  carbonKgCo2e: number | null
  registeredAt: string
}

/** Thai labels + badge variant for each lifecycle state. Single source for the UI. */
export const FARM_STATUS_INFO: Record<FarmStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: 'รอตรวจสอบ', variant: 'pending' },
  pending: { label: 'รอตรวจสอบ', variant: 'pending' },
  active: { label: 'อนุมัติแล้ว', variant: 'verified' },
  rejected: { label: 'ไม่อนุมัติ', variant: 'rejected' },
  suspended: { label: 'ระงับการใช้งาน', variant: 'rejected' },
}

/** The states an admin may still act on from the queue. */
export const FARM_REVIEWABLE: FarmStatus[] = ['draft', 'pending']

export type FarmerDetail = Farmer & {
  farms: Farm[]
  totalCarbonKgCo2e: number | null
  estimatedValueThb: number | null
}
