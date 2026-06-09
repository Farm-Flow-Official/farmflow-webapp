import type { CSSProperties } from 'react'

/**
 * Deterministic earthy gradient standing in for a tree photo (no real images
 * yet — swap for `/api/v1/files/:id/content` when verifier file access opens).
 * Shared by the V-04 grid and the V-05 deep-inspect view.
 */
export function treePlaceholderStyle(id: string): CSSProperties {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const h = 90 + (seed % 40)
  const l = 26 + (seed % 12)
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${h} 38% ${l}%), hsl(${h - 18} 30% ${l - 8}%))`,
  }
}
