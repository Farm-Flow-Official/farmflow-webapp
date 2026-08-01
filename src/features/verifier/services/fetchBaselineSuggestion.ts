import { api } from '@/lib/api'
import type { BaselineSuggestion } from '@/features/verifier/components/ApproveDialog'

/**
 * Whether approving this session would set the farm's baseline.
 *
 * Read on the server alongside the session itself so the approve dialog opens
 * already knowing the answer — asking on click would show an unticked box for a
 * moment and then tick it, which reads as the system changing its mind about
 * something consequential.
 *
 * Falls back to "not eligible" rather than throwing: a missing suggestion should
 * cost the verifier a pre-ticked checkbox, not the whole review page.
 */
export async function fetchBaselineSuggestion(sessionId: string): Promise<BaselineSuggestion> {
  const { data } = await api.GET('/api/v1/verifier/batches/{id}/baseline-suggestion', {
    params: { path: { id: sessionId } },
  })
  if (!data?.success) return { eligible: false, suggested: false, existing: null }
  return data.data as BaselineSuggestion
}
