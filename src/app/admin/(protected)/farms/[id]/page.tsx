import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, FolderTree, MapPin, Ruler, TriangleAlert, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AreaRai } from '@/components/ui/area-rai'
import { formatDateTime } from '@/lib/utils/format'
import { fetchFarmById, fetchFarmHistory } from '@/features/farms/services/fetchFarms'
import { FarmDecisionActions } from '@/features/farms/components/FarmDecisionActions'
import { FARM_STATUS_INFO } from '@/features/farmers/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const farm = await fetchFarmById(id)
  return { title: farm ? `${farm.farmName} — FarmFlow Admin` : 'ไม่พบแปลง' }
}

/** Thai label for a lifecycle state as it appears in the trail. */
function statusLabel(status: string): string {
  return FARM_STATUS_INFO[status as keyof typeof FARM_STATUS_INFO]?.label ?? status
}

export default async function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [farm, history] = await Promise.all([fetchFarmById(id), fetchFarmHistory(id)])
  if (!farm) notFound()

  const status = FARM_STATUS_INFO[farm.farmStatus]
  const ownerSuspended = farm.ownerAccountStatus === 'Suspended'

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8">
      <Link
        href="/admin/farms"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        กลับไปคิวอนุมัติแปลง
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold text-ink">{farm.farmName}</h1>
            <Badge variant={status.variant} dot>
              {status.label}
            </Badge>
          </div>
          <p className="mt-1.5 font-mono text-[13px] text-ink-muted">{farm.id}</p>
        </div>

        <FarmDecisionActions
          farmId={farm.id}
          farmName={farm.farmName}
          farmStatus={farm.farmStatus}
        />
      </header>

      {/*
        The owner's account state decides whether approval is even possible
        (ADMIN-POWER-02), so it is stated up front rather than discovered as a
        409 after the admin has typed a decision.
      */}
      {ownerSuspended && (
        <p className="mb-6 flex items-start gap-2 rounded-xl bg-error-bg px-4 py-3 text-[13px] text-error">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>
            เจ้าของฟาร์มนี้ถูกระงับบัญชีอยู่ — ต้องปลดระงับบัญชีก่อนจึงจะอนุมัติแปลงนี้ได้
          </span>
        </p>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Fact icon={User} label="เจ้าของ">
          <Link
            href={`/admin/farmers/${farm.ownerUserId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {farm.ownerName}
          </Link>
        </Fact>

        <Fact icon={FolderTree} label="ขึ้นทะเบียนกับโครงการ">
          {farm.projectId ? (
            <Link
              href={`/admin/projects/${farm.projectId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {farm.projectName}
            </Link>
          ) : (
            <span className="text-sm text-ink-disabled">ยังไม่เข้าร่วมโครงการ</span>
          )}
        </Fact>

        <Fact icon={MapPin} label="จังหวัด">
          <span className="text-sm font-medium text-ink">
            {farm.province ?? <span className="text-ink-disabled">—</span>}
          </span>
        </Fact>

        <Fact icon={Ruler} label="พื้นที่คำนวณ">
          <span className="text-sm font-medium text-ink">
            <AreaRai rai={farm.calculatedAreaRai} />
          </span>
        </Fact>
      </div>

      {farm.areaDiscrepancyFlag && (
        <p className="mb-8 flex items-start gap-2 rounded-xl bg-warning-bg px-4 py-3 text-[13px] text-warning">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>
            พื้นที่ที่แจ้ง (<AreaRai rai={farm.declaredAreaRai} />) ต่างจากพื้นที่ที่คำนวณจากขอบเขตจริง
            (<AreaRai rai={farm.calculatedAreaRai} />) เกิน 15% — ควรตรวจสอบขอบเขตแปลงก่อนอนุมัติ
          </span>
        </p>
      )}

      <section>
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          ประวัติการพิจารณา
        </h2>

        {history.length === 0 ? (
          <p className="rounded-xl border border-line bg-panel px-4 py-6 text-center text-[13px] text-ink-muted">
            ยังไม่มีการพิจารณา — แปลงนี้รอการอนุมัติครั้งแรก
          </p>
        ) : (
          <ol className="space-y-2">
            {history.map((event, i) => (
              <li
                key={`${event.createdAt}-${i}`}
                className="rounded-xl border border-line bg-panel p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="text-ink-muted">{statusLabel(event.oldStatus ?? '—')}</span>
                  <span className="text-ink-disabled">→</span>
                  <span className="font-semibold text-ink">{statusLabel(event.newStatus)}</span>
                  <span className="ml-auto text-[12px] text-ink-muted">
                    {formatDateTime(event.createdAt)}
                  </span>
                </div>

                {event.reason && (
                  <p className="mt-2 border-l-2 border-line pl-3 text-[13px] leading-relaxed text-ink-secondary">
                    {event.reason}
                  </p>
                )}

                <p className="mt-2 text-[12px] text-ink-muted">
                  โดย {event.changedByLabel ?? (event.changedByType === 'system' ? 'ระบบ' : 'ผู้ใช้')}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      </div>
      {children}
    </div>
  )
}
