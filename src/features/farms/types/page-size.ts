/**
 * Rows per page in the farm approval queue.
 *
 * Lives in its own module rather than being exported from `FarmQueueTable`.
 * That component is `'use client'`, and a server component importing a plain
 * constant from a client module gets `undefined`: Next replaces the module with
 * a client-reference proxy that carries components, not values. The page then
 * computed `(page - 1) * undefined` → `NaN`, sent it as `offset`, and the API
 * answered 422 — a blank screen from a value that looked like a harmless import.
 */
export const FARM_PAGE_SIZE = 25
