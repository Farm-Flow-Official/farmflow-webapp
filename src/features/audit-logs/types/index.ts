/**
 * API contract for the Audit Log domain, aligned with **ERD v3** AUDIT_LOGS —
 * an append-only event table. Read-only: no create/update/delete from the UI.
 */
export type AuditActorType = 'USER' | 'ADMIN' | 'SYSTEM'
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT'

/** A single before/after snapshot payload (ERD: old_data / new_data json). */
export type AuditSnapshot = Record<string, string | number | boolean | null>

export type AuditLog = {
  /** log_id — append-only. */
  id: string
  /** user_id or admin_id of the actor; null for some system events. */
  actorId: string | null
  /**
   * Human-readable actor name (e.g. admin username), enriched by the API via a
   * JOIN to ADMINS. Null when there's no friendly name (USER/SYSTEM). The raw
   * `actorId` stays the source of truth.
   */
  actorLabel?: string | null
  actorType: AuditActorType
  action: AuditAction
  /** Affected table (ERD: table_name). */
  tableName: string
  /** Affected record PK (ERD: record_id). */
  recordId: string
  /** Snapshot before the change — null for CREATE. */
  oldData: AuditSnapshot | null
  /** Snapshot after the change — null for DELETE. */
  newData: AuditSnapshot | null
  /** Immutable event time (ERD: created_at). */
  createdAt: string
}

export const AUDIT_ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT']
export const AUDIT_ACTOR_TYPES: AuditActorType[] = ['ADMIN', 'USER', 'SYSTEM']
