import type { SystemConfig } from '@/features/settings/types'
import { MARKET_PRICE_THB_PER_TCO2E } from '@/lib/constants/carbon'

/**
 * Temporary stand-in until the settings API lands. The price mirrors the shared
 * carbon constant so the value shown here is the same one used to estimate
 * farmer carbon value. Delete once `fetchSystemConfig()` calls the real endpoint.
 */
export const mockSystemConfig: SystemConfig = {
  configId: 'CFG-PRICE',
  marketPriceThb: MARKET_PRICE_THB_PER_TCO2E,
  priceSource: 'manual',
  effectiveFrom: '2026-06-09T01:20:00Z',
  updatedByAdminId: 'ADM-0001',
  updatedByLabel: 'master.admin',
  updatedAt: '2026-06-09T01:20:00Z',
}
