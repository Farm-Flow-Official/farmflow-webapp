'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { sessionHref, projectHref, queueHref } from '@/features/verifier/lib/routes'

export type ReviewResult = { ok: boolean; error?: string }

/**
 * A decision changes the queue, the project's counts, and the session itself, so
 * all three are revalidated. `projectId` is null for a farm in no project,
 * which the route helpers resolve to the unassigned bucket.
 */
function revalidateSession(projectId: string | null, sessionId: string): void {
  revalidatePath('/verifier')
  revalidatePath(projectHref(projectId))
  revalidatePath(queueHref(projectId))
  revalidatePath(sessionHref(projectId, sessionId))
}

/**
 * The API's own words, when it has any.
 *
 * A 409 used to mean exactly one thing ("already reviewed") and could be
 * translated locally. It now also means the farm is not approved, or already has
 * a baseline — each with its own Thai message from the server. Guessing here
 * would tell the verifier something false, so the server's message wins and the
 * local string is only the fallback.
 */
function reviewError(error: unknown, fallback: string): string {
  const message = (error as { error?: { message?: string } } | undefined)?.error?.message
  return message?.trim() || fallback
}

/**
 * Approve a review session — issues the carbon credit and notifies the farmer.
 *
 * `recordAsBaseline` fixes this session's carbon as the farm's reference stock
 * for its project (VERIFIER-BASELINE-01). The dialog pre-ticks it when the farm
 * has none, but the verifier decides.
 */
export async function approveSession(
  sessionId: string,
  projectId: string | null,
  recordAsBaseline = false,
): Promise<ReviewResult> {
  try {
    const { data, error } = await api.POST('/api/v1/verifier/batches/{id}/approve', {
      params: { path: { id: sessionId } },
      body: { recordAsBaseline },
    })
    if (!data?.success) {
      return { ok: false, error: reviewError(error, 'อนุมัติไม่สำเร็จ') }
    }
    revalidateSession(projectId, sessionId)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/** Reject a review session with a required reason — notifies the farmer (server-side). */
export async function rejectSession(
  sessionId: string,
  reason: string,
  projectId: string | null,
): Promise<ReviewResult> {
  const trimmed = reason.trim()
  if (!trimmed) return { ok: false, error: 'กรุณาระบุเหตุผล' }

  try {
    const { data, error } = await api.POST('/api/v1/verifier/batches/{id}/reject', {
      params: { path: { id: sessionId } },
      body: { reason: trimmed },
    })
    if (!data?.success) {
      return { ok: false, error: reviewError(error, 'ปฏิเสธไม่สำเร็จ') }
    }
    revalidateSession(projectId, sessionId)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
