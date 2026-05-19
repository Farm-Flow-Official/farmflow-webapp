export type AdminRole = 'MASTER' | 'VERIFY' | 'FINANCE' | 'GENERAL'

export type AdminSession = {
  token: string
  adminId: string
  role: AdminRole
  name: string
}

export type LoginState =
  | { error: string }
  | undefined
