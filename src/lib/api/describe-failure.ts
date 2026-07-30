import { ApiError } from './unwrap'

/**
 * Turns a failed API call into something a person can act on.
 *
 * This runs on the **server**, deliberately. Next.js redacts server-component
 * error messages in production — an `error.tsx` boundary receives a generic
 * string and a `digest`, nothing more — so a boundary cannot tell a stale API
 * from an expired session. The page that made the call still can, because it
 * still holds the real `ApiError`. Diagnose there, pass the words down.
 *
 * The distinctions below are the ones with different fixes. They are not
 * hypothetical: the first staging deploy of the project features hit the first
 * two in order, and the screen said only "Application error".
 */
export type ApiFailure = {
  title: string
  detail: string
  /** Shown small, for whoever reads the logs. */
  reference?: string
}

export function describeApiFailure(err: unknown, what: string): ApiFailure {
  if (!(err instanceof ApiError)) {
    const message = err instanceof Error ? err.message : ''

    if (message.includes('FARMFLOW_API_URL')) {
      return {
        title: 'ยังไม่ได้ตั้งค่าที่อยู่ของ API',
        detail:
          'ต้องตั้ง FARMFLOW_API_URL ใน Environment Variables ของ Vercel ให้ครบทุก scope (Production, Preview, Development) แล้ว redeploy',
      }
    }
    return {
      title: `เปิด${what}ไม่ได้`,
      detail: 'เชื่อมต่อ API ไม่ได้ — ตรวจว่า API ยังให้บริการอยู่ แล้วลองใหม่',
      reference: message || undefined,
    }
  }

  const reference = `${err.status}${err.code ? ` ${err.code}` : ''}`

  // A 404 on a route this app is *compiled against* is not a missing record —
  // it is an API older than the app. That is a deploy-order problem, and naming
  // it is the difference between a one-line fix and a day of guessing.
  if (err.status === 404 || err.code === 'ROUTE_NOT_FOUND') {
    return {
      title: 'API ที่เชื่อมต่ออยู่เก่ากว่าเว็บรุ่นนี้',
      detail:
        'เว็บถูก deploy นำหน้า API — endpoint ที่หน้านี้เรียกยังไม่มีใน API ปลายทาง ต้อง deploy API รุ่นเดียวกัน แล้วรัน migrate และ seed',
      reference,
    }
  }

  if (err.status === 401) {
    return {
      title: 'เซสชันหมดอายุ',
      detail: 'กรุณาเข้าสู่ระบบอีกครั้ง',
      reference,
    }
  }

  // The sibling of version skew: routes deployed, permission codes not granted.
  // Same deploy, the next step forgotten — so it gets its own message.
  if (err.status === 403) {
    return {
      title: 'บัญชีนี้ยังไม่มีสิทธิ์เข้าถึงส่วนนี้',
      detail:
        'สิทธิ์ชุด projects:* และ pdd:* มาจาก seed — ถ้าเพิ่ง deploy API รุ่นใหม่ ให้รัน seed ซ้ำ (ปลอดภัย ไม่ลบข้อมูล) แล้วเข้าสู่ระบบใหม่',
      reference,
    }
  }

  if (err.status >= 500) {
    return {
      title: 'API ตอบกลับด้วยข้อผิดพลาด',
      detail:
        'มักเกิดจากฐานข้อมูลยังไม่ได้ migrate ให้ตรงกับ API รุ่นนี้ — ตรวจ log ของ API และรัน migrate',
      reference,
    }
  }

  return {
    title: `เปิด${what}ไม่ได้`,
    detail: err.message,
    reference,
  }
}
