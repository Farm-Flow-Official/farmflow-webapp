/** Shared display formatters. Keep UI components free of locale/format logic. */

/** ISO date string → "8 มิ.ย. 2025" (Thai locale, short month). */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Bangkok',
  })
}

/** Digits → "081-234-5678". Returns the input untouched if it isn't 10 digits. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** Number → "1,234" (grouped). */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/** ISO date string → "8 มิ.ย. 2568 14:32" (Thai locale, date + 24h time). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  })
}

/**
 * ISO date string → Thai relative time ("3 ชม.ที่แล้ว"). Falls back to an
 * absolute date for anything older than a week. Computed against the caller's
 * clock — use in client components and guard with `suppressHydrationWarning`.
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return '—'
  const sec = Math.floor((Date.now() - then.getTime()) / 1000)
  if (sec < 60) return 'เมื่อสักครู่'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} นาทีที่แล้ว`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ชม.ที่แล้ว`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} วันที่แล้ว`
  return formatDate(iso)
}
