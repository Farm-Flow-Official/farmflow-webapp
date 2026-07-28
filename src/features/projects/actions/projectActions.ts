'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { ProjectDetail, ProjectInput } from '@/features/projects/types'

const LIST_PATH = '/admin/projects'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

/**
 * The API returns the offending field on a 409, so the form can point at the
 * input rather than showing a generic failure.
 */
function conflictMessage(details: unknown, fallback: string): string {
  const field = (details as { field?: string } | null)?.field
  if (field === 'projectCode') return 'รหัสโครงการนี้ถูกใช้แล้ว'
  if (field === 'farmId') return 'ฟาร์มนี้เข้าร่วมโครงการอื่นอยู่แล้ว'
  return fallback
}

export async function createProject(input: ProjectInput): Promise<Result<ProjectDetail>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/projects/', { body: input })
    if (!data?.success) {
      if (response.status === 409) {
        return { ok: false, error: conflictMessage(error?.error?.details, 'สร้างโครงการไม่สำเร็จ') }
      }
      return { ok: false, error: error?.error?.message ?? 'สร้างโครงการไม่สำเร็จ' }
    }
    revalidatePath(LIST_PATH)
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput>,
): Promise<Result<ProjectDetail>> {
  try {
    const { data, error, response } = await api.PATCH('/api/v1/admin/projects/{id}', {
      params: { path: { id } },
      body: input,
    })
    if (!data?.success) {
      if (response.status === 409) {
        return { ok: false, error: conflictMessage(error?.error?.details, 'แก้ไขโครงการไม่สำเร็จ') }
      }
      return { ok: false, error: error?.error?.message ?? 'แก้ไขโครงการไม่สำเร็จ' }
    }
    revalidatePath(LIST_PATH)
    revalidatePath(`${LIST_PATH}/${id}`)
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function deleteProject(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error, response } = await api.DELETE('/api/v1/admin/projects/{id}', {
      params: { path: { id } },
    })
    if (!data?.success) {
      if (response.status === 403) return { ok: false, error: 'ไม่มีสิทธิ์ลบโครงการ' }
      // 409 carries the enrolled-farm count — surfacing it tells the admin what to do next.
      return { ok: false, error: error?.error?.message ?? 'ลบโครงการไม่สำเร็จ' }
    }
    revalidatePath(LIST_PATH)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/** Replaces the whole allowed set; an empty array leaves the project unrestricted. */
export async function setProjectSpecies(
  id: string,
  speciesIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await api.PUT('/api/v1/admin/projects/{id}/species', {
      params: { path: { id } },
      body: { speciesIds },
    })
    if (!data?.success) {
      return { ok: false, error: error?.error?.message ?? 'บันทึกชนิดพันธุ์ไม่สำเร็จ' }
    }
    revalidatePath(`${LIST_PATH}/${id}`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function enrolFarm(id: string, farmId: string): Promise<Result<ProjectDetail>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/projects/{id}/farms', {
      params: { path: { id } },
      body: { farmId },
    })
    if (!data?.success) {
      if (response.status === 409) {
        return { ok: false, error: error?.error?.message ?? 'เพิ่มฟาร์มไม่สำเร็จ' }
      }
      return { ok: false, error: error?.error?.message ?? 'เพิ่มฟาร์มไม่สำเร็จ' }
    }
    revalidatePath(`${LIST_PATH}/${id}`)
    revalidatePath(LIST_PATH)
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function withdrawFarm(id: string, farmId: string): Promise<Result<ProjectDetail>> {
  try {
    const { data, error } = await api.DELETE('/api/v1/admin/projects/{id}/farms/{farmId}', {
      params: { path: { id, farmId } },
    })
    if (!data?.success) {
      return { ok: false, error: error?.error?.message ?? 'ถอนฟาร์มไม่สำเร็จ' }
    }
    revalidatePath(`${LIST_PATH}/${id}`)
    revalidatePath(LIST_PATH)
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
