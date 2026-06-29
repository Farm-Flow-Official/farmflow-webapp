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
} from 'lucide-react'
import { fetchBatchById } from '@/features/verifier/services/fetchBatchById'
import { crossCheckTree } from '@/features/verifier/lib/crossCheck'
import { treePlaceholderStyle } from '@/features/verifier/lib/treePlaceholder'
import { snapshotPhotoUrl } from '@/features/verifier/lib/files'
import { confidenceTextClass } from '@/features/verifier/lib/confidence'
import { BatchMiniMap } from '@/features/verifier/components/BatchMiniMap'
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
  const weather = tree.weather && tree.weather in WEATHER
    ? WEATHER[tree.weather as WeatherCondition]
    : null

  const navBase = `/verifier/batches/${batch.id}/tree`

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/verifier/batches/${batch.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          กลับไป {batch.id}
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-secondary">
            ภาพที่ <span className="font-medium text-ink">{index + 1}</span> จาก{' '}
            {batch.trees.length}
          </span>
          <NavBtn href={prev ? `${navBase}/${prev.id}` : null} dir="prev" />
          <NavBtn href={next ? `${navBase}/${next.id}` : null} dir="next" />
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={snapshotPhotoUrl(tree.photoFileId)}
                alt={`ภาพต้นไม้ ${tree.id}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <TreePine className="h-16 w-16 text-white/40" strokeWidth={1.25} />
            )}
            <span
              className={`absolute right-3 top-3 rounded-md bg-panel/90 px-2 py-1 font-mono text-sm font-bold backdrop-blur ${confidenceTextClass(conf)}`}
            >
              {Math.round(conf * 100)}%
            </span>
            <span className="absolute bottom-3 left-3 rounded bg-ink/50 px-2 py-1 text-[11px] text-white/90 backdrop-blur">
              {tree.id}
            </span>
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
                <dd className={`font-mono font-semibold ${confidenceTextClass(conf)}`}>
                  {Math.round(conf * 100)}%
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
              />
            </div>
          </section>
        </div>
      </div>
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
    </Link>
  )
}
