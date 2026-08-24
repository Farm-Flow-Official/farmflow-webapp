'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { COVER_LIMITS_TEXT } from '@/lib/project-cover'

// NOTE: this module exports async functions ONLY. Adding an exported constant
// here makes Next drop every export in the file — at runtime, with a green
// typecheck.
type CoverResult = { ok: true; fileId: string | null } | { ok: false; error: string }

/**
 * Store a project cover picture and link it, in one call.
 *
 * Unlike the announcement banner — which uploads first and saves the id with
 * the text later — a project already exists by the time anyone picks a picture
 * for it, so upload-and-link belongs in one request. That also means no file
 * can be left orphaned by someone abandoning a half-finished form.
 *
 * Takes `FormData` because a Server Action cannot receive a `File` inside a
 * plain object.
 */
export async function uploadProjectCover(
  projectId: string,
  form: FormData,
): Promise<CoverResult> {
  try {
    const { data, error } = await api.PUT('/api/v1/admin/projects/{id}/cover-photo', {
      params: { path: { id: projectId } },
      body: form as never,
      bodySerializer: (b: unknown) => b as FormData,
    })

    if (!data?.success) return { ok: false, error: explain(error) }

    revalidatePath(`/admin/projects/${projectId}`)
    return { ok: true, fileId: data.data.id }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/** Drop the picture; the screens fall back to the code-derived pattern. */
export async function removeProjectCover(projectId: string): Promise<CoverResult> {
  try {
    const { data, error } = await api.DELETE('/api/v1/admin/projects/{id}/cover-photo', {
      params: { path: { id: projectId } },
    })

    if (!data?.success) return { ok: false, error: explain(error) }

    revalidatePath(`/admin/projects/${projectId}`)
    return { ok: true, fileId: null }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/**
 * The API's rejection for a bad upload is "Invalid request data" with a TypeBox
 * dump attached — true, and useless to the person holding the wrong file. Say
 * the rule instead.
 */
function explain(error: unknown): string {
  const err = (error as { error?: { code?: string; message?: string } } | undefined)?.error
  if (err?.code === 'VALIDATION_ERROR') return `ไฟล์ไม่ถูกต้อง — รับเฉพาะ${COVER_LIMITS_TEXT}`
  if (err?.code === 'FORBIDDEN') return 'บัญชีนี้ไม่มีสิทธิ์แก้ไขโครงการ'
  return err?.message?.trim() || 'อัปโหลดรูปไม่สำเร็จ'
}
