import { api, unwrap } from '@/lib/api'
import type { Farmer, FarmerAccountStatus } from '@/features/farmers/types'

/** All farmers with their active farm counts. */
export async function fetchFarmers(): Promise<Farmer[]> {
  const farmers = await unwrap(api.GET('/api/v1/admin/farmers/'))
  return farmers.map((f) => ({
    ...f,
    accountStatus: f.accountStatus as FarmerAccountStatus,
  }))
}
