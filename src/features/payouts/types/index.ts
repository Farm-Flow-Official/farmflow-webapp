/**
 * API contract for the Payout domain. When the admin endpoints land, only the
 * service layer changes — every UI component consumes these shapes unchanged.
 */
export type PayoutStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid'

export type PayoutRequest = {
  /** requestId — also the route param for the detail page. */
  id: string
  farmerId: string
  farmerName: string
  /** Carbon backing the withdrawal, in kg CO₂e (`total_carbon_kgco2e`). */
  totalCarbonKgCo2e: number
  /** `totalCarbonKgCo2e × market_price_thb`, rounded to THB. */
  estimatedValueThb: number
  bankName: string
  /**
   * PDPA: full account number — financial personal data. The queue masks it at
   * the display layer (`maskAccountNumber`); only the access-controlled detail
   * view shows it in full to a FINANCE/MASTER admin who needs it to transfer.
   */
  accountNumber: string
  status: PayoutStatus
  /** ISO 8601 — when the farmer requested the withdrawal. */
  requestedAt: string
}
