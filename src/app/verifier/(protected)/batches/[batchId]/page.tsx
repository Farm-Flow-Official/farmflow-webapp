import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowLeft,
  Phone,
  MapPin,
  ExternalLink,
  Leaf,
  Gauge,
  TreePine,
  TriangleAlert,
  LandPlot,
  ImageIcon,
} from 'lucide-react'
import { coverPhotoUrl } from '@/lib/farm-cover'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { fetchBatchById } from '@/features/verifier/services/fetchBatchById'
import { BatchReviewActions } from '@/features/verifier/components/BatchReviewActions'
import { BatchMiniMap } from '@/features/verifier/components/BatchMiniMap'
import { TreeSnapshotGrid } from '@/features/verifier/components/TreeSnapshotGrid'
import { BackShortcut } from '@/features/verifier/components/BackShortcut'
import { Kbd } from '@/components/ui/kbd'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { confidenceTextClass } from '@/features/verifier/lib/confidence'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ batchId: string }>
}): Promise<Metadata> {
  const { batchId } = await params
  return { title: `${batchId} — FarmFlow Verifier` }
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const [batch, verifier] = await Promise.all([
    fetchBatchById(batchId),
    getVerifierSession(),
  ])
  if (!batch) notFound()

  const coverUrl = coverPhotoUrl(batch.coverPhotoFileId)
  const anomalyTrees = batch.trees.filter((t) => t.anomaly).length
  const areaDiscrepancyPct =
    batch.declaredAreaRai != null &&
    batch.declaredAreaRai > 0 &&
    batch.calculatedAreaRai != null
      ? Math.round(
          (Math.abs(batch.declaredAreaRai - batch.calculatedAreaRai) / batch.declaredAreaRai) * 100,
        )
      : null

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <BackShortcut href="/verifier/batches" />

      <Link
        href="/verifier/batches"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        กลับไปคิวงาน
        <Kbd className="ml-0.5">Esc</Kbd>
      </Link>

      {/* Header + actions */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
        {coverUrl && (
          <div className="relative h-40 w-full sm:h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={`ภาพหน้าปกแปลง ${batch.farmName}`}
              className="h-full w-full object-cover"
            />
            {/* Bottom fade so the caption chip stays legible on any photo. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent"
              aria-hidden
            />
            <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur">
              <ImageIcon className="h-3 w-3" strokeWidth={1.9} />
              ภาพหน้าปกจากเกษตรกร
            </span>
          </div>
        )}
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-ink">{batch.farmName}</h1>
                <span className="font-mono text-xs text-ink-muted">{batch.id}</span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {batch.ownerName} · ส่งเมื่อ {formatDate(batch.submittedAt)}
              </p>
            </div>
          </div>
          <BatchReviewActions
            batchId={batch.id}
            initialStatus={batch.status}
            verifierName={verifier?.username ?? 'Verifier'}
          />
        </div>
      </div>

      {/* Farm overview + MRV */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Farm overview */}
        <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            ข้อมูลฟาร์ม
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">เกษตรกร</dt>
                <dd className="font-medium text-ink">{batch.ownerName}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <Phone className="h-3 w-3" strokeWidth={1.75} /> เบอร์ติดต่อ
                </dt>
                <dd className="font-mono text-ink">
                  {batch.phone ?? <span className="text-ink-disabled">—</span>}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} /> ที่ตั้ง
                </dt>
                <dd className="text-ink">
                  {batch.farmAddress ?? <span className="text-ink-disabled">—</span>}
                  {batch.province && batch.province !== batch.farmAddress && (
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      จ.{batch.province}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <LandPlot className="h-3 w-3" strokeWidth={1.75} /> พื้นที่แปลง
                </dt>
                <dd className="text-ink">
                  {batch.declaredAreaRai != null || batch.calculatedAreaRai != null ? (
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="font-mono">
                        แจ้ง{' '}
                        {batch.declaredAreaRai != null
                          ? batch.declaredAreaRai.toFixed(1)
                          : '—'}{' '}
                        ไร่
                        <span className="mx-1.5 text-ink-disabled">·</span>
                        คำนวณ{' '}
                        {batch.calculatedAreaRai != null
                          ? batch.calculatedAreaRai.toFixed(1)
                          : '—'}{' '}
                        ไร่
                      </span>
                      {batch.areaDiscrepancyFlag && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-error-bg px-2 py-0.5 text-[11px] font-semibold text-error">
                          <TriangleAlert className="h-3 w-3" strokeWidth={1.9} />
                          ต่าง{areaDiscrepancyPct != null ? ` ${areaDiscrepancyPct}%` : 'เกินเกณฑ์'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-ink-disabled">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} /> พิกัด GPS
                  <span className="font-normal text-ink-disabled">(จุดเช็คอิน)</span>
                </dt>
                <dd>
                  {batch.checkinLat != null && batch.checkinLng != null ? (
                    <a
                      href={`https://www.google.com/maps?q=${batch.checkinLat},${batch.checkinLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
                    >
                      {batch.checkinLat.toFixed(5)}, {batch.checkinLng.toFixed(5)}
                      <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                    </a>
                  ) : (
                    <span className="text-ink-disabled">—</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="h-48 overflow-hidden rounded-xl border border-line sm:h-full sm:min-h-[12rem]">
              <BatchMiniMap polygon={batch.polygon} expandable />
            </div>
          </div>
        </section>

        {/* MRV summary */}
        <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            สรุปข้อมูล MRV
          </h2>
          <dl className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <Leaf className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div>
                <dt className="text-xs text-ink-muted">คาร์บอนรวม</dt>
                <dd className="font-mono text-lg font-semibold text-success">
                  {formatNumber(batch.totalCarbonKgCo2e)}{' '}
                  <span className="text-xs font-normal text-ink-muted">kgCO₂e</span>
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink-secondary">
                <Gauge className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div>
                <dt className="text-xs text-ink-muted">ความเชื่อมั่น AI เฉลี่ย</dt>
                <dd className={`font-mono text-lg font-semibold ${confidenceTextClass(batch.avgConfidence)}`}>
                  {Math.round(batch.avgConfidence * 100)}%
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink-secondary">
                <TreePine className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div>
                <dt className="text-xs text-ink-muted">จำนวนต้นไม้</dt>
                <dd className="font-mono text-lg font-semibold text-ink">{batch.treeCount}</dd>
              </div>
            </div>
            {anomalyTrees > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-error-bg px-3 py-2 text-xs text-error">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                {anomalyTrees} ภาพมีความผิดปกติ ควรตรวจเชิงลึก
              </div>
            )}
          </dl>
        </section>
      </div>

      {/* Tree snapshot grid */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            ภาพต้นไม้ในชุด
          </h2>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink-secondary">
            {batch.trees.length} ภาพ
          </span>
        </div>
        <TreeSnapshotGrid batchId={batch.id} trees={batch.trees} />
      </section>
    </div>
  )
}
