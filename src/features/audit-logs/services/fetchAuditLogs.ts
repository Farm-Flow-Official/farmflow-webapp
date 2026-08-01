import { api, unwrap } from '@/lib/api'
import { toPage } from '@/lib/api/page'
import type {
  AuditFilterOptions,
  AuditLogPage,
  AuditQuery,
} from '@/features/audit-logs/types/page'
import type {
  AuditAction,
  AuditActorType,
  AuditLog,
  AuditSnapshot,
} from '@/features/audit-logs/types'

export type { AuditQuery, AuditFilterOptions, AuditLogPage }

/**
 * A page of audit entries, newest-first.
 *
 * Filtered on the server (ADMIN-AUDIT-01): the audit log is append-only and only
 * ever grows, so it is the last table that should be shipped whole to a browser
 * and sliced there.
 */
export async function fetchAuditLogs(query: AuditQuery = {}): Promise<AuditLogPage> {
  const page = await unwrap(
    api.GET('/api/v1/admin/audit-logs/', {
      params: {
        query: {
          q: query.q || undefined,
          actorId: query.actorId || undefined,
          action: query.action || undefined,
          tableName: query.tableName || undefined,
          from: query.from || undefined,
          to: query.to || undefined,
          sort: query.sort,
          dir: query.dir,
          limit: query.limit,
          offset: query.offset,
        },
      },
    }),
  )

  return toPage(page, (l: AuditLog) => ({
    ...l,
    actorType: l.actorType as AuditActorType,
    action: l.action as AuditAction,
    oldData: l.oldData as AuditSnapshot | null,
    newData: l.newData as AuditSnapshot | null,
  }))
}

/** The values actually present in the log, for the filter dropdowns. */
export async function fetchAuditFilters(): Promise<AuditFilterOptions> {
  const { data } = await api.GET('/api/v1/admin/audit-logs/filters', {})
  if (!data?.success) return { actions: [], tables: [], actors: [] }
  return data.data
}
