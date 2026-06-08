/**
 * API contract for the Admin Users domain, aligned with **ERD v3 (Zero-PII)** —
 * the source of truth for BETA. Admins are identified by `username` only; the
 * schema deliberately carries no name/email PII. When the admin endpoints land,
 * only the service layer changes.
 *
 * Mapped from ERD: ADMINS (admin_id, username, role_id, admin_status,
 * last_login, created_at) joined to ROLES.role_name.
 */
export type AdminRole = 'SuperAdmin' | 'Auditor' | 'Verifier'

/** ADMINS.admin_status — note ERD uses Active/Inactive (not "Suspended"). */
export type AdminStatus = 'Active' | 'Inactive'

export type AdminUser = {
  /** admin_id. */
  id: string
  username: string
  /** Denormalised from role_id → ROLES.role_name. */
  role: AdminRole
  status: AdminStatus
  /** ISO 8601, or null if the admin has never signed in (e.g. freshly invited). */
  lastLoginAt: string | null
  createdAt: string
}

/** Payload the invite form produces; id/timestamps are server-assigned. */
export type AdminInvite = {
  username: string
  role: AdminRole
}

export const ADMIN_ROLES: AdminRole[] = ['SuperAdmin', 'Auditor', 'Verifier']

/** Human-readable role context (from business req §RBAC). Used in selectors. */
export const ROLE_INFO: Record<AdminRole, { label: string; description: string }> = {
  SuperAdmin: {
    label: 'Super Admin',
    description: 'ดูแลระบบทั้งหมด จัดการผู้ดูแล และกำหนดราคาคาร์บอน',
  },
  Auditor: {
    label: 'Auditor',
    description: 'ตรวจสอบบันทึกกิจกรรมและความถูกต้องของข้อมูล',
  },
  Verifier: {
    label: 'Verifier',
    description: 'ตรวจรับรองข้อมูลการประเมินคาร์บอน (MRV)',
  },
}
