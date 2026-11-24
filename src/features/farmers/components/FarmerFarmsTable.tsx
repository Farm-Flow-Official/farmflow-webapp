'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { ListToolbar } from '@/components/ui/list-toolbar'
import { AreaRai } from '@/components/ui/area-rai'
import { Carbon } from '@/components/ui/carbon'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import { coverPhotoUrl } from '@/lib/farm-cover'
import { FARM_STATUS_INFO, type Farm } from '@/features/farmers/types'

type Props = {
  farms: Farm[]
}

/**
 * The column definitions live here, not in the page.
 *
 * They were declared in the server component and handed over as a prop, which
 * React cannot do: a `cell` is a function, and functions do not cross the
 * server/client boundary. The page rendered fine until the table was made
 * interactive for sorting — at which point the whole route started throwing at
 * runtime, invisible to typecheck, lint and build alike.
 */
const COLUMNS: Column<Farm>[] = [
  {
    key: 'id',
    header: 'Farm ID',
    cell: (f) => (
      <span className="rounded bg-surface px-2 py-1 font-mono text-[13px] text-ink-secondary">
        {f.id}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'ชื่อแปลง',
    cell: (f) => {
      const cover = coverPhotoUrl(f.coverPhotoFileId)
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <Sprout className="h-4 w-4 text-ink-disabled" strokeWidth={1.5} />
            )}
          </span>
          <span className="font-medium text-ink">{f.name}</span>
        </div>
      )
    },
  },
  {
    key: 'province',
    header: 'จังหวัด',
    cell: (f) => (
      <span className="text-[13px] text-ink-secondary">
        {f.province ?? <span className="text-ink-disabled">—</span>}
      </span>
    ),
  },
  {
    key: 'area',
    header: 'พื้นที่',
    align: 'right',
    cell: (f) => (
      <span className="text-ink-secondary">
        <AreaRai rai={f.areaRai} />
      </span>
    ),
  },
  {
    key: 'crop',
    header: 'ชนิดพืช',
    cell: (f) => (
      <span className="text-[13px] text-ink-secondary">
        {f.cropType ?? <span className="text-ink-disabled">—</span>}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'สถานะ',
    cell: (f) => {
      const info = FARM_STATUS_INFO[f.farmStatus]
      return (
        <Badge variant={info.variant} dot>
          {info.label}
        </Badge>
      )
    },
  },
  {
    key: 'project',
    header: 'ขึ้นทะเบียนกับโครงการ',
    cell: (f) => (
      <span className="text-[13px] text-ink-secondary">
        {f.projectName ?? <span className="text-ink-disabled">ยังไม่เข้าร่วม</span>}
      </span>
    ),
  },
  {
    key: 'carbon',
    header: 'Carbon',
    align: 'right',
    cell: (f) => (
      <span className="font-semibold text-success">
        <Carbon kgCo2e={f.carbonKgCo2e} stacked />
      </span>
    ),
  },
  {
    key: 'registered',
    header: 'วันที่ขึ้นทะเบียน',
    cell: (f) => (
      <span className="text-[13px] text-ink-secondary">{formatDate(f.registeredAt)}</span>
    ),
  },
]

const SORTS = [
  { value: 'registeredAt', label: 'วันที่ขึ้นทะเบียน' },
  { value: 'name', label: 'ชื่อแปลง' },
  { value: 'areaRai', label: 'พื้นที่' },
  { value: 'carbonKgCo2e', label: 'คาร์บอน' },
]

/**
 * One farmer's plots, searchable and sortable, with each row opening the plot
 * (ADMIN-FARMERDET-02 / -07).
 *
 * Filtering happens in the browser here, unlike the farm queue: this list is
 * bounded by how many plots one person owns — a few dozen at most — so a round
 * trip per keystroke would cost more than it saves. The control surface is
 * identical either way, which is what the convention actually asks for.
 */
export function FarmerFarmsTable({ farms }: Props) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('registeredAt')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const router = useRouter()

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = needle
      ? farms.filter(
          (f) =>
            f.name.toLowerCase().includes(needle) ||
            f.province?.toLowerCase().includes(needle) ||
            f.cropType?.toLowerCase().includes(needle) ||
            f.projectName?.toLowerCase().includes(needle),
        )
      : farms

    const sorted = [...filtered].sort((a, b) => {
      const pick = (f: Farm) => {
        switch (sort) {
          case 'name':
            return f.name
          case 'areaRai':
            return f.areaRai ?? -1
          case 'carbonKgCo2e':
            return f.carbonKgCo2e ?? -1
          default:
            return f.registeredAt
        }
      }
      const av = pick(a)
      const bv = pick(b)
      if (av === bv) return 0
      return (av < bv ? -1 : 1) * (dir === 'asc' ? 1 : -1)
    })

    return sorted
  }, [farms, q, sort, dir])

  return (
    <>
      <ListToolbar
        q={q}
        onQueryChange={setQ}
        placeholder="ค้นหาชื่อแปลง จังหวัด ชนิดพืช หรือโครงการ…"
        sorts={SORTS}
        sortValue={sort}
        dir={dir}
        onSortChange={(nextSort, nextDir) => {
          setSort(nextSort)
          setDir(nextDir)
        }}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows}
        getRowKey={(f) => f.id}
        onRowClick={(f) => router.push(`/admin/farms/${f.id}`)}
        empty={{
          icon: <Sprout className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: q ? 'ไม่พบแปลงที่ตรงกับคำค้นหา' : 'ยังไม่มีแปลงเกษตร',
          description: q ? 'ลองคำค้นหาอื่น' : 'เกษตรกรรายนี้ยังไม่มีแปลงที่ขึ้นทะเบียน',
        }}
      />
    </>
  )
}
