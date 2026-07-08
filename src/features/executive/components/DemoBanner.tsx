import { TriangleAlert } from 'lucide-react'

/**
 * DEMO marker for the executive prototype. This dashboard shows mock numbers so
 * executives can validate the KPI set before the backend aggregation is built —
 * the banner keeps that honest and visible at all times.
 */
export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning bg-warning-bg px-4 py-3 text-warning">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.9} />
      <div>
        <p className="text-sm font-semibold">ข้อมูลตัวอย่าง (DEMO)</p>
        <p className="text-[13px] leading-relaxed text-warning/90">
          ตัวเลขทั้งหมดในหน้านี้เป็นข้อมูลจำลอง เพื่อรีวิวชุด KPI กับผู้บริหารก่อนต่อ API จริง —
          ยังไม่ใช่ข้อมูลจากระบบ
        </p>
      </div>
    </div>
  )
}
