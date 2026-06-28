import { api } from '@/lib/api'
import type { FarmerAccountStatus, FarmerDetail } from '@/features/farmers/types'

/** One farmer with their farms and carbon/value totals; null when not found. */
export async function fetchFarmerById(id: string): Promise<FarmerDetail | null> {
  const { data } = await api.GET('/api/v1/admin/farmers/{id}', {
    params: { path: { id } },
  })
  if (!data?.success) return null
  return { ...data.data, accountStatus: data.data.accountStatus as FarmerAccountStatus }
}
