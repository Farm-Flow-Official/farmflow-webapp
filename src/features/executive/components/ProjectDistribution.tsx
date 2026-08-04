'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { FolderTree } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { formatNumber } from '@/lib/utils/format'
import { formatTonnes } from '@/features/executive/lib'
import type { ProjectDistribution as Distribution } from '@/features/executive/types'

/**
 * Where the portfolio sits, by project — and the way to move between projects.
 *
 * Clicking a row scopes the whole page to it, which is why this card stays
 * portfolio-wide even when a scope is active: a navigator that only shows where
 * you already are is a dead end. The header says so, so the totals here never
 * read as contradicting the scoped KPIs above.
 *
 * The reference deck breaks this down by province, but `farms.province_id` is
 * unpopulated and `thai_provinces` carries no geometry — a province table would
 * be a table of nulls. The project is the unit T-VER actually certifies
 * (CONTEXT.md), so it is both the honest axis and the more useful one.
 */
export function ProjectDistribution({
  data,
  activeProjectId,
}: {
  data: Distribution
  activeProjectId?: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const { rows, others, total } = data
  // Carbon can land in "others" with no project behind it — a certified batch on
  // a farm that has since been suspended. Showing the row anyway is what keeps
  // the column adding up to the total.
  const hasOthers = others.projects > 0 || others.tco2e > 0

  function scopeTo(projectId: string) {
    const next = new URLSearchParams(params.toString())
    if (projectId === activeProjectId) next.delete('project')
    else next.set('project', projectId)
    startTransition(() => {
      router.replace(next.toString() ? `?${next}` : '?', { scroll: false })
    })
  }

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        การกระจายตัวตามโครงการ
      </h3>
      <p className="mt-1 text-sm text-ink-secondary">
        ทั้งพอร์ตเสมอ · แตะแถวเพื่อดูเฉพาะโครงการนั้น
      </p>

      {rows.length === 0 ? (
        <EmptyState
          className="mt-4 flex-1 border-0 px-0 py-10"
          icon={FolderTree}
          title="ยังไม่มีฟาร์มเข้าร่วมโครงการ"
          description="ตารางนี้จะแสดงเมื่อมีฟาร์มถูกผูกเข้ากับโครงการ T-VER"
        />
      ) : (
        <div className={`mt-4 overflow-x-auto transition-opacity ${pending ? 'opacity-60' : ''}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
                <th className="px-1 pb-2 font-semibold">โครงการ</th>
                <th className="px-1 pb-2 text-right font-semibold">ตรวจรับรอง</th>
                <th className="px-1 pb-2 text-right font-semibold">ฟาร์ม</th>
                {/* Dropped on phones: rai is the least-consulted column and the
                    one that forces a horizontal scroll at 390px. */}
                <th className="hidden px-1 pb-2 text-right font-semibold sm:table-cell">ไร่</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const active = r.projectId === activeProjectId
                return (
                  <tr
                    key={r.projectId}
                    className={`border-b border-line/60 transition-colors ${
                      active ? 'bg-primary-subtle' : 'hover:bg-surface'
                    }`}
                  >
                    <td className="px-1 py-2.5">
                      <button
                        type="button"
                        onClick={() => scopeTo(r.projectId)}
                        aria-pressed={active}
                        className="block w-full min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span
                          className={`block truncate font-medium ${active ? 'text-primary' : 'text-ink'}`}
                        >
                          {r.projectName}
                        </span>
                        <span className="font-mono text-[11px] text-ink-muted">
                          {r.projectCode}
                        </span>
                      </button>
                    </td>
                    <td className="px-1 py-2.5 text-right font-mono tabular-nums text-ink">
                      {formatTonnes(r.tco2e)}
                    </td>
                    <td className="px-1 py-2.5 text-right font-mono tabular-nums text-ink-secondary">
                      {formatNumber(r.farms)}
                    </td>
                    <td className="hidden px-1 py-2.5 text-right font-mono tabular-nums text-ink-secondary sm:table-cell">
                      {formatNumber(Math.round(r.areaRai))}
                    </td>
                  </tr>
                )
              })}

              {hasOthers && (
                <tr className="border-b border-line/60 text-ink-secondary">
                  <td className="px-1 py-2.5">
                    {others.projects > 0 ? `อีก ${formatNumber(others.projects)} โครงการ` : 'อื่นๆ'}
                  </td>
                  <td className="px-1 py-2.5 text-right font-mono tabular-nums">
                    {formatTonnes(others.tco2e)}
                  </td>
                  <td className="px-1 py-2.5 text-right font-mono tabular-nums">
                    {formatNumber(others.farms)}
                  </td>
                  <td className="hidden px-1 py-2.5 text-right font-mono tabular-nums sm:table-cell">
                    {formatNumber(Math.round(others.areaRai))}
                  </td>
                </tr>
              )}

              <tr className="font-semibold text-ink">
                <td className="px-1 pt-2.5">รวมทั้งพอร์ต</td>
                <td className="px-1 pt-2.5 text-right font-mono tabular-nums">
                  {formatTonnes(total)}
                </td>
                <td className="px-1 pt-2.5 text-right font-mono tabular-nums">
                  {formatNumber(rows.reduce((s, r) => s + r.farms, 0) + others.farms)}
                </td>
                <td className="hidden px-1 pt-2.5 text-right font-mono tabular-nums sm:table-cell">
                  {formatNumber(
                    Math.round(rows.reduce((s, r) => s + r.areaRai, 0) + others.areaRai),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
