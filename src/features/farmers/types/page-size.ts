/**
 * Rows per page in the Farmer Users table.
 *
 * Its own module because a constant exported from a `'use client'` file reads
 * as `undefined` in a server component — see `features/farms/types/page-size.ts`.
 */
export const FARMER_USERS_PAGE_SIZE = 20
