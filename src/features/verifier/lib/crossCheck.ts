import type { BatchDetail, TreeSnapshot } from '@/features/verifier/types'
import { CONFIDENCE_MIN } from '@/features/verifier/lib/confidence'

export type CrossCheck = {
  key: string
  label: string
  status: 'pass' | 'fail'
  detail: string
}

/** Ray-casting point-in-polygon. `ring` = [lng, lat][] (GeoJSON order). */
export function pointInPolygon(lng: number, lat: number, ring: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Verifier cross-checks for a tree snapshot. Two checks are computed for real:
 * AI confidence threshold, and whether the GPS capture point falls inside the
 * registered farm polygon (anti-greenwashing — a photo taken outside the claimed
 * plot is suspect).
 *
 * The spec also mentions a weather × timestamp cross-check; it's intentionally
 * omitted because there's no real weather history/metadata to compare against —
 * mocking it would imply a check that isn't actually happening.
 */
export function crossCheckTree(tree: TreeSnapshot, batch: BatchDetail): CrossCheck[] {
  const confOk = tree.aiConfidenceScore >= CONFIDENCE_MIN
  const inBoundary = pointInPolygon(tree.captureLng, tree.captureLat, batch.polygon)

  return [
    {
      key: 'confidence',
      label: 'ความเชื่อมั่น AI',
      status: confOk ? 'pass' : 'fail',
      detail: confOk
        ? `${Math.round(tree.aiConfidenceScore * 100)}% — ผ่านเกณฑ์`
        : `${Math.round(tree.aiConfidenceScore * 100)}% — ต่ำกว่าเกณฑ์ ${Math.round(CONFIDENCE_MIN * 100)}%`,
    },
    {
      key: 'gps',
      label: 'ตำแหน่ง GPS',
      status: inBoundary ? 'pass' : 'fail',
      detail: inBoundary
        ? 'จุดถ่ายภาพอยู่ในขอบเขตแปลง'
        : 'จุดถ่ายภาพอยู่นอกขอบเขตแปลงที่ขึ้นทะเบียน',
    },
  ]
}
