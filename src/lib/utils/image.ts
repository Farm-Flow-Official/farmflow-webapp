/**
 * Shrink an image in the browser before it is uploaded.
 *
 * A banner comes out of a design tool, and design tools export at print
 * resolution: a 4000px PNG poster is routinely 15–20 MB, while the same artwork
 * displayed at 1600px is a fraction of that. Raising the server limit to fit
 * the original would only move the problem — every viewer would then download
 * 20 MB to look at a notice.
 *
 * So the file is decoded, scaled to something the screen can actually use, and
 * re-encoded. Format is preserved where it can be: a PNG stays a PNG so
 * transparency survives, and only falls back to JPEG when PNG re-encoding is
 * still over budget, which is the point at which the picture is a photograph
 * and its alpha channel is not carrying anything.
 *
 * Decoding is also the honest test of "is this an image": a browser that cannot
 * decode it cannot display it either, whatever the file extension claims.
 */

/** The banner is never displayed larger than this, so nothing above it is used. */
const MAX_DIMENSION = 1600

export type ResizeResult =
  | { ok: true; file: File; resized: boolean }
  | { ok: false; error: string }

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode failed'))
    }
    img.src = url
  })
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

export async function shrinkImageForUpload(
  file: File,
  maxBytes: number,
): Promise<ResizeResult> {
  let img: HTMLImageElement
  try {
    img = await loadImage(file)
  } catch {
    return { ok: false, error: 'เปิดไฟล์นี้เป็นรูปภาพไม่ได้ — ลองบันทึกเป็น JPG หรือ PNG ก่อน' }
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))

  // Already small enough in both senses: send the original untouched rather
  // than re-encoding it and losing a little quality for nothing.
  if (scale === 1 && file.size <= maxBytes) {
    return { ok: true, file, resized: false }
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) return { ok: false, error: 'ย่อรูปไม่สำเร็จ กรุณาลองรูปอื่น' }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Keep the source format first — a PNG poster with a transparent edge should
  // not silently gain a black background.
  const keepFormat = file.type === 'image/png' || file.type === 'image/webp'
  let blob = await toBlob(canvas, keepFormat ? file.type : 'image/jpeg', 0.9)

  // Still too big: the picture is photographic, so alpha is not the point and
  // JPEG will do what PNG cannot.
  if (blob && blob.size > maxBytes && keepFormat) {
    blob = await toBlob(canvas, 'image/jpeg', 0.85)
  }

  if (!blob) return { ok: false, error: 'ย่อรูปไม่สำเร็จ กรุณาลองรูปอื่น' }
  if (blob.size > maxBytes) {
    return { ok: false, error: 'รูปนี้ใหญ่เกินไปแม้จะย่อแล้ว กรุณาลดขนาดรูปก่อนอัปโหลด' }
  }

  const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png'
  const base = file.name.replace(/\.[^.]+$/, '') || 'banner'

  return {
    ok: true,
    file: new File([blob], `${base}.${extension}`, { type: blob.type }),
    resized: true,
  }
}
