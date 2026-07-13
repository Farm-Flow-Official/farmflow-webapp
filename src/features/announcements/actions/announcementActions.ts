'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementStatus,
} from '@/features/announcements/types'

const PATH = '/admin/announcements'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

function mapAnnouncement(a: {
  id: string
  title: string
  body: string
  status: string
  createdAt: string
  updatedAt: string
}): Announcement {
  return { ...a, status: a.status as AnnouncementStatus }
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<Result<Announcement>> {
  try {
    const { data } = await api.POST('/api/v1/admin/announcements/', { body: input })
    if (!data?.success) return { ok: false, error: 'สร้างประกาศไม่สำเร็จ' }
    revalidatePath(PATH)
    return { ok: true, data: mapAnnouncement(data.data) }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<Result<Announcement>> {
  try {
    const { data } = await api.PATCH('/api/v1/admin/announcements/{id}', {
      params: { path: { id } },
      body: input,
    })
    if (!data?.success) return { ok: false, error: 'แก้ไขประกาศไม่สำเร็จ' }
    revalidatePath(PATH)
    return { ok: true, data: mapAnnouncement(data.data) }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function deleteAnnouncement(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, response } = await api.DELETE('/api/v1/admin/announcements/{id}', {
      params: { path: { id } },
    })
    if (!data?.success) {
      return { ok: false, error: response.status === 403 ? 'ไม่มีสิทธิ์ลบประกาศ' : 'ลบประกาศไม่สำเร็จ' }
    }
    revalidatePath(PATH)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
