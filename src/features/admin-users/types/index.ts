/**
 * View-model types for the Admin Users domain, aligned with the Elysia
 * `/admin/admins` responses and the RBAC roles from ADR 0014.
 */
export type AdminRole = 'MASTER' | 'VERIFIER' | 'FINANCE' | 'GENERAL'

/** ADMINS.admin_status, surfaced as Active/Inactive in the UI. */
export type AdminStatus = 'Active' | 'Inactive'

export type AdminUser = {
  id: string
  username: string
  /** Role name (ROLES.role_name). */
  role: AdminRole
  status: AdminStatus
  /** ISO 8601, or null if the admin has never signed in. */
  lastLoginAt: string | null
  createdAt: string
}

/** Payload the invite form produces; id/timestamps are server-assigned. */
export type AdminInvite = {
  username: string
  role: AdminRole
}

export const ADMIN_ROLES: AdminRole[] = ['MASTER', 'VERIFIER', 'FINANCE', 'GENERAL']

/** Human-readable role context (RBAC, ADR 0014). Used in selectors + the table. */
export const ROLE_INFO: Record<AdminRole, { label: string; description: string }> = {
  MASTER: {
    label: 'Master',
    description: 'ดูแลระบบทั้งหมด จัดการผู้ดูแล และกำหนดราคาคาร์บอน',
  },
  VERIFIER: {
    label: 'Verifier',
    description: 'ตรวจรับรองข้อมูลการประเมินคาร์บอน (MRV)',
  },
  FINANCE: {
    label: 'Finance',
    description: 'ดูแลการเงิน การชำระเงิน และแพ็กเกจ',
  },
  GENERAL: {
    label: 'General',
    description: 'สิทธิ์พื้นฐานสำหรับเจ้าหน้าที่ทั่วไป',
  },
}
