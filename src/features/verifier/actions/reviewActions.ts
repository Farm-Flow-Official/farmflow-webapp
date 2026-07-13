'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'

export type ReviewResult = { ok: boolean; error?: string }

function revalidateBatch(batchId: string): void {
  revalidatePath('/verifier/batches')
  revalidatePath(`/verifier/batches/${batchId}`)
}

/** Approve a review batch — issues the carbon credit and notifies the farmer (server-side). */
export async function approveBatch(batchId: string): Promise<ReviewResult> {
  try {
    const { data, response } = await api.POST('/api/v1/verifier/batches/{id}/approve', {
      params: { path: { id: batchId } },
    })
    if (!data?.success) {
      return { ok: false, error: response.status === 409 ? 'ชุดนี้ถูกตรวจไปแล้ว' : 'อนุมัติไม่สำเร็จ' }
    }
    revalidateBatch(batchId)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/** Reject a review batch with a required reason — notifies the farmer (server-side). */
export async function rejectBatch(batchId: string, reason: string): Promise<ReviewResult> {
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
    revalidateBatch(batchId)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
