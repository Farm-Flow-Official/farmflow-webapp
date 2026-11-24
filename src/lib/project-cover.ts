import { publicFileUrl } from '@/lib/farm-cover'

/**
 * The upload rule, in the words shown to the person breaking it.
 *
 * Lives here rather than beside the Server Action that enforces it because a
 * `'use server'` module may export async functions and NOTHING else — a single
 * exported constant makes Next discard every export in the file, and TypeScript
 * cannot see it happen.
 */
export const COVER_LIMITS_TEXT = 'ไฟล์ JPEG / PNG / WebP ขนาดไม่เกิน 2 MB'

/**
 * Same-origin URL for a project's cover picture, or null when it has none.
 *
 * Delegates to the public-file proxy rather than adding a second identical
 * route — that proxy streams whatever public file the id names, and a project
 * cover is public for the same reason a farm's is: it exists to be looked at.
 */
export function projectCoverUrl(fileId: string | null | undefined): string | null {
  return publicFileUrl(fileId)
}

/**
 * The stand-in for a project with no picture yet.
 *
 * Every project starts without one, so an empty grey box would have made the
 * screens worse on the day this shipped, not better. A pattern derived from the
 * project code gives each project a stable mark immediately — the same project
 * always draws the same one, on the server and in the browser, so there is no
 * hydration mismatch and no lookup table to keep.
 *
 * Deliberately abstract, and deliberately pale: it must not read as a
 * photograph that failed to load, and text laid over it has to stay legible.
 * The hue carries identity, nothing more — it encodes no data about the project.
 */
export function projectPattern(code: string | null | undefined): { background: string } {
  const hue = hueFrom(code ?? '')
  // Two stops a third of the wheel apart: enough movement to look deliberate,
  // not so much that it reads as two different colours meeting.
  const a = `hsl(${hue} 42% 88%)`
  const b = `hsl(${(hue + 38) % 360} 38% 79%)`
  return { background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }
}

/** FNV-1a — small, stable, and identical in every JS runtime we render in. */
function hueFrom(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return Math.abs(h) % 360
}
