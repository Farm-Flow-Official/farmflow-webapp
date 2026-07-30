'use server'

import { api } from '@/lib/api'
import type { Ok } from '@/lib/api/types'

export type ForecastResult = Ok<'/api/v1/admin/pdd/{pddId}/forecast', 'post'>

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

/**
 * Run the ex-ante engine.
 *
 * Deliberately has no `revalidatePath`: the endpoint computes without storing,
 * and the author decides which figures enter the form. Refreshing here would
 * imply the numbers had already been accepted.
 */
export async function runForecast(
  pddId: string,
  input: { creditingPeriodYears?: number; baselineRemovalsTco2ePerYear?: number; leakageTco2ePerYear?: number } = {},
): Promise<Result<ForecastResult>> {
  try {
    const { data, error, response } = await api.POST('/api/v1/admin/pdd/{pddId}/forecast', {
      params: { path: { pddId } },
      body: input,
    })
    if (!data?.success) {
      if (response.status === 403) return { ok: false, error: 'ไม่มีสิทธิ์ใช้เครื่องมือคำนวณ' }
      return { ok: false, error: error?.error?.message ?? 'คำนวณไม่สำเร็จ' }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' }
  }
}
