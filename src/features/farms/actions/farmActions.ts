'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { FarmDecision } from '@/features/farms/types'

export type FarmMutation = { ok: boolean; error?: string }

/**
 * The API's own words, when it has any.
 *
 * A refusal here has several distinct causes — the owner is suspended, the
 * transition is not allowed from the current state, the farm is already in that
 * state — each with its own Thai message from the server. Collapsing them into
 * one local string would tell the admin something false about why their action
 * did not take.
 */
function farmError(error: unknown, fallback: string): string {
  const message = (error as { error?: { message?: string } } | undefined)?.error?.message
  return message?.trim() || fallback
}

/**
 * Approve, reject, or suspend a farm (ADMIN-POWER-01).
 *
 * A reason is mandatory for anything but approval — the server enforces it too,
 * but checking here saves a round trip and keeps the message next to the field.
 */
export async function decideFarm(
  farmId: string,
  decision: FarmDecision,
  reason?: string,
): Promise<FarmMutation> {
  const trimmed = reason?.trim()
  if (decision !== 'active' && !trimmed) {
    return { ok: false, error: 'กรุณาระบุเหตุผล' }
  }

  try {
    const { data, error } = await api.PATCH('/api/v1/admin/farms/{id}/status', {
      params: { path: { id: farmId } },
      body: { decision, reason: trimmed },
    })
    if (!data?.success) {
      return { ok: false, error: farmError(error, 'บันทึกไม่สำเร็จ') }
    }

    // The decision changes the queue badge, the farm itself, its owner's page,
    // and the project it may have just been withdrawn from.
    revalidatePath('/admin')
    revalidatePath('/admin/farms')
    revalidatePath(`/admin/farms/${farmId}`)
    revalidatePath('/admin/farmers', 'layout')
    revalidatePath('/admin/projects', 'layout')
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
