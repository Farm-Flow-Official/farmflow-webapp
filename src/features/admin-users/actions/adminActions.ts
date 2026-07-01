'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { toAdminUser } from '@/features/admin-users/services/fetchAdmins'
import type { AdminInvite, AdminStatus, AdminUser } from '@/features/admin-users/types'

const PATH = '/admin/admin-users'

export type AdminMutation = { ok: boolean; error?: string }

/** Invite a new admin (username + role); the password is set out-of-band. */
export async function inviteAdmin(
  invite: AdminInvite,
): Promise<AdminMutation & { admin?: AdminUser }> {
  try {
    const { data, response } = await api.POST('/api/v1/admin/admins/', {
      body: { username: invite.username, role: invite.role },
    })
    if (!data?.success) {
      if (response.status === 409) return { ok: false, error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' }
      return { ok: false, error: 'เชิญผู้ดูแลไม่สำเร็จ' }
    }
    revalidatePath(PATH)
    return { ok: true, admin: toAdminUser(data.data) }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function updateAdminRole(id: string, role: string): Promise<AdminMutation> {
  try {
    const { data } = await api.PATCH('/api/v1/admin/admins/{id}/role', {
      params: { path: { id } },
      body: { role },
    })
    if (!data?.success) return { ok: false, error: 'อัปเดตบทบาทไม่สำเร็จ' }
    revalidatePath(PATH)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function setAdminStatus(id: string, status: AdminStatus): Promise<AdminMutation> {
  try {
    const { data } = await api.PATCH('/api/v1/admin/admins/{id}/status', {
      params: { path: { id } },
      body: { status },
    })
    if (!data?.success) return { ok: false, error: 'อัปเดตสถานะไม่สำเร็จ' }
    revalidatePath(PATH)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

export async function deleteAdmin(id: string): Promise<AdminMutation> {
  try {
    const { data } = await api.DELETE('/api/v1/admin/admins/{id}', {
      params: { path: { id } },
    })
    if (!data?.success) return { ok: false, error: 'ลบบัญชีไม่สำเร็จ' }
    revalidatePath(PATH)
    return { ok: true }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
