'use client'

import { useRouter } from 'next/navigation'
import { Sprout, TriangleAlert } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { ListToolbar } from '@/components/ui/list-toolbar'
import { FARM_PAGE_SIZE as PAGE_SIZE } from '@/features/farms/types/page-size'
import { AreaRai } from '@/components/ui/area-rai'
import { formatDate } from '@/lib/utils/format'
import { useListQuery } from '@/lib/hooks/useListQuery'
import { FarmDecisionActions } from '@/features/farms/components/FarmDecisionActions'
import { FARM_STATUS_INFO } from '@/features/farmers/types'
import type { AdminFarmPage } from '@/features/farms/types'

const STATUS_FILTERS = [
  { value: 'draft,pending', label: 'รอตรวจสอบ' },
  { value: 'active', label: 'อนุมัติแล้ว' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
  { value: 'suspended', label: 'ระงับ' },
  { value: 'all', label: 'ทั้งหมด' },
]

const SORTS = [
  { value: 'createdAt', label: 'วันที่ขึ้นทะเบียน' },
  { value: 'farmName', label: 'ชื่อแปลง' },
  { value: 'farmStatus', label: 'สถานะ' },
  { value: 'areaRai', label: 'พื้นที่' },
]



/**
 * The farm approval queue (ADMIN-POWER-01).
 *
 * Every control writes to the URL and the server re-queries — the table only
 * ever holds one page. That is the difference between a list that works at
 * pilot scale and one that works at a hundred thousand farms.
 */
export function FarmQueueTable({ page }: { page: AdminFarmPage }) {
  const { q, status, sort, dir, page: pageNum, update, pending } = useListQuery({
    status: 'draft,pending',
  })
  const router = useRouter()

  const columns: Column<AdminFarmPage['rows'][number]>[] = [
    {
      key: 'farm',
      header: 'แปลง / เกษตรกร',
      cell: (f) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{f.farmName}</p>
          <p className="truncate text-[12px] text-ink-muted">{f.ownerName}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (f) => {
        const info = FARM_STATUS_INFO[f.farmStatus]
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant={info.variant} dot>
              {info.label}
            </Badge>
            {f.ownerAccountStatus === 'Suspended' && (
              <span title="เจ้าของบัญชีถูกระงับ — อนุมัติแปลงนี้ไม่ได้">
                <TriangleAlert className="h-3.5 w-3.5 text-error" strokeWidth={2} />
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'project',
      header: 'โครงการ',
      cell: (f) => (
        <span className="text-[13px] text-ink-secondary">
          {f.projectName ?? <span className="text-ink-disabled">—</span>}
        </span>
      ),
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
        <span className="inline-flex items-center gap-1 text-ink-secondary">
          <AreaRai rai={f.calculatedAreaRai} />
          {f.areaDiscrepancyFlag && (
            <span title="พื้นที่ที่แจ้งต่างจากที่คำนวณเกิน 15%">
              <TriangleAlert className="h-3.5 w-3.5 text-warning" strokeWidth={2} />
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'registered',
      header: 'ขึ้นทะเบียน',
      cell: (f) => <span className="text-[13px] text-ink-secondary">{formatDate(f.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (f) => (
        // Stop the click bubbling to the row link — deciding on a farm from the
        // queue should not also navigate away from the queue.
        <div onClick={(e) => e.stopPropagation()} role="presentation">
          <FarmDecisionActions
            farmId={f.id}
            farmName={f.farmName}
            farmStatus={f.farmStatus}
            compact
          />
        </div>
      ),
    },
  ]

  return (
    <>
      <ListToolbar
        q={q}
        onQueryChange={(next) => update({ q: next })}
        placeholder="ค้นหาชื่อแปลงหรือชื่อเกษตรกร…"
        filters={STATUS_FILTERS}
        filterValue={status}
        onFilterChange={(next) => update({ status: next })}
        filterLabel="กรองตามสถานะ"
        sorts={SORTS}
        sortValue={sort}
        dir={dir}
        onSortChange={(nextSort, nextDir) => update({ sort: nextSort, dir: nextDir })}
        pending={pending}
      />

      <div className={pending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <DataTable
          columns={columns}
          rows={page.rows}
          getRowKey={(f) => f.id}
          onRowClick={(f) => router.push(`/admin/farms/${f.id}`)}
          empty={{
            icon: <Sprout className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
            title: q ? 'ไม่พบแปลงที่ตรงกับคำค้นหา' : 'ไม่มีแปลงในสถานะนี้',
            description: q ? 'ลองคำค้นหาอื่น หรือเปลี่ยนตัวกรองสถานะ' : undefined,
          }}
        />
      </div>

      {page.total > PAGE_SIZE && (
        <Pagination
          page={pageNum}
          pageSize={PAGE_SIZE}
          total={page.total}
          onPageChange={(next) => update({ page: next })}
        />
      )}
    </>
  )
}
