/** Authenticated external verifier as returned by `/verifier/auth/me`. */
export type VerifierProfile = {
  id: string
  username: string
  /** Verifier role label from the API. */
  role: string
  /** External verifier organisation (e.g. "VGREEN"); null when unset. */
  org: string | null
}

export type VerifierLoginState = { error: string } | undefined
