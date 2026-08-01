'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { sessionHref, treeHref } from '@/features/verifier/lib/routes'

export type TreeRejectResult = { ok: boolean; error?: string }

/**
 * Reject one tree and send it back to the farmer (VERIFIER-DETAIL-04).
 *
 * Deliberately does *not* decide the session: the point is to deal with a bad
 * photo without discarding a day of good field work. The session stays in the
 * queue, so the verifier can keep going.
 */
export async function rejectTree(
  sessionId: string,
  snapshotId: string,
  reason: string,
  projectId: string | null,
): Promise<TreeRejectResult> {
  const trimmed = reason.trim()
  if (!trimmed) return { ok: false, error: 'กรุณาระบุเหตุผล' }

  try {
    const { data, error } = await api.POST(
      '/api/v1/verifier/batches/{id}/trees/{snapshotId}/reject',
      {
        params: { path: { id: sessionId, snapshotId } },
        body: { reason: trimmed },
      },
    )
    if (!data?.success) {
      // The server distinguishes "already decided" from "not your session" with
      // its own wording; passing it through beats guessing from a status code.
      const message = (error as { error?: { message?: string } } | undefined)?.error?.message
      return { ok: false, error: message?.trim() || 'ปฏิเสธต้นไม้ไม่สำเร็จ' }
    }

    revalidatePath(treeHref(projectId, sessionId, snapshotId))
    revalidatePath(sessionHref(projectId, sessionId))
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/**
 * Confirm a flagged tree as acceptable (VERIFIER-DETAIL-04).
 *
 * The counterpart to {@link rejectTree}: the AI raised a doubt, the verifier
 * checked and found it fine. Clears the flag while keeping the model's carbon —
 * the verifier is overruling the doubt, not re-measuring the tree.
 */
export async function confirmTree(
  sessionId: string,
  snapshotId: string,
  note: string,
  projectId: string | null,
): Promise<TreeRejectResult> {
  try {
    const { data, error } = await api.POST(
      '/api/v1/verifier/batches/{id}/trees/{snapshotId}/confirm',
      {
        params: { path: { id: sessionId, snapshotId } },
        body: { note: note.trim() || undefined },
      },
    )
    if (!data?.success) {
      const message = (error as { error?: { message?: string } } | undefined)?.error?.message
      return { ok: false, error: message?.trim() || 'ยืนยันต้นไม้ไม่สำเร็จ' }
    }

    revalidatePath(treeHref(projectId, sessionId, snapshotId))
    revalidatePath(sessionHref(projectId, sessionId))
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
