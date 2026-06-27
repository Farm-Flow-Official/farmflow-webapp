import type {
  BatchDetail,
  TreeSnapshot,
  WeatherCondition,
} from '@/features/verifier/types'
import { mockBatches } from '@/features/verifier/data/mockBatches'
import { mockFarmGeo } from '@/features/gis/data/mockFarmGeo'
import { CONFIDENCE_MIN } from '@/features/verifier/lib/confidence'

/**
 * Builds batch details on top of the queue mock. Farm geometry is reused from
 * the GIS mock where the farm exists (so the mini-map matches A-06); other farms
 * get a deterministic fallback. Tree snapshots are generated per batch with
 * confidences centred on the batch average. Delete once `fetchBatchById()` calls
 * the real endpoint.
 */

const WEATHERS: WeatherCondition[] = ['sunny', 'cloudy', 'rainy']

function seedNum(s: string): number {
  return s.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0)
}

/** Deterministic fraction in [0, 1) from a seed. */
function frac(n: number): number {
  return Math.abs((Math.sin(n) * 10_000) % 1)
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

function box(lng: number, lat: number, w: number, h: number): [number, number][] {
  return [
    [lng - w, lat - h],
    [lng + w, lat - h],
    [lng + w, lat + h],
    [lng - w, lat + h],
    [lng - w, lat - h],
  ]
}

function mockPhone(seed: number): string {
  const d = String(seed % 100_000_000).padStart(8, '0')
  return `08${(seed % 9) + 1}-${d.slice(0, 3)}-${d.slice(3, 7)}`
}

function geoFor(farmId: string): {
  lat: number
  lng: number
  polygon: [number, number][]
  province: string
} {
  const g = mockFarmGeo.find((f) => f.id === farmId)
  if (g) {
    return { lat: g.checkinLat, lng: g.checkinLng, polygon: g.polygon, province: g.province }
  }
  // Deterministic fallback somewhere over rural Thailand.
  const s = seedNum(farmId)
  const lat = 14.5 + (s % 500) / 100
  const lng = 99 + (s % 600) / 100
  return { lat, lng, polygon: box(lng, lat, 0.0016, 0.0013), province: 'นครสวรรค์' }
}

function buildTrees(
  batchId: string,
  count: number,
  baseLat: number,
  baseLng: number,
  avg: number,
  submittedAt: string,
): TreeSnapshot[] {
  const seed = seedNum(batchId)
  const baseMs = new Date(submittedAt).getTime()
  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 7
    const conf = Math.round(clamp(avg + (frac(s) - 0.5) * 0.4, 0.2, 0.98) * 100) / 100
    const circumference = Math.round((30 + frac(s + 3) * 90) * 10) / 10  // 30–120 cm
    return {
      id: `${batchId}-T${String(i + 1).padStart(3, '0')}`,
      captureLat: Math.round((baseLat + (frac(s + 1) - 0.5) * 0.003) * 1e6) / 1e6,
      captureLng: Math.round((baseLng + (frac(s + 2) - 0.5) * 0.003) * 1e6) / 1e6,
      capturedAt: new Date(baseMs - i * 3_600_000).toISOString(),
      weather: WEATHERS[s % 3],
      aiConfidenceScore: conf,
      estimatedCarbonKgco2e: null,
      aiStatus: null,
      dbhCm: Math.round((circumference / Math.PI) * 10) / 10,
      treeHeightM: Math.round((5 + frac(s + 4) * 15) * 10) / 10,  // 5–20 m
      anomaly: conf < CONFIDENCE_MIN,
    }
  })
}

export const mockBatchDetails: Record<string, BatchDetail> = Object.fromEntries(
  mockBatches.map((b) => {
    const geo = geoFor(b.farmId)
    const detail: BatchDetail = {
      ...b,
      _live: false,
      status: b.status as import('@/features/verifier/types').BatchStatus,
      phone: mockPhone(seedNum(b.id)),
      farmAddress: `อ.เมือง จ.${geo.province}`,
      checkinLat: geo.lat,
      checkinLng: geo.lng,
      polygon: geo.polygon,
      trees: buildTrees(b.id, b.treeCount, geo.lat, geo.lng, b.avgConfidence, b.submittedAt),
    }
    return [b.id, detail]
  }),
)
