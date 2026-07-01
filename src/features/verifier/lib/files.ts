/**
 * Same-origin URL for a private snapshot photo. Points at the verifier file
 * proxy ([app/verifier/files/[id]/route.ts]), which forwards the session cookie
 * to the API server-side — a browser can't reach the API origin with the
 * httpOnly `verifier_access` cookie directly.
 */
export function snapshotPhotoUrl(fileId: string): string {
  return `/verifier/files/${fileId}`
}
