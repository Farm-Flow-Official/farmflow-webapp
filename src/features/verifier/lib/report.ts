/** Issued-document session id for a batch (BATCH-2026-0034 → SES-2026-0034). */
export function batchSessionId(batchId: string): string {
  return batchId.replace(/^BATCH/, 'SES')
}

/**
 * Esri World Imagery tile URL containing (lat, lng) at `zoom` — a single static
 * satellite image for the PDF report (no Leaflet needed in print).
 */
export function centroidTileUrl(lat: number, lng: number, zoom = 16): string {
  const n = 2 ** zoom
  const x = Math.floor(((lng + 180) / 360) * n)
  const r = (lat * Math.PI) / 180
  const y = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n)
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
}
