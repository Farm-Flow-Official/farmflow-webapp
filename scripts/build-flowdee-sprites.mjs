/**
 * Builds the Flowdee mascot sprites used by `FlowdeeMascot`.
 *
 *   node scripts/build-flowdee-sprites.mjs
 *
 * Reads the 1254x1254 renders in `assets/flowdee/` and writes aligned, web-sized
 * WebP into `public/flowdee/`. Two problems are solved here rather than at
 * runtime:
 *
 * 1. ALIGNMENT. The four renders are the same character at the same scale — the
 *    dark face panel measures 470-498px wide in all of them — but their overall
 *    silhouettes are not comparable: THINKING sits cross-legged so it is short
 *    and wide, ALERT carries a "!" above its head, CONFIDENT stands tallest.
 *    Scaling each to a common HEIGHT therefore inflates THINKING's head and
 *    shrinks ALERT's, and the head drifts sideways too — so swapping poses on a
 *    confidence change reads as a glitching image, not as a character changing
 *    stance. Instead every pose is scaled so its FACE PANEL is the same width
 *    and positioned so the face centre sits at the same point, with the figure
 *    standing on a shared baseline. The head then holds perfectly still and only
 *    the arms and props move. A sitting pose ends up shorter than a standing
 *    one, which is what a sitting pose should look like.
 *
 * 2. WEIGHT. The sources are ~780KB each; the card shows them at 80px tall.
 *
 * The face panel is found by scanning for near-black pixels that belong to a
 * horizontal run at least 15% of the image wide — that picks up the screen and
 * ignores the thin dark outlines around the body.
 */
import { readdir, mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const SRC_DIR = 'assets/flowdee'
const OUT_DIR = 'public/flowdee'

/** Face-panel width every pose is normalised to, in CSS pixels. */
const TARGET_FACE_W = 33
/** Sprites ship at 2x so they stay crisp on retina. */
const DPR = 2
/** Breathing room around the tallest/widest figure, in CSS pixels. */
const PAD = 2

const POSES = {
  Flowdee_CONFIDENT_Mascot: 'confident',
  Flowdee_INSPECTING_Mascot: 'inspecting',
  Flowdee_ALERT_Mascot: 'alert',
  Flowdee_THINKING_Mascot: 'thinking',
}

/** Alpha bounding box plus the face-panel box, in source pixels. */
async function measure(file) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels } = info
  const at = (x, y) => (y * w + x) * channels
  const opaque = (x, y) => data[at(x, y) + 3] > 16
  const veryDark = (x, y) => {
    const i = at(x, y)
    return data[i + 3] > 200 && data[i] < 50 && data[i + 1] < 50 && data[i + 2] < 50
  }

  let box = { minX: w, maxX: 0, minY: h, maxY: 0 }
  let face = { minX: w, maxX: 0, minY: h, maxY: 0 }
  const minRun = Math.round(w * 0.15)

  for (let y = 0; y < h; y++) {
    let run = 0
    let start = 0
    for (let x = 0; x <= w; x++) {
      if (x < w && opaque(x, y)) {
        if (x < box.minX) box.minX = x
        if (x > box.maxX) box.maxX = x
        if (y < box.minY) box.minY = y
        if (y > box.maxY) box.maxY = y
      }
      // Face panel: only runs long enough to be the screen, not an outline.
      if (x < w && veryDark(x, y)) {
        if (run === 0) start = x
        run++
      } else {
        if (run >= minRun) {
          if (start < face.minX) face.minX = start
          if (x - 1 > face.maxX) face.maxX = x - 1
          if (y < face.minY) face.minY = y
          if (y > face.maxY) face.maxY = y
        }
        run = 0
      }
    }
  }

  if (face.maxX <= face.minX) throw new Error(`no face panel found in ${file}`)
  return {
    box,
    scale: TARGET_FACE_W / (face.maxX - face.minX + 1),
    faceCx: (face.minX + face.maxX) / 2,
  }
}

const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.png'))
const measured = []

for (const file of files) {
  const name = POSES[file.replace(/\.png$/, '')]
  if (!name) throw new Error(`unmapped source file ${file} — add it to POSES`)
  const m = await measure(`${SRC_DIR}/${file}`)
  measured.push({ file, name, ...m })
}

// One canvas for every pose, big enough for the widest arms and tallest head.
const leftMost = Math.max(...measured.map((m) => (m.faceCx - m.box.minX) * m.scale))
const rightMost = Math.max(...measured.map((m) => (m.box.maxX - m.faceCx) * m.scale))
const tallest = Math.max(...measured.map((m) => (m.box.maxY - m.box.minY + 1) * m.scale))

const FACE_X = Math.ceil(leftMost + PAD)
const CANVAS_W = FACE_X + Math.ceil(rightMost + PAD)
const CANVAS_H = Math.ceil(tallest)

await mkdir(OUT_DIR, { recursive: true })

for (const m of measured) {
  const { box, scale, name } = m
  const src = `${SRC_DIR}/${m.file}`
  const meta = await sharp(src).metadata()
  const s = scale * DPR
  const resized = await sharp(src)
    .resize(Math.round(meta.width * s), Math.round(meta.height * s))
    .toBuffer()

  const crop = {
    left: Math.round(box.minX * s),
    top: Math.round(box.minY * s),
    width: Math.round((box.maxX - box.minX + 1) * s),
    height: Math.round((box.maxY - box.minY + 1) * s),
  }
  const figure = await sharp(resized).extract(crop).toBuffer()
  const faceOffset = Math.round(m.faceCx * s) - crop.left

  await sharp({
    create: {
      width: CANVAS_W * DPR,
      height: CANVAS_H * DPR,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: figure,
        // Face centre on the shared vertical axis, feet on the shared baseline.
        left: FACE_X * DPR - faceOffset,
        top: CANVAS_H * DPR - crop.height,
      },
    ])
    .webp({ quality: 90, effort: 6 })
    .toFile(`${OUT_DIR}/${name}.webp`)

  console.log(`  ${name}.webp`)
}

console.log(
  `\nCanvas ${CANVAS_W}x${CANVAS_H} CSS px (@${DPR}x = ${CANVAS_W * DPR}x${CANVAS_H * DPR}).`,
)
console.log(`Face centre at x=${FACE_X}, baseline at the bottom edge.`)
console.log('Keep these numbers in sync with FlowdeeMascot.tsx.')
