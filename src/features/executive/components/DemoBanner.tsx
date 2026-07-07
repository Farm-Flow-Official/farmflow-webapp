import { TriangleAlert } from 'lucide-react'

/**
 * Loud, unmissable marker that every number below is illustrative mock data —
 * this surface exists to validate KPIs with executives, not to report real
 * figures. (The product's real dashboards use ComingSoon instead of mock.)
 */
export function DemoBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning-bg px-4 py-3 text-warning">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <p className="text-[13px] leading-relaxed">
        <span className="font-semibold">ข้อมูลตัวอย่าง (DEMO)</span> — ตัวเลขทั้งหมดเป็นข้อมูลจำลอง
        เพื่อรีวิวและยืนยันชุด KPI ก่อนเชื่อมต่อ API จริง ยังไม่ใช่ข้อมูลจริงของธุรกิจ
      </p>
    </div>
  )
}
