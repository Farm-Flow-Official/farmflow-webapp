/** Authenticated admin as returned by the API (`/admin/auth/sign-in`, `/admin/auth/me`). */
export type AdminProfile = {
  id: string
  username: string
  roleId: string
  permissions: string[]
}

export type LoginState = { error: string } | undefined
