import { cookies } from 'next/headers'
import type { AdminDashboardSummary } from '@/features/dashboard/types'

const MOCK_SUMMARY: AdminDashboardSummary = {
  activeFarmers: 124,
  totalFarms: 87,
  pendingBatchCount: 5,
  overlapFlaggedFarms: 3,
  totalCarbonKgco2e: 42500,
  marketPriceThb: 48.5,
}

export async function fetchAdminSummary(): Promise<AdminDashboardSummary> {
  const apiBase = process.env.FARMFLOW_API_URL
  if (!apiBase) return MOCK_SUMMARY

  const store = await cookies()
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  try {
    const res = await fetch(`${apiBase}/admin/dashboard/summary`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return MOCK_SUMMARY

    const json = (await res.json()) as { data?: AdminDashboardSummary }
    return json.data ?? MOCK_SUMMARY
  } catch {
    return MOCK_SUMMARY
  }
}
