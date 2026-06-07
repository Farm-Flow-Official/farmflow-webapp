/** Shared display formatters. Keep UI components free of locale/format logic. */

/** ISO date string → "8 มิ.ย. 2025" (Thai locale, short month). */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
