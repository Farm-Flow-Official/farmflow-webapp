import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Leaf, Wallet, Sprout } from 'lucide-react'
import type { Metadata } from 'next'
import { fetchFarmerById } from '@/features/farmers/services/fetchFarmerById'
import { DataTable, type Column } from '@/components/ui/data-table'
import { formatDate, formatPhone, formatNumber } from '@/lib/utils/format'
import { FarmerProfileHeader } from '@/features/farmers/components/FarmerProfileHeader'
import type { Farm } from '@/features/farmers/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const farmer = await fetchFarmerById(id)
  return {
    title: farmer ? `${farmer.fullName} — FarmFlow Admin` : 'ไม่พบเกษตรกร',
  }
}

const farmColumns: Column<Farm>[] = [
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
    cell: (f) => <span className="font-medium text-ink">{f.name}</span>,
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
    header: 'พื้นที่ (ไร่)',
    align: 'right',
    cell: (f) => (
      <span className="font-mono tabular-nums text-ink-secondary">
        {f.areaRai != null ? f.areaRai : <span className="text-ink-disabled">—</span>}
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
    key: 'carbon',
    header: 'Carbon (kgCO₂e)',
    align: 'right',
    cell: (f) => (
      <span className="font-mono tabular-nums font-semibold text-success">
        {f.carbonKgCo2e != null ? formatNumber(f.carbonKgCo2e) : <span className="font-normal text-ink-disabled">—</span>}
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

export default async function FarmerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const farmer = await fetchFarmerById(id)
  if (!farmer) notFound()

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      {/* Breadcrumb */}
      <Link
        href="/admin/farmers"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        กลับไป Farmer Management
      </Link>

      {/* Profile header (client — owns the mock suspend/activate action) */}
      <FarmerProfileHeader farmer={farmer} />

      {/* Info grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              เบอร์โทรศัพท์
            </p>
          </div>
          <p className="font-mono text-sm font-medium text-ink">
            {farmer.phone ? formatPhone(farmer.phone) : <span className="text-ink-disabled">—</span>}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              อีเมล
            </p>
          </div>
          <p className="truncate text-sm font-medium text-ink">
            {farmer.email ?? <span className="text-ink-disabled">—</span>}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-success" strokeWidth={1.75} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Carbon รวม
            </p>
          </div>
          <p className="font-mono text-sm font-semibold text-success">
            {farmer.totalCarbonKgCo2e != null
              ? <>{formatNumber(farmer.totalCarbonKgCo2e)} <span className="text-xs font-normal text-ink-muted">kgCO₂e</span></>
              : <><span className="text-ink-disabled">—</span></>}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              มูลค่าโดยประมาณ
            </p>
          </div>
          <p className="font-mono text-sm font-semibold text-ink">
            {farmer.estimatedValueThb != null
              ? `฿${formatNumber(farmer.estimatedValueThb)}`
              : <span className="text-ink-disabled">—</span>}
          </p>
        </div>
      </div>

      {/* Farms table */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            แปลงเกษตร
          </h2>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink-secondary">
            {farmer.farms.length} แปลง
          </span>
        </div>
        <DataTable
          columns={farmColumns}
          rows={farmer.farms}
          getRowKey={(f) => f.id}
          empty={{
            icon: (
              <Sprout className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
            ),
            title: 'ยังไม่มีแปลงเกษตร',
            description: 'เกษตรกรรายนี้ยังไม่มีแปลงที่ขึ้นทะเบียน',
          }}
        />
      </section>
    </div>
  )
}
