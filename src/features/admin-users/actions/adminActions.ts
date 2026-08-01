'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { toAdminUser } from '@/features/admin-users/services/fetchAdmins'
import type { AdminInvite, AdminStatus, AdminUser } from '@/features/admin-users/types'

const PATH = '/admin/admin-users'

export type AdminMutation = { ok: boolean; error?: string }

/** The API's own words — it distinguishes taken usernames, bad orgs, bad roles. */
function adminError(error: unknown, fallback: string): string {
  const message = (error as { error?: { message?: string } } | undefined)?.error?.message
  return message?.trim() || fallback
}

/**
 * Create an admin account (ADMIN-USERS-02/03/04).
 *
 * `generatedPassword` comes back only when the caller left the password blank,
 * and only on this response — there is no way to read it again, which is why the
 * dialog must show it before closing.
 */
export async function createAdmin(
  invite: AdminInvite,
): Promise<AdminMutation & { admin?: AdminUser; generatedPassword?: string | null }> {
  try {
    const { data, error } = await api.POST('/api/v1/admin/admins/', {
      body: {
        username: invite.username,
        role: invite.role,
        orgId: invite.orgId || undefined,
        password: invite.password || undefined,
      },
    })
    if (!data?.success) {
      return { ok: false, error: adminError(error, 'สร้างบัญชีผู้ดูแลไม่สำเร็จ') }
    }
    revalidatePath(PATH)
    return {
      ok: true,
      admin: toAdminUser(data.data),
      generatedPassword: data.data.generatedPassword,
    }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}

/** What the username will be, so the form can show it before anything is created. */
export async function previewUsername(
  username: string,
  role: string,
): Promise<{ username: string; taken: boolean } | null> {
  if (!username.trim()) return null
  try {
    const { data } = await api.GET('/api/v1/admin/admins/username-preview', {
      params: { query: { username, role } },
    })
    return data?.success ? data.data : null
  } catch {
    return null
  }
}

/** Reset an admin's password, forcing a change at their next sign-in. */
export async function resetAdminPassword(
  id: string,
  password?: string,
): Promise<AdminMutation & { generatedPassword?: string | null }> {
  try {
    const { data, error } = await api.POST('/api/v1/admin/admins/{id}/password', {
      params: { path: { id } },
      body: { password: password || undefined },
    })
    if (!data?.success) {
      return { ok: false, error: adminError(error, 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ') }
    }
    revalidatePath(PATH)
    return { ok: true, generatedPassword: data.data.generatedPassword }
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
