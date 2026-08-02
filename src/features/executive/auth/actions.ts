'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'
import { relaySetCookies } from '@/features/auth/services/adminSession'
import type { ExecutiveLoginState } from '@/features/executive/auth/types'

/**
 * Executive sign-in via `POST /executive/auth/sign-in`, which gates on the
 * EXECUTIVE role. The API replies with an HttpOnly `executive_access` cookie
 * that we relay to the browser — the same shape as the admin and verifier
 * flows, and a separate cookie so all three can be open at once.
 */
export async function loginExecutive(
  _state: ExecutiveLoginState,
  formData: FormData,
): Promise<ExecutiveLoginState> {
  const username = formData.get('username')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!username || !password) {
    return { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
  }

  let setCookies: string[]
  try {
    const { data, response } = await api.POST('/api/v1/executive/auth/sign-in', {
      body: { username, password },
    })

    if (!data?.success) {
      if (response.status === 401) return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
      // Deliberately specific: an admin who tries their usual password here
      // should be told the account is wrong, not the password.
      if (response.status === 403) return { error: 'บัญชีนี้ไม่ใช่บัญชีผู้บริหาร (Executive)' }
      if (response.status === 422) return { error: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' }
      return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
    }

    setCookies = response.headers.getSetCookie()
  } catch {
    return { error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่' }
  }

  if (setCookies.length === 0) {
    return { error: 'เข้าสู่ระบบไม่สำเร็จ (ไม่ได้รับ session) กรุณาลองใหม่' }
  }

  const store = await cookies()
  relaySetCookies(store, setCookies)

  redirect('/executive')
}

export async function signOutExecutive(): Promise<void> {
  try {
    await api.POST('/api/v1/executive/auth/sign-out')
  } catch {
    // Clear locally regardless — a session the browser still holds after a
    // failed sign-out is worse than a wasted request.
  }

  const store = await cookies()
  for (const c of store.getAll()) {
    store.delete(c.name)
  }

  redirect('/executive/login')
}
