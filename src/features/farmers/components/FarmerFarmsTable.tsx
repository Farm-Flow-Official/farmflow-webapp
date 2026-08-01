'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { ListToolbar } from '@/components/ui/list-toolbar'
import type { Farm } from '@/features/farmers/types'

type Props = {
  farms: Farm[]
  columns: Column<Farm>[]
}

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
export function FarmerFarmsTable({ farms, columns }: Props) {
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
        columns={columns}
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
