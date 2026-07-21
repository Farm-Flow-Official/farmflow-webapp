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
