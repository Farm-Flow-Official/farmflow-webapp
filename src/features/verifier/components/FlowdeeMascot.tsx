import { confidenceTone } from '@/features/verifier/lib/confidence'

/**
 * Sprite geometry, mirrored from `scripts/build-flowdee-sprites.mjs` — every
 * pose is drawn on this canvas with its face centred at `FACE_X` and its feet
 * on the bottom edge. Re-run the script and update these if the poses change.
 */
const SPRITE = { width: 78, height: 80, faceX: 38 }

/**
 * Distance from the card's inner left edge to where Flowdee's face should sit.
 * The image is offset by `faceX` so the face — not the bounding box, which the
 * arms and props stretch differently in every pose — lands here.
 */
const FACE_FROM_EDGE = 46

export type FlowdeePose = 'confident' | 'inspecting' | 'alert' | 'thinking'

/**
 * Which pose the card's state calls for, or `null` when Flowdee has nothing to
 * say and the header should fall back to its plain mark.
 *
 * The three scored poses ride on `confidenceTone`, the same three bands the ring
 * colour and the Thai tone label already use, so the mascot can never contradict
 * them — a thumbs-up beside a red ring is not reachable.
 *
 * `failed` deliberately gets no mascot. The card is telling the reviewer the AI
 * did not run and they are on their own; a character in any pose would soften a
 * message that should stay flat.
 */
export function flowdeePose(
  score: number | null,
  state?: 'failed' | 'waiting',
): FlowdeePose | null {
  if (state === 'waiting') return 'thinking'
  if (state === 'failed' || score == null) return null
  const tone = confidenceTone(score)
  return tone === 'ok' ? 'confident' : tone === 'watch' ? 'inspecting' : 'alert'
}

/**
 * The Flowdee mascot perched on the AI panel's nameplate.
 *
 * Renders two things: a spacer that holds a gap open in the header's flex row,
 * and the sprite itself, positioned absolutely so it can stand on the header's
 * bottom edge and overflow past the card's top. **The header must be
 * `relative`, the card must not be `overflow-hidden`, and the card needs enough
 * top margin for the 22px that pokes out.**
 *
 * `h-20 w-[78px]` restates `SPRITE` because Tailwind only sees static class
 * strings — an interpolated size would never make it into the stylesheet.
 *
 * Decorative only: `ConfidenceRing` already announces the score to a screen
 * reader, and a mascot that repeats it would just read the number twice.
 */
export function FlowdeeMascot({ pose }: { pose: FlowdeePose }) {
  return (
    <span className="block h-6 w-[68px] shrink-0" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- the sprite is
          already built at its display size (8-10KB); routing it through the
          image optimiser would add a request and save nothing. */}
      <img
        src={`/flowdee/${pose}.webp`}
        alt=""
        width={SPRITE.width}
        height={SPRITE.height}
        className={`pointer-events-none absolute bottom-0 h-20 w-[78px] max-w-none origin-bottom select-none ${
          pose === 'thinking'
            ? // Matches the ring's own waiting pulse. It means "not finished",
              // not "watch this update" — the page does not poll.
              'animate-pulse'
            : 'animate-[flowdee-in_0.5s_ease-out_forwards]'
        }`}
        style={{ left: FACE_FROM_EDGE - SPRITE.faceX }}
      />
    </span>
  )
}
