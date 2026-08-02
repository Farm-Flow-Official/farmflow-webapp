'use server'

import { api } from '@/lib/api'

export type BannerUpload = { ok: true; fileId: string } | { ok: false; error: string }

/**
 * Store a banner image and hand back its id.
 *
 * Separate from saving the announcement so the picture can be swapped without
 * re-sending the text, and so a failed upload does not lose a half-written
 * notice. Takes `FormData` because a Server Action cannot receive a `File`
 * inside a plain object.
 */
export async function uploadAnnouncementBanner(form: FormData): Promise<BannerUpload> {
  try {
    const { data, error } = await api.POST('/api/v1/admin/announcements/banner', {
      body: form as never,
      bodySerializer: (b: unknown) => b as FormData,
    })

    if (!data?.success) {
      const message = (error as { error?: { message?: string } } | undefined)?.error?.message
      return { ok: false, error: message?.trim() || 'อัปโหลดรูปไม่สำเร็จ' }
    }
    return { ok: true, fileId: data.data.fileId }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
