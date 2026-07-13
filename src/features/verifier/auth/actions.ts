'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'
import { relaySetCookies } from '@/features/auth/services/adminSession'
import type { VerifierLoginState } from '@/features/verifier/auth/types'

/**
 * Verifier sign-in via `POST /verifier/auth/sign-in` (gates on the VERIFIER
 * role). The API replies with an HttpOnly `verifier_access` cookie which we relay
 * to the browser, mirroring `loginAdmin`.
 */
export async function loginVerifier(
  _state: VerifierLoginState,
  formData: FormData,
): Promise<VerifierLoginState> {
  const username = formData.get('username')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!username || !password) {
    return { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
  }

  let setCookies: string[]
  try {
    const { data, response } = await api.POST('/api/v1/verifier/auth/sign-in', {
      body: { username, password },
    })

    if (!data?.success) {
      if (response.status === 401) return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
      if (response.status === 403) return { error: 'บัญชีนี้ไม่มีสิทธิ์ผู้ตรวจสอบ (Verifier)' }
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

  redirect('/verifier')
}

export async function signOutVerifier(): Promise<void> {
  try {
    await api.POST('/api/v1/verifier/auth/sign-out')
  } catch {
    // Even if the API call fails, still clear local cookies below.
  }

  const store = await cookies()
  for (const c of store.getAll()) {
    store.delete(c.name)
  }

  redirect('/verifier/login')
}
