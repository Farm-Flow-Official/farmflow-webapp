import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowLeft,
  Phone,
  MapPin,
  ExternalLink,
  Leaf,
  TreePine,
  TriangleAlert,
  LandPlot,
  ImageIcon,
} from 'lucide-react'
import { Carbon } from '@/components/ui/carbon'
import { coverPhotoUrl } from '@/lib/farm-cover'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { fetchSessionById } from '@/features/verifier/services/fetchSessionById'
import { SessionReviewActions } from '@/features/verifier/components/SessionReviewActions'
import { SessionMiniMap } from '@/features/verifier/components/SessionMiniMap'
import { TreeSnapshotGrid } from '@/features/verifier/components/TreeSnapshotGrid'
import { queueHref } from '@/features/verifier/lib/routes'
import { CultivationInfo } from '@/features/verifier/components/CultivationInfo'
import { RegistrationPanel } from '@/features/verifier/components/RegistrationPanel'
import { BaselineTag } from '@/features/verifier/components/BaselineTag'
import { fetchBaselineSuggestion } from '@/features/verifier/services/fetchBaselineSuggestion'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { BackShortcut } from '@/features/verifier/components/BackShortcut'
import { Kbd } from '@/components/ui/kbd'
import { formatDate } from '@/lib/utils/format'
import { ConfidenceRing } from '@/features/verifier/components/ConfidenceRing'
import { confidenceHex, confidenceToneLabel } from '@/features/verifier/lib/confidence'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string; sessionId: string }>
}): Promise<Metadata> {
  const { sessionId } = await params
  return { title: `${sessionId} — FarmFlow Verifier` }
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; sessionId: string }>
}) {
  const { projectId, sessionId } = await params
  const [session, verifier, baselineSuggestion] = await Promise.all([
    fetchSessionById(sessionId),
    getVerifierSession(),
    fetchBaselineSuggestion(sessionId),
  ])
  if (!session) notFound()

  const coverUrl = coverPhotoUrl(session.coverPhotoFileId)
  const anomalyTrees = session.trees.filter((t) => t.anomaly).length
  const areaDiscrepancyPct =
    session.declaredAreaRai != null &&
    session.declaredAreaRai > 0 &&
    session.calculatedAreaRai != null
      ? Math.round(
          (Math.abs(session.declaredAreaRai - session.calculatedAreaRai) / session.declaredAreaRai) * 100,
        )
      : null

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <BackShortcut href={queueHref(projectId)} />

      <Link
        href={queueHref(projectId)}
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
            <ImageWithSkeleton
              src={coverUrl}
              alt={`ภาพหน้าปกแปลง ${session.farmName}`}
              className="h-full w-full object-cover transition-opacity duration-500 ease-out"
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-ink">{session.farmName}</h1>
                <span className="font-mono text-xs text-ink-muted">{session.id}</span>
                {session.isBaseline && <BaselineTag />}
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {session.ownerName} · ส่งเมื่อ {formatDate(session.submittedAt)}
              </p>
            </div>
          </div>
          <SessionReviewActions
            projectId={session.projectId}
            sessionId={session.id}
            initialStatus={session.status}
            verifierName={verifier?.username ?? 'Verifier'}
            baseline={baselineSuggestion}
            totalCarbonKgCo2e={session.totalCarbonKgCo2e}
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
                <dd className="font-medium text-ink">{session.ownerName}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <Phone className="h-3 w-3" strokeWidth={1.75} /> เบอร์ติดต่อ
                </dt>
                <dd className="font-mono text-ink">
                  {session.phone ?? <span className="text-ink-disabled">—</span>}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} /> ที่ตั้ง
                </dt>
                <dd className="text-ink">
                  {session.farmAddress ?? <span className="text-ink-disabled">—</span>}
                  {session.province && session.province !== session.farmAddress && (
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      จ.{session.province}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <LandPlot className="h-3 w-3" strokeWidth={1.75} /> พื้นที่แปลง
                </dt>
                <dd className="text-ink">
                  {session.declaredAreaRai != null || session.calculatedAreaRai != null ? (
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="font-mono">
                        แจ้ง{' '}
                        {session.declaredAreaRai != null
                          ? session.declaredAreaRai.toFixed(1)
                          : '—'}{' '}
                        ไร่
                        <span className="mx-1.5 text-ink-disabled">·</span>
                        คำนวณ{' '}
                        {session.calculatedAreaRai != null
                          ? session.calculatedAreaRai.toFixed(1)
                          : '—'}{' '}
                        ไร่
                      </span>
                      {session.areaDiscrepancyFlag && (
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
                  {session.checkinLat != null && session.checkinLng != null ? (
                    <a
                      href={`https://www.google.com/maps?q=${session.checkinLat},${session.checkinLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
                    >
                      {session.checkinLat.toFixed(5)}, {session.checkinLng.toFixed(5)}
                      <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                    </a>
                  ) : (
                    <span className="text-ink-disabled">—</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="h-48 overflow-hidden rounded-xl border border-line sm:h-full sm:min-h-[12rem]">
              <SessionMiniMap polygon={session.polygon} expandable />
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
                <dd className="text-lg font-semibold text-success">
                  <Carbon kgCo2e={session.totalCarbonKgCo2e} stacked />
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ConfidenceRing score={session.avgConfidence} size="sm" showLabel={false} />
              <div>
                <dt className="text-xs text-ink-muted">ความเชื่อมั่น AI เฉลี่ย</dt>
                <dd className="text-sm font-semibold" style={{ color: confidenceHex(session.avgConfidence) }}>
                  {confidenceToneLabel(session.avgConfidence)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-secondary">
                <TreePine className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-ink-muted">ต้นไม้ที่ส่งมา</dt>
                <dd className="font-mono text-lg font-semibold text-ink">
                  {session.tally.submitted}
                </dd>

                {/* The breakdown is what makes the carbon figure above
                    explicable: it is computed from the passed trees alone, and
                    without these lines the reader has no way to reconcile the
                    two numbers. */}
                <dd className="mt-2 flex flex-col gap-1 text-[12px]">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-ink-secondary">ใช้ได้ (คิดคาร์บอน)</span>
                    <span className="font-mono font-semibold text-success">
                      {session.tally.passed}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-ink-secondary">ปฏิเสธ</span>
                    <span className="font-mono font-semibold text-error">
                      {session.tally.rejected}
                    </span>
                  </span>
                  {session.tally.unassessed > 0 && (
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-warning">ยังไม่มีผลประเมิน</span>
                      <span className="font-mono font-semibold text-warning">
                        {session.tally.unassessed}
                      </span>
                    </span>
                  )}
                </dd>

                {session.tally.unassessed > 0 && (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
                    ต้นที่ยังไม่มีผลประเมินจะไม่ถูกคิดคาร์บอน เพราะระบบยังไม่เคยคำนวณค่าให้
                  </p>
                )}
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

      {/* Registration + cultivation facts of the assessed subplot */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CultivationInfo
            cultivation={session.cultivation}
            fallbackAreaRai={session.declaredAreaRai}
            equationStatus={session.equation.status}
          />
        </div>
        <RegistrationPanel
          projectName={session.projectName}
          projectCode={session.projectCode}
          registration={session.registration}
          baseline={session.baseline}
        />
      </div>

      {/* Tree snapshot grid */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            ภาพต้นไม้ในชุด
          </h2>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink-secondary">
            {session.trees.length} ภาพ
          </span>
        </div>
        <TreeSnapshotGrid projectId={session.projectId} sessionId={session.id} trees={session.trees} />
      </section>
    </div>
  )
}
