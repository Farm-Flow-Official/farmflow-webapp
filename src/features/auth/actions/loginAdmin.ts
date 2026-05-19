'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { LoginState } from '@/features/auth/types'

export async function loginAdmin(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' }
  }

  let data: { token: string; role: string; name: string; admin_id: string }

  try {
    const res = await fetch(
      `${process.env.FARMFLOW_API_URL}/auth/admin/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      },
    )

    if (!res.ok) {
      if (res.status === 401) return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
      return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
    }

    data = await res.json()
  } catch {
    return { error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  redirect('/admin')
}
