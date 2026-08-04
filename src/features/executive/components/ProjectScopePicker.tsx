'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Filter } from 'lucide-react'
import type { ProjectOption } from '@/features/executive/types'

/**
 * The one filter on the page, sitting above everything it scopes.
 *
 * Deliberately NOT inside any card: a per-chart filter leaves the reader unsure
 * which numbers moved. Selection lives in the URL rather than component state,
 * so the scope survives a refresh and can be sent to someone else — and so a
 * stale picker can never point the page at a project it is not showing.
 */
export function ProjectScopePicker({ options }: { options: ProjectOption[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const current = params.get('project') ?? ''

  function select(projectId: string) {
    const next = new URLSearchParams(params.toString())
    if (projectId) next.set('project', projectId)
    else next.delete('project')

    startTransition(() => {
      router.replace(next.toString() ? `?${next}` : '?', { scroll: false })
    })
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 transition-opacity ${
        pending ? 'opacity-60' : ''
      }`}
    >
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
        <Filter className="h-3.5 w-3.5" strokeWidth={1.9} />
        ขอบเขต
      </span>

      <select
        aria-label="เลือกโครงการที่ต้องการดู"
        value={current}
        onChange={(e) => select(e.target.value)}
        disabled={options.length === 0}
        className="h-9 max-w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:text-ink-muted"
      >
        <option value="">ทั้งพอร์ต ({options.length} โครงการ)</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.farms} ฟาร์ม
          </option>
        ))}
      </select>

      {current && (
        <button
          type="button"
          onClick={() => select('')}
          className="h-9 rounded-lg px-2.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ล้างตัวกรอง
        </button>
      )}
    </div>
  )
}
