import type { AnomalyAlert, VerifierOverviewData } from '@/features/verifier/types'

/**
 * Temporary stand-in until verifier endpoints exist (the API currently has no
 * verifier-review layer: carbon_credit_batches / assessment_results are empty).
 * Farmer/farm names mirror the real seeded data. Delete once `fetchVerifierOverview()`
 * calls the real endpoint.
 */
const ALERTS: AnomalyAlert[] = [
  {
    id: 'AL-01',
    batchId: 'BATCH-2026-0042',
    farmName: 'ไร่หัวใจ',
    ownerName: 'วิชัย ไร่กาแฟ',
    treeCount: 38,
    aiConfidenceScore: 0.43,
    kind: 'low_confidence',
    detail: 'คะแนนความเชื่อมั่น AI เฉลี่ยต่ำมาก (< 0.50) ควรตรวจเร่งด่วน',
    submittedAt: '2026-06-08T07:45:00Z',
  },
  {
    id: 'AL-02',
    batchId: 'BATCH-2026-0039',
    farmName: 'แปลงริมน้ำ',
    ownerName: 'ดวงใจ ไร่สับปะรด',
    treeCount: 21,
    aiConfidenceScore: 0.61,
    kind: 'metadata_mismatch',
    detail: 'พิกัด GPS ไม่สอดคล้องกับ timestamp/สภาพอากาศของบางภาพ',
    submittedAt: '2026-06-07T03:20:00Z',
  },
  {
    id: 'AL-03',
    batchId: 'BATCH-2026-0035',
    farmName: 'ไร่สุขใจ',
    ownerName: 'ภานุพงศ์ ทุ่งทอง',
    treeCount: 44,
    aiConfidenceScore: 0.58,
    kind: 'low_confidence',
    detail: 'มี 12 ภาพที่ความเชื่อมั่นต่ำ ควรตรวจสอบเชิงลึก',
    submittedAt: '2026-06-06T09:10:00Z',
  },
]

export const mockVerifierOverview: VerifierOverviewData = {
  summary: {
    pendingReview: 7,
    anomalyAlerts: ALERTS.length,
    approvedThisMonth: 18,
    rejectedThisMonth: 4,
  },
  alerts: ALERTS,
}
