/**
 * Farmer account as the admin list expects it. This type is the *contract*
 * between the UI and the API — when the admin endpoint is ready, the only
 * change required is the body of `fetchFarmers()`; everything consuming this
 * shape stays the same.
 */
export type FarmerAccountStatus = 'Active' | 'Suspended'

export type Farmer = {
  /** farmer_id — stable identifier, also the route param for the detail page. */
  id: string
  fullName: string
  phone: string
  email: string | null
  accountStatus: FarmerAccountStatus
  /** Number of farms registered to this account. */
  farmsCount: number
  /** ISO 8601 registration timestamp. */
  registeredAt: string
}
