import type { AdminUser } from '@/features/admin-users/types'

/**
 * Temporary stand-in data until the admin-users API lands. Zero-PII: usernames
 * only, no names/emails. Delete once `fetchAdmins()` calls the real endpoint.
 */
export const mockAdmins: AdminUser[] = [
  { id: 'ADM-0001', username: 'master.admin', role: 'SuperAdmin', status: 'Active', lastLoginAt: '2026-06-09T01:20:00Z', createdAt: '2025-01-05T03:00:00Z' },
  { id: 'ADM-0002', username: 'verify.somchai', role: 'Verifier', status: 'Active', lastLoginAt: '2026-06-08T07:45:00Z', createdAt: '2025-02-12T04:30:00Z' },
  { id: 'ADM-0003', username: 'verify.warunee', role: 'Verifier', status: 'Active', lastLoginAt: '2026-06-06T09:10:00Z', createdAt: '2025-03-01T06:15:00Z' },
  { id: 'ADM-0004', username: 'audit.prasit', role: 'Auditor', status: 'Active', lastLoginAt: '2026-05-30T02:50:00Z', createdAt: '2025-03-18T08:00:00Z' },
  { id: 'ADM-0005', username: 'audit.nipa', role: 'Auditor', status: 'Inactive', lastLoginAt: '2026-04-22T05:25:00Z', createdAt: '2025-04-09T03:40:00Z' },
  { id: 'ADM-0006', username: 'verify.thanad', role: 'Verifier', status: 'Active', lastLoginAt: null, createdAt: '2026-06-02T10:05:00Z' },
  { id: 'ADM-0007', username: 'verify.kanya', role: 'Verifier', status: 'Inactive', lastLoginAt: '2026-03-15T11:30:00Z', createdAt: '2025-05-20T07:20:00Z' },
]
