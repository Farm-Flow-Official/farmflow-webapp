'use client'

import dynamic from 'next/dynamic'
import { MapPinned } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import type { ProjectRow } from '@/features/executive/types'
import type { ProjectPin } from '@/features/executive/components/ProjectMapCanvas'

const Canvas = dynamic(() => import('@/features/executive/components/ProjectMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-ink-muted">
      โหลดแผนที่…
    </div>
  ),
})

/**
 * Map card for the project distribution. A project only earns a pin once one of
 * its farms has a boundary — until then there is genuinely nowhere to put it,
 * and an approximate pin on a carbon map would be a claim we cannot back.
 */
export function ProjectMap({
  rows,
  activeProjectId,
}: {
  rows: ProjectRow[]
  activeProjectId?: string
}) {
  const pins: ProjectPin[] = rows
    .filter((r): r is ProjectRow & { lat: number; lng: number } => r.lat !== null && r.lng !== null)
    .map((r) => ({
      id: r.projectId,
      name: r.projectName,
      tco2e: r.tco2e,
      lat: r.lat,
      lng: r.lng,
      active: r.projectId === activeProjectId,
    }))

  const unplaced = rows.length - pins.length

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        ตำแหน่งโครงการ
      </h3>
      <p className="mt-1 text-sm text-ink-secondary">
        หมุดวางที่จุดศูนย์กลางของขอบเขตฟาร์มในโครงการ ไม่ใช่ตำแหน่งแปลงรายบุคคล
      </p>

      {pins.length === 0 ? (
        <EmptyState
          className="mt-4 flex-1 border-0 px-0 py-10"
          icon={MapPinned}
          title="ยังไม่มีโครงการที่วางหมุดได้"
          description="ต้องมีฟาร์มในโครงการอย่างน้อยหนึ่งแปลงที่ปักขอบเขตแล้ว"
        />
      ) : (
        <>
          <div className="mt-4 h-56 overflow-hidden rounded-xl border border-line sm:h-64">
            <Canvas pins={pins} />
          </div>
          {unplaced > 0 && (
            <p className="mt-2 text-[12px] text-ink-muted">
              อีก {unplaced} โครงการยังไม่มีฟาร์มที่ปักขอบเขต จึงยังไม่มีหมุด
            </p>
          )}
        </>
      )}
    </section>
  )
}
