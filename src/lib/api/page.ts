/** The paged envelope every server-filtered list returns. */
export type ApiPage<T> = {
  rows: T[]
  total: number
  limit: number
  offset: number
}

/**
 * Coerce a page's counters to numbers.
 *
 * The generated types widen integer fields to `string | number`, and casting the
 * warning away would leave `total` as a string at runtime — where
 * `Math.ceil(total / pageSize)` silently produces a wrong page count and the
 * pager stops at the wrong place. Converting once here keeps every list honest.
 */
export function toPage<T>(
  page: { rows: unknown[]; total: string | number; limit: string | number; offset: string | number },
  mapRow: (row: never) => T,
): ApiPage<T> {
  return {
    rows: page.rows.map((r) => mapRow(r as never)),
    total: Number(page.total),
    limit: Number(page.limit),
    offset: Number(page.offset),
  }
}
