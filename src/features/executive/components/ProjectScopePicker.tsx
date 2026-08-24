'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Filter } from 'lucide-react'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { projectCoverUrl, projectPattern } from '@/lib/project-cover'
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
  const selected = options.find((p) => p.id === current)

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

      {/* The picture rides ALONGSIDE the control, never inside it. A native
          <select> gives us the OS picker on iPad and iPhone, keyboard type-ahead
          and correct screen-reader semantics for free; a custom dropdown that
          could show images inline would mean rebuilding all three by hand. */}
      {selected && <SelectedThumb option={selected} />}

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

function SelectedThumb({ option }: { option: ProjectOption }) {
  const url = projectCoverUrl(option.coverPhotoFileId)
  return (
    <span className="flex items-center gap-2 rounded-lg border border-line bg-panel py-1 pl-1 pr-2.5">
      <span
        className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-md"
        style={url ? undefined : projectPattern(option.code)}
        aria-hidden="true"
      >
        {url && (
          <ImageWithSkeleton
            src={url}
            alt=""
            className="h-full w-full object-cover transition-opacity"
          />
        )}
      </span>
      <span className="max-w-[18ch] truncate text-[12px] font-medium text-ink">{option.name}</span>
    </span>
  )
}
