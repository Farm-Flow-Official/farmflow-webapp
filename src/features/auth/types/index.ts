/** Authenticated admin as returned by the API (`/admin/auth/sign-in`, `/admin/auth/me`). */
export type AdminProfile = {
  id: string
  username: string
  roleId: string
  /** Role name (e.g. MASTER, FINANCE). Verifiers use their own portal. */
  roleName: string
  permissions: string[]
}

export type LoginState = { error: string } | undefined
