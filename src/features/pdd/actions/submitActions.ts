'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { Ok } from '@/lib/api/types'

export type Readiness = Ok<'/api/v1/admin/pdd/{pddId}/readiness', 'get'>
export type ReadinessIssue = Readiness['issues'][number]

type Result<T> = { ok: true; data: T } | { ok: false; error: string; issues?: ReadinessIssue[] }

/** What is still missing before the document can be filed. */
export async function fetchReadiness(pddId: string): Promise<Result<Readiness>> {
  try {
    const { data, error } = await api.GET('/api/v1/admin/pdd/{pddId}/readiness', {
      params: { path: { pddId } },
    })
    if (!data?.success) return { ok: false, error: error?.error?.message ?? 'ตรวจสอบไม่สำเร็จ' }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/**
 * File the document.
 *
 * A 400 carries the outstanding issues, which are surfaced rather than
 * flattened into "ส่งไม่สำเร็จ" — the author needs to know what to go fix.
 */
export async function submitPdd(
  projectId: string,
  pddId: string,
): Promise<Result<{ version: number; status: string }>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/pdd/{pddId}/submit', {
      params: { path: { pddId } },
    })
    if (!data?.success) {
      if (response.status === 400) {
        const details = error?.error?.details as { issues?: ReadinessIssue[] } | undefined
        return {
          ok: false,
          error: 'เอกสารยังไม่ครบถ้วน',
          issues: details?.issues ?? [],
        }
      }
      if (response.status === 403) return { ok: false, error: 'ไม่มีสิทธิ์ส่งเอกสาร' }
      if (response.status === 409) return { ok: false, error: 'เอกสารฉบับนี้ถูกส่งไปแล้ว' }
      return { ok: false, error: error?.error?.message ?? 'ส่งเอกสารไม่สำเร็จ' }
    }

    // Submitting freezes the document, so the page must re-render read-only.
    revalidatePath(`/admin/projects/${projectId}/pdd`)
    revalidatePath(`/admin/projects/${projectId}`)
    return { ok: true, data: { version: data.data.version, status: data.data.status } }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/** Open the next draft from a filed version. */
export async function revisePdd(
  projectId: string,
  pddId: string,
): Promise<Result<{ id: string; version: number }>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/pdd/{pddId}/revise', {
      params: { path: { pddId } },
    })
    if (!data?.success) {
      if (response.status === 409) {
        return { ok: false, error: error?.error?.message ?? 'มีฉบับร่างเปิดอยู่แล้ว' }
      }
      return { ok: false, error: error?.error?.message ?? 'สร้างฉบับแก้ไขไม่สำเร็จ' }
    }
    revalidatePath(`/admin/projects/${projectId}/pdd`)
    return { ok: true, data: { id: data.data.id, version: data.data.version } }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
