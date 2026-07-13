import type { PackageCode } from '@/features/business/packages/types'

/**
 * API contract for the Payment-slip domain (Business P03 — INCOMING money).
 * When `/api/business/payments` lands, only the service layer changes — every
 * UI component consumes these shapes unchanged.
 *
 * Backing table: `payment_slips` (ERD v4 delta §B) joined with `users`
 * (Minimal-PII), `packages`, and `files` (the slip image). Money sign-off
 * pattern: `verifiedBy` + `signedAt` ARE the signature record — no bank fields
 * are ever persisted (bank info below is mock display only).
 */

export type PaymentSlipStatus = 'Pending_Review' | 'Approved' | 'Rejected'

/** Mock slip metadata for the viewer — never persisted to any table. */
export type MockSlipInfo = {
  bankName: string
  accountName: string
  transferRef: string
  /** ISO 8601 — the time the customer claims they transferred. */
  transferredAt: string
}

export type PaymentSlip = {
  id: string
  userId: string
  /** Enriched join: `users.full_name`. */
  customerName: string
  /** Enriched join: `users.phone`. */
  phone: string
  packageCode: PackageCode
  /** Enriched join: `packages.name`. */
  packageName: string
  /** Enriched join: `packages.price_thb` — the price owed, for mismatch checks. */
  expectedAmountThb: number
  /** What the customer wrote on the slip. */
  declaredAmountThb: number
  /** Mock-only slip details shown in the viewer. */
  slip: MockSlipInfo
  status: PaymentSlipStatus
  /** Set when the slip's `files.checksum_hash` was already seen. */
  duplicateFlag: boolean
  /** Required, non-empty when `status === 'Rejected'`. */
  rejectionReason: string | null
  /** Sign-off: the Finance/Master username who resolved it. */
  verifiedBy: string | null
  /** Sign-off: ISO 8601 resolve time. */
  signedAt: string | null
  /** When the slip was uploaded. */
  createdAt: string
}

/** Mock write payload — Seam: `POST /api/business/payments/:id/{approve,reject}`. */
export type PaymentAction =
  | { type: 'approve' }
  | { type: 'reject'; reason: string }
