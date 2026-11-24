export type ExecutiveProfile = {
  id: string
  username: string
  role: string
  mustChangePassword: boolean
}

export type ExecutiveLoginState = { error?: string } | undefined
