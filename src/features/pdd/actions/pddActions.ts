'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { updateProject } from '@/features/projects/actions/projectActions'
import type { PddDetail } from '@/features/pdd/types'
import type { ProjectInput } from '@/features/projects/types'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }
type Simple = { ok: boolean; error?: string }

const pddPath = (projectId: string) => `/admin/projects/${projectId}/pdd`

/** A submitted document is frozen; the API says so with a 409. */
function editError(status: number, fallback: string): string {
  if (status === 409) return 'เอกสารฉบับนี้ส่งแล้ว แก้ไขไม่ได้ — ต้องสร้างฉบับแก้ไขใหม่'
  if (status === 403) return 'ไม่มีสิทธิ์แก้ไขเอกสารนี้'
  return fallback
}

/** Start the project's first PDD draft. Deliberate, never a side effect of a read. */
export async function startPdd(projectId: string): Promise<Result<PddDetail>> {
  try {
    const { data: res, error, response } = await api.POST('/api/v1/admin/projects/{id}/pdd', {
      params: { path: { id: projectId } },
    })
    if (!res?.success) {
      return {
        ok: false,
        error: editError(response.status, error?.error?.message ?? 'เริ่มเอกสารไม่สำเร็จ'),
      }
    }
    revalidatePath(pddPath(projectId))
    return { ok: true, data: res.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/**
 * Autosave one wizard step.
 *
 * `revalidatePath` is deliberately NOT called here: autosave fires while the
 * user is typing, and re-rendering the server component under them would
 * discard focus and unsaved input in other fields. The client already holds the
 * saved state; the page refreshes on navigation.
 */
export async function saveSection(
  pddId: string,
  section: string,
  data: Record<string, unknown>,
  complete?: boolean,
): Promise<Result<PddDetail>> {
  try {
    const { data: res, error, response } = await api.PATCH(
      '/api/v1/admin/pdd/{pddId}/sections/{section}',
      {
        params: { path: { pddId, section: section as never } },
        body: { data, ...(complete === undefined ? {} : { complete }) },
      },
    )
    if (!res?.success) {
      return {
        ok: false,
        error: editError(response.status, error?.error?.message ?? 'บันทึกไม่สำเร็จ'),
      }
    }
    return { ok: true, data: res.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/**
 * Step 1's fields live on the project itself (ADR 0023), so saving it patches
 * the project and then records the step's progress on the document — its
 * section payload is empty by design.
 */
export async function saveStep1(
  projectId: string,
  pddId: string,
  input: Partial<ProjectInput>,
  complete?: boolean,
): Promise<Result<PddDetail>> {
  const projectRes = await updateProject(projectId, input, { revalidate: false })
  if (!projectRes.ok) return { ok: false, error: projectRes.error }

  return saveSection(pddId, 'step1', {}, complete)
}

export async function addContact(
  pddId: string,
  input: Record<string, unknown>,
): Promise<Result<PddDetail>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/pdd/{pddId}/contacts', {
      params: { path: { pddId } },
      body: input as never,
    })
    if (!data?.success) {
      return { ok: false, error: editError(response.status, error?.error?.message ?? 'เพิ่มผู้ติดต่อไม่สำเร็จ') }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function updateContact(
  pddId: string,
  childId: string,
  input: Record<string, unknown>,
): Promise<Result<PddDetail>> {
  try {
    const { data, error, response } = await api.PATCH(
      '/api/v1/admin/pdd/{pddId}/contacts/{childId}',
      { params: { path: { pddId, childId } }, body: input as never },
    )
    if (!data?.success) {
      return { ok: false, error: editError(response.status, error?.error?.message ?? 'แก้ไขผู้ติดต่อไม่สำเร็จ') }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function removeContact(pddId: string, childId: string): Promise<Result<PddDetail>> {
  try {
    const { data, error, response } = await api.DELETE(
      '/api/v1/admin/pdd/{pddId}/contacts/{childId}',
      { params: { path: { pddId, childId } } },
    )
    if (!data?.success) {
      return { ok: false, error: editError(response.status, error?.error?.message ?? 'ลบผู้ติดต่อไม่สำเร็จ') }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/**
 * Upload a supporting file. Takes `FormData` because a Server Action cannot
 * receive a `File` inside a plain object — the client hands the raw form over.
 */
export async function uploadAttachment(
  pddId: string,
  form: FormData,
): Promise<Result<PddDetail>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/pdd/{pddId}/attachments', {
      params: { path: { pddId } },
      body: form as never,
      bodySerializer: (b: unknown) => b as FormData,
    })
    if (!data?.success) {
      return { ok: false, error: editError(response.status, error?.error?.message ?? 'อัปโหลดไม่สำเร็จ') }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function removeAttachment(pddId: string, childId: string): Promise<Result<PddDetail>> {
  try {
    const { data, error, response } = await api.DELETE(
      '/api/v1/admin/pdd/{pddId}/attachments/{childId}',
      { params: { path: { pddId, childId } } },
    )
    if (!data?.success) {
      return { ok: false, error: editError(response.status, error?.error?.message ?? 'ลบไฟล์ไม่สำเร็จ') }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/**
 * Import the boundary from a KMZ/KML. The server parses it — a 400 here means
 * the file held no usable polygon, which is worth showing verbatim.
 */
export async function importBoundary(
  projectId: string,
  pddId: string,
  form: FormData,
): Promise<Result<{ declaredAreaRai: number | null; polygonCount: number; names: string[] }>> {
  try {
    const { data, error, response } = await api.PUT('/api/v1/admin/pdd/{pddId}/boundary', {
      params: { path: { pddId } },
      body: form as never,
      bodySerializer: (b: unknown) => b as FormData,
    })
    if (!data?.success) {
      if (response.status === 400) {
        return { ok: false, error: error?.error?.message ?? 'ไฟล์ขอบเขตไม่ถูกต้อง' }
      }
      return { ok: false, error: editError(response.status, 'นำเข้าขอบเขตไม่สำเร็จ') }
    }
    // The declared boundary changes the project map and the reconciliation, so
    // this one does refresh the page.
    revalidatePath(pddPath(projectId))
    revalidatePath(`/admin/projects/${projectId}`)
    return {
      ok: true,
      data: {
        declaredAreaRai: data.data.declaredAreaRai,
        polygonCount: data.data.polygonCount,
        names: data.data.names,
      },
    }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function addSamplePlot(
  projectId: string,
  plotName: string,
  boundary?: unknown,
): Promise<Simple> {
  try {
    const { data, error } = await api.POST('/api/v1/admin/projects/{id}/sample-plots', {
      params: { path: { id: projectId } },
      body: { plotName, ...(boundary ? { boundary: boundary as never } : {}) },
    })
    if (!data?.success) return { ok: false, error: error?.error?.message ?? 'เพิ่มแปลงตัวอย่างไม่สำเร็จ' }
    revalidatePath(pddPath(projectId))
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function removeSamplePlot(projectId: string, plotId: string): Promise<Simple> {
  try {
    const { data, error } = await api.DELETE(
      '/api/v1/admin/projects/{id}/sample-plots/{plotId}',
      { params: { path: { id: projectId, plotId } } },
    )
    if (!data?.success) return { ok: false, error: error?.error?.message ?? 'ลบแปลงตัวอย่างไม่สำเร็จ' }
    revalidatePath(pddPath(projectId))
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
