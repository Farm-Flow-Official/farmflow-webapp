/**
 * Same-origin URL for a farm's cover photo. Points at the public cover proxy
 * ([app/farm-cover/[id]/route.ts]), which streams the bytes from the API
 * server-side — the browser can't reach the API origin directly (its URL is a
 * server-only env). Cover photos are public, so no auth is involved.
 *
 * Returns null when the farm has no cover photo, so callers can branch to a
 * placeholder without repeating the null check.
 */
export function coverPhotoUrl(fileId: string | null | undefined): string | null {
  return fileId ? `/farm-cover/${fileId}` : null
}

/**
 * Same-origin URL for any **public** file — announcement banners today.
 *
 * The proxy under `/farm-cover/[id]` is not cover-photo specific: it streams
 * whatever public file the id names. Reusing it beats a second identical route,
 * and this alias keeps callers from having to know it is named after its first
 * customer.
 */
export function publicFileUrl(fileId: string | null | undefined): string | null {
  return coverPhotoUrl(fileId)
}
