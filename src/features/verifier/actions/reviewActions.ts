'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { batchHref, projectHref, queueHref } from '@/features/verifier/lib/routes'

export type ReviewResult = { ok: boolean; error?: string }

/**
 * A decision changes the queue, the project's counts, and the batch itself, so
 * all three are revalidated. `projectId` is null for a farm in no project,
 * which the route helpers resolve to the unassigned bucket.
 */
function revalidateBatch(projectId: string | null, batchId: string): void {
  revalidatePath('/verifier')
  revalidatePath(projectHref(projectId))
  revalidatePath(queueHref(projectId))
  revalidatePath(batchHref(projectId, batchId))
}

/** Approve a review batch — issues the carbon credit and notifies the farmer (server-side). */
export async function approveBatch(
  batchId: string,
  projectId: string | null,
): Promise<ReviewResult> {
  try {
    const { data, response } = await api.POST('/api/v1/verifier/batches/{id}/approve', {
      params: { path: { id: batchId } },
    })
    if (!data?.success) {
      return { ok: false, error: response.status === 409 ? 'ชุดนี้ถูกตรวจไปแล้ว' : 'อนุมัติไม่สำเร็จ' }
    }
    revalidateBatch(projectId, batchId)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/** Reject a review batch with a required reason — notifies the farmer (server-side). */
export async function rejectBatch(
  batchId: string,
  reason: string,
  projectId: string | null,
): Promise<ReviewResult> {
  const trimmed = reason.trim()
  if (!trimmed) return { ok: false, error: 'กรุณาระบุเหตุผล' }

  try {
    const { data, response } = await api.POST('/api/v1/verifier/batches/{id}/reject', {
      params: { path: { id: batchId } },
      body: { reason: trimmed },
    })
    if (!data?.success) {
      return { ok: false, error: response.status === 409 ? 'ชุดนี้ถูกตรวจไปแล้ว' : 'ปฏิเสธไม่สำเร็จ' }
    }
    revalidateBatch(projectId, batchId)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
