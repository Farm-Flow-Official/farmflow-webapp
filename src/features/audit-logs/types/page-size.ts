/**
 * Rows per page in the audit log.
 *
 * Its own module for the same reason as the farm queue's — see
 * `features/farms/types/page-size.ts`. A constant exported from a `'use client'`
 * module reads as `undefined` in a server component.
 */
export const AUDIT_PAGE_SIZE = 10
