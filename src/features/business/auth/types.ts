/** Business-dashboard staff roles (seeded into `roles`; see ERD v4 delta §C). */
export type BusinessRole =
  | 'BusinessMaster'
  | 'Finance'
  | 'Sales'
  | 'Marketing'
  | 'CustomerService'

/** Authenticated business-staff profile, mirroring `AdminProfile`. */
export type BusinessProfile = {
  id: string
  username: string
  role: BusinessRole
  /** Permission codes from `permissions` / `role_permissions` (see Business spec §3.1). */
  permissions: string[]
}
