import type { PayoutRequest, PayoutStatus } from '@/features/payouts/types'
import { estimateValueThb } from '@/lib/constants/carbon'

/**
 * Temporary stand-in data until the admin payouts API lands. All bank details
 * are fabricated — not real personal data. Delete once `fetchPayouts()` calls
 * the real endpoint.
 */
type Seed = {
  id: string
  farmerId: string
  farmerName: string
  kg: number
  bankName: string
  accountNumber: string
  status: PayoutStatus
  requestedAt: string
}

const SEEDS: Seed[] = [
  { id: 'PO-2026-0012', farmerId: 'FRM-1007', farmerName: 'ธนากร ทุ่งรวง', kg: 64200, bankName: 'ธ.เพื่อการเกษตรฯ (ธ.ก.ส.)', accountNumber: '0123456789', status: 'Pending', requestedAt: '2026-06-07T03:20:00Z' },
  { id: 'PO-2026-0011', farmerId: 'FRM-1004', farmerName: 'วันเพ็ญ สวนเขียว', kg: 51800, bankName: 'ธ.กสิกรไทย', accountNumber: '1948372615', status: 'Pending', requestedAt: '2026-06-06T07:45:00Z' },
  { id: 'PO-2026-0010', farmerId: 'FRM-1013', farmerName: 'เอกพงษ์ ไร่มัน', kg: 47300, bankName: 'ธ.ไทยพาณิชย์', accountNumber: '4055129987', status: 'Pending', requestedAt: '2026-06-05T05:10:00Z' },
  { id: 'PO-2026-0009', farmerId: 'FRM-1017', farmerName: 'วิชัย ไร่กาแฟ', kg: 72100, bankName: 'ธ.กรุงเทพ', accountNumber: '6627341580', status: 'Approved', requestedAt: '2026-06-03T09:30:00Z' },
  { id: 'PO-2026-0008', farmerId: 'FRM-1001', farmerName: 'สมชาย ใจดี', kg: 38900, bankName: 'ธ.กรุงไทย', accountNumber: '8172635490', status: 'Approved', requestedAt: '2026-06-02T02:55:00Z' },
  { id: 'PO-2026-0007', farmerId: 'FRM-1022', farmerName: 'พิมพ์ชนก เรือนไร่', kg: 55600, bankName: 'ธ.ออมสิน', accountNumber: '0209887651', status: 'Paid', requestedAt: '2026-05-29T06:40:00Z' },
  { id: 'PO-2026-0006', farmerId: 'FRM-1009', farmerName: 'ชัยวัฒน์ ไร่อ้อย', kg: 41200, bankName: 'ธ.กสิกรไทย', accountNumber: '1736482910', status: 'Paid', requestedAt: '2026-05-27T08:15:00Z' },
  { id: 'PO-2026-0005', farmerId: 'FRM-1015', farmerName: 'ภานุพงศ์ ทุ่งทอง', kg: 33400, bankName: 'ธ.เพื่อการเกษตรฯ (ธ.ก.ส.)', accountNumber: '0345671298', status: 'Paid', requestedAt: '2026-05-24T04:05:00Z' },
  { id: 'PO-2026-0004', farmerId: 'FRM-1020', farmerName: 'ดวงใจ ไร่สับปะรด', kg: 28700, bankName: 'ธ.ไทยพาณิชย์', accountNumber: '4098112376', status: 'Rejected', requestedAt: '2026-05-21T11:25:00Z' },
  { id: 'PO-2026-0003', farmerId: 'FRM-1006', farmerName: 'มาลี ดอกไม้งาม', kg: 36100, bankName: 'ธ.กรุงเทพ', accountNumber: '6610042288', status: 'Paid', requestedAt: '2026-05-18T03:50:00Z' },
  { id: 'PO-2026-0002', farmerId: 'FRM-1003', farmerName: 'ประสิทธิ์ นาทอง', kg: 44800, bankName: 'ธ.กรุงไทย', accountNumber: '8123459076', status: 'Paid', requestedAt: '2026-05-14T07:30:00Z' },
  { id: 'PO-2026-0001', farmerId: 'FRM-1011', farmerName: 'สุรชัย นาข้าว', kg: 22500, bankName: 'ธ.ออมสิน', accountNumber: '0277665431', status: 'Rejected', requestedAt: '2026-05-10T05:00:00Z' },
]

export const mockPayouts: PayoutRequest[] = SEEDS.map((s) => ({
  id: s.id,
  farmerId: s.farmerId,
  farmerName: s.farmerName,
  totalCarbonKgCo2e: s.kg,
  estimatedValueThb: estimateValueThb(s.kg),
  bankName: s.bankName,
  accountNumber: s.accountNumber,
  status: s.status,
  requestedAt: s.requestedAt,
}))
