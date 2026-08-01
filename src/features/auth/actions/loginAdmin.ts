'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'
import { relaySetCookies } from '@/features/auth/services/adminSession'
import type { LoginState } from '@/features/auth/types'

export async function loginAdmin(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = formData.get('username')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!username || !password) {
    return { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
  }

  // The API authenticates with username+password and replies with HttpOnly
  // session cookies (no token in the body). We relay those cookies to the
  // browser so subsequent requests carry the admin session.
  let setCookies: string[]
  try {
    const { data, response } = await api.POST('/api/v1/admin/auth/sign-in', {
      body: { username, password },
    })

    if (!data?.success) {
      if (response.status === 401) return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
      // Verifier credentials are valid but barred from the admin portal (WRONG_PORTAL).
      if (response.status === 403)
        return { error: 'บัญชีนี้เป็นผู้ตรวจสอบ (Verifier) กรุณาเข้าสู่ระบบที่พอร์ทัลผู้ตรวจสอบ' }
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

  const cookieStore = await cookies()
  relaySetCookies(cookieStore, setCookies)

  redirect('/admin')
}
