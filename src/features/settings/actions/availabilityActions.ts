'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { ClosableDashboard } from '@/features/settings/types/availability'

export type AvailabilityMutation = { ok: boolean; error?: string }

/**
 * Open or close one dashboard (ADMIN-SYS-01).
 *
 * Closing requires a reason — the server enforces it too, but checking here
 * keeps the message next to the field the admin is looking at.
 */
export async function setDashboardAvailability(
  dashboard: ClosableDashboard,
  input: { isEnabled: boolean; reason?: string; expectedBackAt?: string },
): Promise<AvailabilityMutation> {
  const reason = input.reason?.trim()
  if (!input.isEnabled && !reason) {
    return { ok: false, error: 'กรุณาระบุเหตุผลที่ปิดปรับปรุง' }
  }

  try {
    const { data, error } = await api.PATCH('/api/v1/admin/system/availability/{dashboard}', {
      params: { path: { dashboard } },
      body: {
        isEnabled: input.isEnabled,
        reason: reason || undefined,
        expectedBackAt: input.expectedBackAt || undefined,
      },
    })
    if (!data?.success) {
      const message = (error as { error?: { message?: string } } | undefined)?.error?.message
      return { ok: false, error: message?.trim() || 'บันทึกไม่สำเร็จ' }
    }

    revalidatePath('/admin/settings')
    // The gate lives in each portal's layout, so their cached renders have to go
    // too — otherwise a closed dashboard keeps serving itself from the cache.
    revalidatePath('/verifier', 'layout')
    revalidatePath('/business', 'layout')
    revalidatePath('/executive', 'layout')
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
