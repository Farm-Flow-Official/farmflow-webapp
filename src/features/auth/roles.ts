/**
 * Role that owns the verifier portal. Admins and verifiers share one identity
 * store (ADR 0006); a verifier must not reach the admin dashboard. The API is
 * the authoritative gate (admin sign-in + every admin guard reject this role) —
 * this constant powers a defense-in-depth redirect in the admin layout.
 */
export const VERIFIER_ROLE = 'VERIFIER'
