import { api, unwrap } from '@/lib/api'
import type { PriceSource, SystemConfig } from '@/features/settings/types'

export async function fetchSystemConfig(): Promise<SystemConfig> {
  const config = await unwrap(api.GET('/api/v1/admin/system/settings'))
  // `priceSource` is a free string on the wire; narrow to our label union.
  return { ...config, priceSource: config.priceSource as PriceSource }
}
