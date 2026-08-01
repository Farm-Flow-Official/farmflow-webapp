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

/*
 * `formatCarbon()` used to live here and rounded kilograms to whole numbers.
 * The `<Carbon />` component replaced it — carbon reads to two decimals
 * everywhere now, and a helper that quietly rounds differently is exactly how
 * two screens end up disagreeing about the same tree.
 */

/** Just the tonnes — `"12.35 tCO2e"`. For stat cards and table cells. */
export function formatCarbonTonnes(kgCo2e: number): string {
  const tonnes = kgCo2e / 1000
  return `${tonnes.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} tCO2e`
}

/**
 * Just the kilograms, to two decimals — `"12,350.42 kgCO2e"`.
 *
 * Two places everywhere, so a figure means the same thing on every screen and
 * two rows can be compared at a glance. It used to round to whole kilograms
 * here and to two decimals for tonnes, which made the same quantity read
 * differently depending on where you saw it.
 *
 * This is a *display* rounding only — the stored value keeps its full
 * precision and is one click away via {@link formatCarbonExact}. Never do
 * arithmetic on the output of this function.
 */
export function formatCarbonKg(kgCo2e: number): string {
  return `${kgCo2e.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kgCO2e`
}

/**
 * The stored value, in full — for the "show exact value" affordance.
 *
 * Carbon is what the farmer is paid for, so somebody checking the arithmetic
 * has to be able to reach the number the engine actually produced, not the one
 * rounded for the table. Both units, because the credit is issued in tonnes and
 * computed in kilograms.
 */
export function formatCarbonExact(kgCo2e: number): string {
  return `${kgCo2e / 1000} tCO2e · ${kgCo2e} kgCO2e`
}

/**
 * Area to two decimals — `"12.35 ไร่"`.
 *
 * Two places is what a person can hold in their head and compare across rows.
 * The full-precision value is not thrown away: pair this with a tooltip showing
 * {@link formatRaiExact} wherever the exact figure could matter, such as a
 * boundary dispute.
 */
export function formatRai(rai: number | null | undefined): string {
  if (rai == null) return '—'
  return `${rai.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ไร่`
}

/** Area at full stored precision, for the "show exact value" affordance. */
export function formatRaiExact(rai: number | null | undefined): string {
  if (rai == null) return '—'
  return `${rai} ไร่`
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
