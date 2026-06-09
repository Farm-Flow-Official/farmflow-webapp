/** Authenticated external verifier (mock for BETA — see auth/actions.ts). */
export type VerifierProfile = {
  id: string
  username: string
  /** External verifier organisation, e.g. "VGREEN". */
  org: string
  role: 'Verifier'
}

export type VerifierLoginState = { error: string } | undefined
