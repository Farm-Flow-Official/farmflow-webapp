import { Sprout } from 'lucide-react'
import { BASELINE_LABEL_SHORT } from '@/features/verifier/baseline'

/**
 * The green tag marking the session that set a farm's reference carbon stock
 * (VERIFIER-BASELINE-01).
 *
 * Green rather than the neutral pill every other status uses: this is the one
 * session in a farm's history that later rounds are measured against, and a
 * verifier scanning a queue needs to find it without reading.
 */
export function BaselineTag({ className = '' }: { className?: string }) {
  return (
    <span
      title="รอบนี้ถูกบันทึกเป็นเส้นฐาน (ปีที่ 0) ของฟาร์มในโครงการนี้"
      className={`inline-flex h-6 items-center gap-1 rounded bg-success-bg px-2 text-xs font-semibold tracking-wide text-success ${className}`}
    >
      <Sprout className="h-3 w-3" strokeWidth={2.2} aria-hidden />
      {BASELINE_LABEL_SHORT}
    </span>
  )
}
