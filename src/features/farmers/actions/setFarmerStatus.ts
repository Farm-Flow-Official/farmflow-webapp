'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { FarmerAccountStatus } from '@/features/farmers/types'

/** Suspend or reactivate a farmer account (persists + audits server-side). */
export async function setFarmerStatus(
  id: string,
  status: FarmerAccountStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data } = await api.PATCH('/api/v1/admin/farmers/{id}/status', {
      params: { path: { id } },
      body: { status },
    })
    if (!data?.success) return { ok: false, error: 'อัปเดตสถานะไม่สำเร็จ' }
    revalidatePath(`/admin/farmers/${id}`)
    revalidatePath('/admin/farmers')
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
