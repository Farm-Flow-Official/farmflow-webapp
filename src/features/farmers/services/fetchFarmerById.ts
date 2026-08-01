import { api } from '@/lib/api'
import type { FarmerAccountStatus, FarmerDetail, FarmStatus } from '@/features/farmers/types'

/**
 * One farmer with their farms and carbon/value totals; null when not found.
 *
 * The status fields arrive as plain strings — OpenAPI cannot express the closed
 * sets the API actually returns — so they are narrowed here, once, rather than
 * at every call site that wants to switch on them.
 */
export async function fetchFarmerById(id: string): Promise<FarmerDetail | null> {
  const { data } = await api.GET('/api/v1/admin/farmers/{id}', {
    params: { path: { id } },
  })
  if (!data?.success) return null

  return {
    ...data.data,
    accountStatus: data.data.accountStatus as FarmerAccountStatus,
    farms: data.data.farms.map((f) => ({ ...f, farmStatus: f.farmStatus as FarmStatus })),
  }
}
