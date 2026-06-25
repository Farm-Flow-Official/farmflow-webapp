import { cookies } from 'next/headers'
import { mockVerifierOverview } from '@/features/verifier/data/mockVerifierOverview'
import type { VerifierOverviewData } from '@/features/verifier/types'

const mockFallback: VerifierOverviewData = {
  ...mockVerifierOverview,
  alerts: [...mockVerifierOverview.alerts].sort(
    (a, b) => a.aiConfidenceScore - b.aiConfidenceScore,
  ),
}

export async function fetchVerifierOverview(): Promise<VerifierOverviewData> {
  const apiBase = process.env.FARMFLOW_API_URL
  if (!apiBase) return mockFallback

  const store = await cookies()
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  try {
    const res = await fetch(`${apiBase}/admin/verifier/overview`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return mockFallback

    const json = (await res.json()) as { data?: VerifierOverviewData }
    return json.data ?? mockFallback
  } catch {
    return mockFallback
  }
}
