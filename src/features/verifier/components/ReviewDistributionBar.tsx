import { formatNumber } from '@/lib/utils/format'

type Segment = { key: string; label: string; count: number; color: string }

/**
 * Review throughput as a single stacked proportional bar (pending / approved /
 * rejected) with a legend. Real counts only — the width of each segment is its
 * share of the total, so the queue mix reads at a glance.
 */
export function ReviewDistributionBar({
  pending,
  approved,
  rejected,
}: {
  pending: number
  approved: number
  rejected: number
}) {
  const segments: Segment[] = [
    { key: 'approved', label: 'อนุมัติ', count: approved, color: '#22C55E' },
    { key: 'pending', label: 'รอตรวจ', count: pending, color: '#F59E0B' },
    { key: 'rejected', label: 'ปฏิเสธ', count: rejected, color: '#EF4444' },
  ]
  const total = segments.reduce((sum, s) => sum + s.count, 0)

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink">สถานะการตรวจรับรอง</h2>
          <p className="text-xs text-ink-muted">สัดส่วน batch ตามสถานะ · รวม {formatNumber(total)} รายการ</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-sunken" role="img" aria-label="สัดส่วนสถานะการตรวจรับรอง">
        {total > 0 &&
          segments.map((s) =>
            s.count > 0 ? (
              <div
                key={s.key}
                style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
                title={`${s.label}: ${formatNumber(s.count)}`}
              />
            ) : null,
          )}
      </div>

      {/* Legend */}
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {segments.map((s) => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
          return (
            <li key={s.key} className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-[12px] text-ink-secondary">{s.label}</span>
              </span>
              <span className="font-mono text-lg font-bold tabular-nums text-ink">
                {formatNumber(s.count)}
                <span className="ml-1 text-[11px] font-normal text-ink-muted">{pct}%</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
