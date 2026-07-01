import type { BadgeVariant } from '@/components/ui/badge'
import type {
  PaymentSlip,
  PaymentSlipStatus,
} from '@/features/business/payments/types'

/** Status → badge variant + Thai label. */
export function slipStatusBadge(status: PaymentSlipStatus): {
  variant: BadgeVariant
  label: string
} {
  switch (status) {
    case 'Pending_Review':
      return { variant: 'pending', label: 'รอตรวจสอบ' }
    case 'Approved':
      return { variant: 'verified', label: 'อนุมัติแล้ว' }
    case 'Rejected':
      return { variant: 'rejected', label: 'ปฏิเสธ' }
  }
}

/** `true` when the declared amount does not equal the package price. */
export function hasAmountMismatch(slip: PaymentSlip): boolean {
  return slip.declaredAmountThb !== slip.expectedAmountThb
}
