/**
 * View-model types for the Admin Users domain, aligned with the Elysia
 * `/admin/admins` responses and the RBAC roles from ADR 0014.
 */
export type AdminRole = 'MASTER' | 'VERIFIER' | 'PROJECT_DEV' | 'FINANCE' | 'GENERAL'

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

/**
 * Payload the create form produces; id/timestamps are server-assigned.
 *
 * `username` is the *bare* handle — the API applies the role's prefix, so the
 * form never has to know that a verifier becomes `verify.somchai`.
 */
export type AdminInvite = {
  username: string
  role: AdminRole
  /** Accrediting body — required for VERIFIER, ignored otherwise. */
  orgId?: string
  /** Leave blank to have the server generate one. */
  password?: string
}

/** Roles whose accounts belong to an external accrediting body (ADR 0014). */
export const ROLES_NEEDING_ORG: AdminRole[] = ['VERIFIER']

/** The username prefix each role's accounts carry (ADMIN-USERS-02). */
export const ROLE_USERNAME_PREFIX: Partial<Record<AdminRole, string>> = {
  MASTER: 'admin',
  VERIFIER: 'verify',
  PROJECT_DEV: 'dev',
  FINANCE: 'finance',
}

export const ADMIN_ROLES: AdminRole[] = [
  'MASTER',
  'VERIFIER',
  'PROJECT_DEV',
  'FINANCE',
  'GENERAL',
]

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
  PROJECT_DEV: {
    label: 'Project Developer',
    description: 'จัดทำโครงการและเอกสาร PDD (แก้ไข/ยื่นได้ แต่ไม่แตะผู้ดูแลหรือราคาคาร์บอน)',
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
