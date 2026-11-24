'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { FarmerAccountStatus } from '@/features/farmers/types'

/**
 * Suspend or reactivate a farmer account (persists + audits server-side).
 *
 * `reason` is mandatory when suspending — the API rejects a suspension without
 * one, and the farmer is shown the text verbatim. It used not to be sent at
 * all, so every suspension from this console failed with a generic error while
 * looking like a UI problem.
 */
export async function setFarmerStatus(
  id: string,
  status: FarmerAccountStatus,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const cleanReason = reason?.trim()
  if (status === 'Suspended' && !cleanReason) {
    return { ok: false, error: 'ต้องระบุเหตุผลที่ระงับบัญชี' }
  }

  try {
    const { data, error } = await api.PATCH('/api/v1/admin/farmers/{id}/status', {
      params: { path: { id } },
      body: { status, reason: cleanReason },
    })
    if (!data?.success) {
      const message = (error as { error?: { message?: string } } | undefined)?.error?.message
      return { ok: false, error: message?.trim() || 'อัปเดตสถานะไม่สำเร็จ' }
    }
    revalidatePath(`/admin/farmers/${id}`)
    revalidatePath('/admin/farmers')
    revalidatePath('/admin/farmer-users')
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
