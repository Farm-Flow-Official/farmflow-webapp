import { cache } from 'react'
import type { BusinessProfile } from '@/features/business/auth/types'

/**
 * Resolves the current business-staff session.
 *
 * MOCK for BETA: the Business Dashboard has no auth yet, so this returns a
 * static `BusinessMaster` profile so the dashboard renders for the mentor
 * preview. When RBAC lands, replace ONLY the body below with the real check,
 * mirroring `features/auth/services/adminSession.ts`:
 *
 *   - call `/admin/auth/me` with the forwarded session cookies,
 *   - derive `permissions` from the admin's role (`role_permissions` join),
 *   - return `null` (→ layout redirects to `/`) if the admin holds no
 *     `*:read` business permission.
 */
export const getBusinessSession = cache(
  async (): Promise<BusinessProfile | null> => {
    return {
      id: 'biz-mock-001',
      username: 'business.master',
      role: 'BusinessMaster',
      permissions: [
        'overview:read',
        'package:read',
        'package:manage',
        'payment:read',
        'payment:approve',
        'payout:read',
        'payout:approve',
        'customer:read',
        'customer:read_pii',
        'audit:read',
        'staff:manage',
      ],
    }
  },
)
