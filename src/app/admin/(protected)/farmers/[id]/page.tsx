import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Leaf, Wallet, Sprout } from 'lucide-react'
import type { Metadata } from 'next'
import { fetchFarmerById } from '@/features/farmers/services/fetchFarmerById'
import { type Column } from '@/components/ui/data-table'
import { AreaRai } from '@/components/ui/area-rai'
import { Carbon } from '@/components/ui/carbon'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { coverPhotoUrl } from '@/lib/farm-cover'
import { FarmerProfileHeader } from '@/features/farmers/components/FarmerProfileHeader'
import { ContactCell } from '@/features/farmers/components/ContactCell'
import { FARM_STATUS_INFO, type Farm } from '@/features/farmers/types'
import { FarmerFarmsTable } from '@/features/farmers/components/FarmerFarmsTable'

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
        {/* Phone and email arrive masked; `ContactCell` owns the audited reveal
            (ADMIN-PROJ-03), so both live in one cell rather than two. */}
        <div className="col-span-2 rounded-xl border border-line bg-panel p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              ข้อมูลติดต่อ
            </p>
          </div>
          <ContactCell
            farmerId={farmer.id}
            phoneMasked={farmer.phone}
            emailMasked={farmer.email}
            hasContact={farmer.hasContact}
          />
        </div>

        <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-success" strokeWidth={1.75} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Carbon รวม
            </p>
          </div>
          <p className="text-sm font-semibold text-success">
            <Carbon kgCo2e={farmer.totalCarbonKgCo2e} stacked />
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
        <FarmerFarmsTable farms={farmer.farms} columns={farmColumns} />
      </section>
    </div>
  )
}
