import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Gauge,
  Ruler,
  ArrowUpFromLine,
  TreePine,
  CircleCheck,
  CircleX,
  Sun,
  Cloud,
  CloudRain,
  TriangleAlert,
  Sparkles,
} from 'lucide-react'
import { aiFlagLabel } from '@/features/verifier/lib/aiFlags'
import { fetchBatchById } from '@/features/verifier/services/fetchBatchById'
import { crossCheckTree } from '@/features/verifier/lib/crossCheck'
import { treePlaceholderStyle } from '@/features/verifier/lib/treePlaceholder'
import { snapshotPhotoUrl } from '@/features/verifier/lib/files'
import { confidenceTextClass } from '@/features/verifier/lib/confidence'
import { BatchMiniMap } from '@/features/verifier/components/BatchMiniMap'
import { PhotoLightbox } from '@/features/verifier/components/PhotoLightbox'
import { TreeKeyboardNav } from '@/features/verifier/components/TreeKeyboardNav'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { LinkNavProgress } from '@/features/verifier/components/NavProgressBar'
import { Kbd } from '@/components/ui/kbd'
import { formatDateTime } from '@/lib/utils/format'
type WeatherCondition = 'sunny' | 'cloudy' | 'rainy'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ batchId: string; treeId: string }>
}): Promise<Metadata> {
  const { treeId } = await params
  return { title: `${treeId} — FarmFlow Verifier` }
}

const WEATHER: Record<WeatherCondition, { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string }> = {
  sunny: { icon: Sun, label: 'แดดจัด' },
  cloudy: { icon: Cloud, label: 'มีเมฆ' },
  rainy: { icon: CloudRain, label: 'ฝนตก' },
}

export default async function TreeInspectPage({
  params,
}: {
  params: Promise<{ batchId: string; treeId: string }>
}) {
  const { batchId, treeId } = await params
  const batch = await fetchBatchById(batchId)
  if (!batch) notFound()

  const index = batch.trees.findIndex((t) => t.id === treeId)
  if (index === -1) notFound()

  const tree = batch.trees[index]
  const prev = batch.trees[index - 1] ?? null
  const next = batch.trees[index + 1] ?? null
  const checks = crossCheckTree(tree, batch)
  const failed = checks.filter((c) => c.status === 'fail').length
  const gpsOk = checks.find((c) => c.key === 'gps')?.status === 'pass'
  const conf = tree.aiConfidenceScore ?? 0
  const aiFailed = tree.aiStatus === 'failed'
  const weather = tree.weather && tree.weather in WEATHER
    ? WEATHER[tree.weather as WeatherCondition]
    : null

  const navBase = `/verifier/batches/${batch.id}/tree`
  const batchHref = `/verifier/batches/${batch.id}`
  const prevHref = prev ? `${navBase}/${prev.id}` : null
  const nextHref = next ? `${navBase}/${next.id}` : null

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <TreeKeyboardNav prevHref={prevHref} nextHref={nextHref} backHref={batchHref} />

      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={batchHref}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          กลับไป {batch.id}
          <Kbd className="ml-0.5">Esc</Kbd>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-secondary">
              ภาพที่ <span className="font-medium text-ink">{index + 1}</span> จาก{' '}
              {batch.trees.length}
            </span>
            {/* Progress through the batch — a verifier reviewing 50 photos wants
                to see how much is left without counting. */}
            <span
              className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-surface sm:block"
              role="progressbar"
              aria-valuenow={index + 1}
              aria-valuemin={1}
              aria-valuemax={batch.trees.length}
              aria-label="ความคืบหน้าการตรวจภาพ"
            >
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${((index + 1) / batch.trees.length) * 100}%` }}
              />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NavBtn href={prevHref} dir="prev" />
            <NavBtn href={nextHref} dir="next" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Photo */}
        <section>
          <div
            className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border shadow-sm ${
              tree.anomaly ? 'border-error/60 ring-1 ring-error/30' : 'border-line'
            }`}
            style={treePlaceholderStyle(tree.id)}
          >
            {tree.photoFileId ? (
              <ImageWithSkeleton
                src={snapshotPhotoUrl(tree.photoFileId)}
                alt={`ภาพต้นไม้ ${tree.id}`}
                skeleton={false}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out"
              />
            ) : (
              <TreePine className="h-16 w-16 text-white/40" strokeWidth={1.25} />
            )}
            {aiFailed ? (
              <span className="absolute right-3 top-3 rounded-md bg-panel/90 px-2 py-1 text-xs font-semibold text-ink-secondary backdrop-blur">
                ตรวจด้วยมือ
              </span>
            ) : tree.aiConfidenceScore != null ? (
              <span
                className={`absolute right-3 top-3 rounded-md bg-panel/90 px-2 py-1 font-mono text-sm font-bold backdrop-blur ${confidenceTextClass(conf)}`}
              >
                {Math.round(conf * 100)}%
              </span>
            ) : null}
            <span className="absolute bottom-3 left-3 rounded bg-ink/50 px-2 py-1 text-[11px] text-white/90 backdrop-blur">
              {tree.id}
            </span>
            {tree.photoFileId && (
              <PhotoLightbox
                src={snapshotPhotoUrl(tree.photoFileId)}
                alt={`ภาพต้นไม้ ${tree.id}`}
              />
            )}
          </div>
          {!tree.photoFileId && (
            <p className="mt-2 text-center text-xs text-ink-muted">
              ไม่มีภาพถ่ายสำหรับต้นไม้นี้
            </p>
          )}
        </section>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Cross-check */}
          <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                ผลตรวจสอบความถูกต้อง
              </h2>
              {failed > 0 ? (
                <span className="rounded-full bg-error-bg px-2 py-0.5 text-[11px] font-semibold text-error">
                  พบ {failed} จุดต้องตรวจ
                </span>
              ) : (
                <span className="rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-semibold text-success">
                  ผ่านทั้งหมด
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-2.5">
              {checks.map((c) => (
                <li key={c.key} className="flex items-start gap-2.5">
                  {c.status === 'pass' ? (
                    <>
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={1.9} />
                      <span className="sr-only">ผ่าน:</span>
                    </>
                  ) : (
                    <>
                      <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={1.9} />
                      <span className="sr-only">ไม่ผ่าน:</span>
                    </>
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink">{c.label}</p>
                    <p className={`text-[13px] ${c.status === 'fail' ? 'text-error' : 'text-ink-secondary'}`}>
                      {c.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-2 text-[11px] text-ink-muted">
              * การตรวจ weather × timestamp ต้องใช้ข้อมูลสภาพอากาศย้อนหลัง — รอเชื่อมต่อ API
            </p>
          </section>

          {/* AI vision assessment (ADR 0022) */}
          <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                ผลประเมินภาพด้วย AI
              </h2>
              {aiFailed ? (
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">
                  ประเมินไม่สำเร็จ
                </span>
              ) : tree.aiConfidenceScore != null ? (
                <span className={`font-mono text-sm font-bold ${confidenceTextClass(conf)}`}>
                  {Math.round(conf * 100)}%
                </span>
              ) : null}
            </div>

            {aiFailed ? (
              <p className="flex items-start gap-2 text-sm text-ink-secondary">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.9} />
                AI ประเมินภาพนี้ไม่สำเร็จ — โปรดตรวจสอบด้วยตนเอง
              </p>
            ) : tree.aiRationale || tree.aiFlags.length > 0 ? (
              <>
                {tree.aiRationale && (
                  <p className="text-sm leading-relaxed text-ink-secondary">{tree.aiRationale}</p>
                )}
                {tree.aiFlags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {tree.aiFlags.map((f) => (
                      <li
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-error-bg px-2 py-0.5 text-[11px] font-semibold text-error"
                      >
                        <TriangleAlert className="h-3 w-3" strokeWidth={1.9} />
                        {aiFlagLabel(f)}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-muted">ยังไม่มีผลการประเมิน</p>
            )}
          </section>

          {/* Metadata */}
          <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
              ข้อมูลภาพ
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="col-span-2">
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} /> พิกัดถ่ายภาพ
                </dt>
                <dd>
                  {tree.captureLat != null && tree.captureLng != null ? (
                    <a
                      href={`https://www.google.com/maps?q=${tree.captureLat},${tree.captureLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline"
                    >
                      {tree.captureLat.toFixed(5)}, {tree.captureLng.toFixed(5)}
                    </a>
                  ) : (
                    <span className="text-ink-disabled">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <Clock className="h-3 w-3" strokeWidth={1.75} /> เวลาถ่าย
                </dt>
                <dd className="text-ink">
                  {tree.capturedAt ? (
                    formatDateTime(tree.capturedAt)
                  ) : (
                    <span className="text-ink-disabled">—</span>
                  )}
                </dd>
              </div>
              {weather && (
                <div>
                  <dt className="flex items-center gap-1 text-xs text-ink-muted">
                    <weather.icon className="h-3 w-3" strokeWidth={1.75} /> สภาพอากาศ
                  </dt>
                  <dd className="text-ink">{weather.label}</dd>
                </div>
              )}
              <div className={weather ? 'col-span-2' : ''}>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <Gauge className="h-3 w-3" strokeWidth={1.75} /> ความเชื่อมั่น AI
                </dt>
                <dd
                  className={
                    aiFailed || tree.aiConfidenceScore == null
                      ? 'text-ink-disabled'
                      : `font-mono font-semibold ${confidenceTextClass(conf)}`
                  }
                >
                  {aiFailed ? 'ไม่สำเร็จ' : tree.aiConfidenceScore != null ? `${Math.round(conf * 100)}%` : '—'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <Ruler className="h-3 w-3" strokeWidth={1.75} /> DBH
                </dt>
                <dd className="font-mono text-ink">
                  {tree.dbhCm != null ? `${tree.dbhCm.toFixed(1)} cm` : <span className="text-ink-disabled">—</span>}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-muted">
                  <ArrowUpFromLine className="h-3 w-3" strokeWidth={1.75} /> ความสูง
                </dt>
                <dd className="font-mono text-ink">
                  {tree.treeHeightM != null ? `${tree.treeHeightM.toFixed(1)} m` : <span className="text-ink-disabled">—</span>}
                </dd>
              </div>
            </dl>
          </section>

          {/* Mini-map with capture pin */}
          <section className="overflow-hidden rounded-2xl border border-line shadow-sm">
            <div className="h-56">
              <BatchMiniMap
                polygon={batch.polygon}
                pin={tree.captureLng != null && tree.captureLat != null
                  ? [tree.captureLng, tree.captureLat]
                  : undefined}
                pinColor={gpsOk ? '#2563EB' : '#C8000E'}
                expandable
              />
            </div>
          </section>
        </div>
      </div>

      <p className="mt-6 hidden text-center text-xs text-ink-muted sm:block">
        กด <Kbd>←</Kbd> <Kbd>→</Kbd> เพื่อเลื่อนภาพ · <Kbd>F</Kbd> ดูเต็มจอ · <Kbd>?</Kbd>{' '}
        เปิดคู่มือและคีย์ลัด
      </p>
    </div>
  )
}

function NavBtn({ href, dir }: { href: string | null; dir: 'prev' | 'next' }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  const label = dir === 'prev' ? 'ก่อนหน้า' : 'ถัดไป'
  const content = (
    <>
      {dir === 'prev' && <Icon className="h-4 w-4" strokeWidth={1.75} />}
      {label}
      <Kbd className="hidden sm:inline-flex">{dir === 'prev' ? '←' : '→'}</Kbd>
      {dir === 'next' && <Icon className="h-4 w-4" strokeWidth={1.75} />}
    </>
  )
  const cls =
    'inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-sm font-medium transition-colors'

  if (!href) {
    return (
      <span className={`${cls} cursor-not-allowed text-ink-disabled`} aria-disabled>
        {content}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className={`${cls} bg-panel text-ink-secondary hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      {content}
      <LinkNavProgress />
    </Link>
  )
}
