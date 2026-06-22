'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { relaySetCookies } from '@/features/auth/services/adminSession'
import { sessionCookieOptions } from '@/features/auth/services/sessionCookies'
import type { LoginState } from '@/features/auth/types'

const DEMO_COOKIE = 'ff_demo_admin'
const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'demo1234'

export async function loginAdmin(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = formData.get('username')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!username || !password) {
    return { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
  }

  const apiBase = process.env.FARMFLOW_API_URL

  // Demo mode: no API configured → accept hardcoded credentials
  if (!apiBase) {
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
    }
    const store = await cookies()
    store.set(DEMO_COOKIE, '1', sessionCookieOptions(60 * 60 * 8))
    redirect('/admin')
  }

  // The API authenticates with username+password and replies with HttpOnly
  // session cookies (no token in the body). We relay those cookies to the
  // browser so subsequent requests carry the admin session.
  let setCookies: string[]

  try {
    const res = await fetch(`${apiBase}/admin/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })

    if (!res.ok) {
      if (res.status === 401) return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
      if (res.status === 422) return { error: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' }
      return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
    }

    setCookies = res.headers.getSetCookie()
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
