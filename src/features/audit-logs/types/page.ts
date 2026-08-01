import type { AuditLog } from '@/features/audit-logs/types'

/**
 * Server-filtered audit results (ADMIN-AUDIT-01).
 *
 * Kept out of the service module, which imports the server-only API client —
 * the table is a client component and would otherwise pull it into the browser
 * bundle.
 */
export type AuditQuery = {
  q?: string
  actorId?: string
  action?: string
  tableName?: string
  /** Inclusive YYYY-MM-DD bounds. */
  from?: string
  to?: string
  sort?: 'createdAt' | 'action' | 'tableName'
  dir?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export type AuditLogPage = {
  rows: AuditLog[]
  total: number
  limit: number
  offset: number
}

export type AuditFilterOptions = {
  actions: string[]
  tables: string[]
  actors: { id: string; username: string }[]
}
