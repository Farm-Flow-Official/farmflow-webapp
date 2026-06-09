'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionCookieOptions } from '@/features/auth/services/sessionCookies'
import { VERIFIER_COOKIE } from '@/features/verifier/auth/session'
import type { VerifierLoginState } from '@/features/verifier/auth/types'

/**
 * MOCK verifier sign-in. The API has no verifier auth yet (only an admin/MASTER
 * account + role exist), so this accepts any non-empty credentials and issues a
 * local mock session. When the backend adds the Verifier role + endpoint,
 * replace the body with a real `POST /auth/verifier/login` that relays the API's
 * session cookies (see `loginAdmin`).
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

  const store = await cookies()
  store.set(
    VERIFIER_COOKIE,
    JSON.stringify({ id: `VRF-${username}`, username, org: 'VGREEN' }),
    sessionCookieOptions(60 * 60 * 8), // 8h mock session
  )

  redirect('/verifier')
}

export async function signOutVerifier(): Promise<void> {
  const store = await cookies()
  store.delete(VERIFIER_COOKIE)
  redirect('/verifier/login')
}
