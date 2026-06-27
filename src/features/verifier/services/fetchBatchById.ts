import { cookies } from 'next/headers'
import { mockBatchDetails } from '@/features/verifier/data/mockBatchDetails'
import type { BatchDetail, TreeSnapshot, BatchStatus } from '@/features/verifier/types'

type ApiTree = {
  id: string
  captureLat: number | null
  captureLng: number | null
  capturedAt: string
  weatherCondition: string | null
  aiConfidenceScore: number | null
  estimatedCarbonKgco2e: number | null
  aiStatus: string | null
  dbhCm: number | null
  treeHeightM: number | null
  anomaly: boolean
}

type ApiSessionDetail = {
  id: string
  farmId: string
  farmName: string
  farmAddress: string | null
  ownerUsername: string
  submittedAt: string
  treeCount: number
  avgConfidence: number
  totalCarbonKgco2e: number
  anomalyFlag: boolean
  aiBatchStatus: string
  checkinLat: number | null
  checkinLng: number | null
  farmBoundary: { type: string; coordinates: number[][][][] } | null
  trees: ApiTree[]
}

function mapStatus(s: string): BatchStatus {
  if (s === 'completed') return 'Approved'
  if (s === 'rejected') return 'Rejected'
  return 'Pending'
}

function extractPolygon(geojson: ApiSessionDetail['farmBoundary']): [number, number][] {
  if (!geojson) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = geojson.coordinates as any
  if (geojson.type === 'MultiPolygon') return raw[0]?.[0] ?? []
  if (geojson.type === 'Polygon') return raw[0] ?? []   // one level shallower
  return []
}

function mapApiTree(t: ApiTree): TreeSnapshot {
  return {
    id: t.id,
    captureLat: t.captureLat,
    captureLng: t.captureLng,
    capturedAt: t.capturedAt,
    weather: t.weatherCondition,
    aiConfidenceScore: t.aiConfidenceScore,
    estimatedCarbonKgco2e: t.estimatedCarbonKgco2e,
    aiStatus: t.aiStatus,
    dbhCm: t.dbhCm ?? null,
    treeHeightM: t.treeHeightM ?? null,
    anomaly: t.anomaly,
  }
}

function sortTrees(trees: TreeSnapshot[]): TreeSnapshot[] {
  return [...trees].sort((a, b) => {
    if (a.anomaly !== b.anomaly) return a.anomaly ? -1 : 1
    const ca = a.aiConfidenceScore ?? 1
    const cb = b.aiConfidenceScore ?? 1
    return ca - cb
  })
}

const mockWithFlag = Object.fromEntries(
  Object.entries(mockBatchDetails).map(([k, v]) => [
    k,
    { ...v, phone: v.phone ?? null, _live: false } satisfies BatchDetail,
  ]),
)

export async function fetchBatchById(id: string): Promise<BatchDetail | null> {
  const apiBase = process.env.FARMFLOW_API_URL

  if (!apiBase) {
    const batch = mockWithFlag[id]
    if (!batch) return null
    return { ...batch, trees: sortTrees(batch.trees) }
  }

  const store = await cookies()
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  try {
    const res = await fetch(`${apiBase}/admin/sessions/${encodeURIComponent(id)}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) return mockWithFlag[id] ?? null

    const json = (await res.json()) as { data?: ApiSessionDetail }
    const s = json.data
    if (!s) return null

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
      phone: null,
      farmAddress: s.farmAddress,
      checkinLat: s.checkinLat,
      checkinLng: s.checkinLng,
      polygon: extractPolygon(s.farmBoundary),
      trees: sortTrees(s.trees.map(mapApiTree)),
    }
  } catch {
    return mockWithFlag[id] ?? null
  }
}
