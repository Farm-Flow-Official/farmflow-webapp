import { cookies } from 'next/headers'
import { mockBatches } from '@/features/verifier/data/mockBatches'
import type { VerificationBatch, BatchStatus } from '@/features/verifier/types'

type ApiSession = {
  id: string
  farmId: string
  farmName: string
  ownerUsername: string
  submittedAt: string
  treeCount: number
  avgConfidence: number
  totalCarbonKgco2e: number
  anomalyFlag: boolean
  aiBatchStatus: string
}

function mapStatus(aiBatchStatus: string): BatchStatus {
  if (aiBatchStatus === 'completed') return 'Approved'
  if (aiBatchStatus === 'rejected') return 'Rejected'
  return 'Pending'
}

function mapApiSession(s: ApiSession): VerificationBatch {
  return {
    id: s.id,
    farmId: s.farmId,
    farmName: s.farmName,
    ownerName: s.ownerUsername,
    submittedAt: s.submittedAt,
    treeCount: s.treeCount,
    avgConfidence: s.avgConfidence,
    anomalyFlag: s.anomalyFlag,
    status: mapStatus(s.aiBatchStatus),
    totalCarbonKgCo2e: s.totalCarbonKgco2e,
    _live: true,
  }
}

function smartSort(batches: VerificationBatch[]): VerificationBatch[] {
  return [...batches].sort((a, b) => {
    const aPending = a.status === 'Pending' ? 0 : 1
    const bPending = b.status === 'Pending' ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    if (a.anomalyFlag !== b.anomalyFlag) return a.anomalyFlag ? -1 : 1
    return a.avgConfidence - b.avgConfidence
  })
}

const mockWithFlag: VerificationBatch[] = mockBatches.map((b) => ({
  ...b,
  status: b.status as BatchStatus,
  _live: false as const,
}))

export async function fetchBatches(): Promise<VerificationBatch[]> {
  const apiBase = process.env.FARMFLOW_API_URL
  if (!apiBase) return smartSort(mockWithFlag)

  const store = await cookies()
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  try {
    const res = await fetch(`${apiBase}/admin/sessions`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return smartSort(mockWithFlag)

    const json = (await res.json()) as { data?: ApiSession[] }
    return smartSort((json.data ?? []).map(mapApiSession))
  } catch {
    return smartSort(mockWithFlag)
  }
}
