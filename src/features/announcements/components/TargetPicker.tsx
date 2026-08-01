'use client'

import {
  ANNOUNCEMENT_CHANNELS,
  ANNOUNCEMENT_DASHBOARDS,
  targetKey,
  type AnnouncementTarget,
} from '@/features/announcements/types/targets'

/**
 * Which dashboards see this announcement, and how (ADMIN-ANN-02).
 *
 * A grid rather than two independent multi-selects: the same notice commonly
 * goes to the mobile app as a banner *and* to the verifier portal's bell, and a
 * pair of lists cannot express that — it would only let you pick channels that
 * then apply to every dashboard.
 */
export function TargetPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: AnnouncementTarget[]
  onChange: (targets: AnnouncementTarget[]) => void
  disabled?: boolean
}) {
  const selected = new Set(value.map(targetKey))

  function toggle(target: AnnouncementTarget) {
    const key = targetKey(target)
    onChange(
      selected.has(key)
        ? value.filter((t) => targetKey(t) !== key)
        : [...value, target],
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[420px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                แดชบอร์ด
              </th>
              {ANNOUNCEMENT_CHANNELS.map((c) => (
                <th
                  key={c.value}
                  scope="col"
                  className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANNOUNCEMENT_DASHBOARDS.map((d) => (
              <tr key={d.value} className="border-t border-line">
                <th scope="row" className="px-3 py-2 text-left font-normal">
                  <span className="font-medium text-ink">{d.label}</span>
                  <span className="ml-1.5 text-[11px] text-ink-muted">{d.hint}</span>
                </th>
                {ANNOUNCEMENT_CHANNELS.map((c) => {
                  const target = { dashboard: d.value, channel: c.value }
                  const checked = selected.has(targetKey(target))
                  return (
                    <td key={c.value} className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(target)}
                        aria-label={`${d.label} — ${c.label}`}
                        className="h-4 w-4 rounded border-line text-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-2 space-y-0.5">
        {ANNOUNCEMENT_CHANNELS.map((c) => (
          <li key={c.value} className="text-[11px] text-ink-muted">
            <span className="font-medium text-ink-secondary">{c.label}</span> — {c.hint}
          </li>
        ))}
      </ul>

      {value.length === 0 && (
        // Not an error — a draft with no target yet is normal. But an *active*
        // announcement with none would go nowhere, which is worth saying.
        <p className="mt-2 text-[12px] text-warning">
          ยังไม่ได้เลือกปลายทาง — ประกาศนี้จะไม่แสดงที่ไหนเลย
        </p>
      )}
    </div>
  )
}
