'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { SpeciesInput } from '@/features/species/types'

const LIST_PATH = '/admin/species'

// NOTE: async functions only. An exported constant here makes Next discard every
// export in the file — at runtime, with a green typecheck.
type Result<T> = { ok: true; data: T } | { ok: false; error: string }

/**
 * Says what actually went wrong instead of "Bad request".
 *
 * The two failures a person will meet are a duplicate code and an equation the
 * engine cannot run; both come back with enough detail to name the problem.
 */
function explain(status: number, details: unknown, fallback: string): string {
  const d = details as { field?: string; supported?: string[]; usage?: Record<string, number> } | null

  if (status === 409 && d?.field === 'speciesCode') return 'รหัสชนิดพันธุ์ไม้นี้ถูกใช้แล้ว'
  if (status === 409 && d?.usage) {
    const { farms = 0, projects = 0, calculatedTrees = 0 } = d.usage
    return `ลบไม่ได้ — ใช้อยู่ใน ${farms} ฟาร์ม · ${projects} โครงการ · ${calculatedTrees} ต้นที่คำนวณแล้ว`
  }
  if (status === 400 && d?.supported) {
    return `ระบบคำนวณยังไม่รองรับสมการนี้ — รองรับ ${d.supported.join(' · ')}`
  }
  return fallback
}

export async function createSpecies(input: SpeciesInput): Promise<Result<{ id: string }>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/species/', { body: input })
    if (!data?.success) {
      return {
        ok: false,
        error: explain(response.status, error?.error?.details, 'เพิ่มชนิดพันธุ์ไม้ไม่สำเร็จ'),
      }
    }
    revalidatePath(LIST_PATH)
    return { ok: true, data: { id: data.data.id } }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function updateSpecies(
  id: string,
  input: Partial<SpeciesInput>,
): Promise<Result<{ id: string }>> {
  try {
    const { data, error, response } = await api.PATCH('/api/v1/admin/species/{id}', {
      params: { path: { id } },
      body: input,
    })
    if (!data?.success) {
      return {
        ok: false,
        error: explain(response.status, error?.error?.details, 'บันทึกไม่สำเร็จ'),
      }
    }
    revalidatePath(LIST_PATH)
    return { ok: true, data: { id: data.data.id } }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function deleteSpecies(id: string): Promise<Result<{ id: string }>> {
  try {
    const { data, error, response } = await api.DELETE('/api/v1/admin/species/{id}', {
      params: { path: { id } },
    })
    if (!data?.success) {
      return { ok: false, error: explain(response.status, error?.error?.details, 'ลบไม่สำเร็จ') }
    }
    revalidatePath(LIST_PATH)
    return { ok: true, data: { id } }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
