'use server'

import { api } from '@/lib/api'

export type ContactReveal = {
  ok: boolean
  error?: string
  phone?: string | null
  email?: string | null
}

/**
 * Reveal one farmer's real contact details (ADMIN-PROJ-03).
 *
 * A server action rather than a client fetch so the admin's session cookie
 * cannot be replayed from the browser, and so the API — which writes the
 * `READ_PII` audit row — is the only place the unmasked values ever exist
 * outside this response.
 */
export async function revealFarmerContact(farmerId: string): Promise<ContactReveal> {
  try {
    const { data, response } = await api.GET('/api/v1/admin/farmers/{id}/contact', {
      params: { path: { id: farmerId } },
    })
    if (!data?.success) {
      if (response.status === 403) return { ok: false, error: 'ไม่มีสิทธิ์ดูข้อมูลติดต่อ' }
      return { ok: false, error: 'ดูข้อมูลไม่สำเร็จ' }
    }
    return { ok: true, phone: data.data.phone, email: data.data.email }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
