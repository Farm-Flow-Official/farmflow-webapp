'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import type { PriceSource, SystemConfig } from '@/features/settings/types'

type Result = { ok: true; data: SystemConfig } | { ok: false; error: string }

/** Update the carbon market price (appends a new config row server-side). */
export async function updateMarketPrice(marketPriceThb: number): Promise<Result> {
  try {
    const { data, response } = await api.PATCH('/api/v1/admin/system/settings', {
      body: { marketPriceThb },
    })
    if (!data?.success) {
      return {
        ok: false,
        error: response.status === 422 ? 'ราคาไม่อยู่ในช่วงที่อนุญาต' : 'อัปเดตราคาไม่สำเร็จ',
      }
    }
    revalidatePath('/admin/settings')
    return { ok: true, data: { ...data.data, priceSource: data.data.priceSource as PriceSource } }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
