'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'

export type CredentialResult =
  | { ok: true; username: string; password: string | null }
  | { ok: false; error: string }

/**
 * Change a farmer's login handle, their password, or both (support desk).
 *
 * The generated password comes back exactly once so it can be read out over the
 * phone. Nothing here logs it, and the caller must not either — the audit trail
 * records that a reset happened, which is what an auditor needs.
 */
export async function updateFarmerCredentials(
  farmerId: string,
  input: { username?: string; password?: string; generatePassword?: boolean },
): Promise<CredentialResult> {
  const username = input.username?.trim()

  if (!username && !input.password && !input.generatePassword) {
    return { ok: false, error: 'ยังไม่ได้เลือกว่าจะแก้อะไร' }
  }
  if (username && username.length < 4) {
    return { ok: false, error: 'ชื่อผู้ใช้ต้องยาวอย่างน้อย 4 ตัวอักษร' }
  }
  if (input.password && input.password.length < 8) {
    return { ok: false, error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' }
  }

  try {
    const { data, error } = await api.PATCH('/api/v1/admin/farmers/{id}/credentials', {
      params: { path: { id: farmerId } },
      body: {
        username: username || undefined,
        password: input.password || undefined,
        generatePassword: input.generatePassword || undefined,
      },
    })

    if (!data?.success) {
      const message = (error as { error?: { message?: string } } | undefined)?.error?.message
      return { ok: false, error: message?.trim() || 'บันทึกไม่สำเร็จ' }
    }

    revalidatePath('/admin/farmer-users')
    revalidatePath(`/admin/farmers/${farmerId}`)
    return { ok: true, username: data.data.username, password: data.data.password }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' }
  }
}
