import { api, unwrap } from '@/lib/api'
import type {
  AuditAction,
  AuditActorType,
  AuditLog,
  AuditSnapshot,
} from '@/features/audit-logs/types'

/** The audit log, newest-first (the API already orders it). */
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const logs = await unwrap(api.GET('/api/v1/admin/audit-logs/'))
  return logs.map((l) => ({
    ...l,
    actorType: l.actorType as AuditActorType,
    action: l.action as AuditAction,
    oldData: l.oldData as AuditSnapshot | null,
    newData: l.newData as AuditSnapshot | null,
  }))
}
