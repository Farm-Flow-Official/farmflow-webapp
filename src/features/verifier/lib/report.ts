/** Issued-document id for a session (BATCH-2026-0034 → SES-2026-0034). */
export function issuedSessionId(sessionId: string): string {
  return sessionId.replace(/^BATCH/, 'SES')
}

const ESRI_EXPORT =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export'

/**
 * A satellite image of an explicit bounding box.
 *
 * The export endpoint takes the extent we ask for, unlike the tile endpoint,
 * whose framing depends on where the subject happens to fall in the global tile
 * grid. That difference matters here: with tiles, a plot near a tile seam had to
 * be zoomed out several levels before it fitted inside one image, so identical
 * farms rendered at wildly different scales for no reason a reader could see.
 */
function imageryUrl(
  bbox: { west: number; south: number; east: number; north: number },
  width: number,
  height: number,
): string {
  const extent = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`
  return `${ESRI_EXPORT}?bbox=${extent}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=png&transparent=false&f=image`
}

/** Satellite imagery centred on a point, when there is no boundary to frame. */
export function centroidTileUrl(lat: number, lng: number, spanDeg = 0.006): string {
  const half = spanDeg / 2
  return imageryUrl(
    { west: lng - half, south: lat - half, east: lng + half, north: lat + half },
    IMAGE_W,
    IMAGE_H,
  )
}

/** Rendered size of the report's map. The aspect ratio drives the bbox padding. */
const IMAGE_W = 440
const IMAGE_H = 320

/** Share of the frame left as margin around the plot, so it never touches an edge. */
const PADDING = 0.18

export type PlotOverlay = {
  imageUrl: string
  /** SVG `points` in a `0 0 IMAGE_W IMAGE_H` viewBox, aligned to the image. */
  points: string
}

/**
 * The farm boundary drawn over satellite imagery of that exact plot
 * (VERIFIER-DETAIL-03).
 *
 * The report previously showed imagery alone, which proves a place exists but
 * not that it is *this* plot — a verifier had to take the coordinates on faith.
 * Overlaying the boundary makes the document self-evidencing: the shape and the
 * ground are the same picture.
 *
 * The bbox is derived from the boundary and padded, then stretched to the
 * image's aspect ratio so the plot is never distorted. Returns null when there
 * is nothing to draw, so the caller can fall back to a plain centred image.
 */
export function plotOverlay(polygon: [number, number][]): PlotOverlay | null {
  if (polygon.length < 3) return null

  // Stored as [lng, lat] (GeoJSON order).
  const lngs = polygon.map(([lng]) => lng)
  const lats = polygon.map(([, lat]) => lat)
  if (![...lngs, ...lats].every(Number.isFinite)) return null

  const west = Math.min(...lngs)
  const east = Math.max(...lngs)
  const south = Math.min(...lats)
  const north = Math.max(...lats)

  const centreLng = (west + east) / 2
  const centreLat = (south + north) / 2

  // A degenerate boundary (all points identical) would give a zero-width bbox
  // and a division by zero below; fall back to a small fixed extent.
  const rawW = Math.max(east - west, 1e-5)
  const rawH = Math.max(north - south, 1e-5)

  // Longitude degrees are shorter than latitude degrees away from the equator.
  // Without this the plot renders stretched east-west — in Thailand by ~3%,
  // which is enough to make a square field look rectangular on a formal document.
  const lngScale = Math.cos((centreLat * Math.PI) / 180) || 1

  // Grow the smaller dimension until the extent matches the image's aspect
  // ratio, so the imagery is never squashed to fit.
  const targetAspect = IMAGE_W / IMAGE_H
  const aspect = (rawW * lngScale) / rawH

  let halfW = rawW / 2
  let halfH = rawH / 2
  if (aspect < targetAspect) {
    halfW = (rawH * targetAspect) / lngScale / 2
  } else {
    halfH = (rawW * lngScale) / targetAspect / 2
  }

  halfW *= 1 + PADDING
  halfH *= 1 + PADDING

  const bbox = {
    west: centreLng - halfW,
    east: centreLng + halfW,
    south: centreLat - halfH,
    north: centreLat + halfH,
  }

  const points = polygon
    .map(([lng, lat]) => {
      const x = ((lng - bbox.west) / (bbox.east - bbox.west)) * IMAGE_W
      // Latitude grows northward, screen y grows downward — hence the flip.
      const y = ((bbox.north - lat) / (bbox.north - bbox.south)) * IMAGE_H
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return { imageUrl: imageryUrl(bbox, IMAGE_W, IMAGE_H), points }
}

/** The viewBox the overlay's points are expressed in. */
export const PLOT_VIEWBOX = `0 0 ${IMAGE_W} ${IMAGE_H}`
