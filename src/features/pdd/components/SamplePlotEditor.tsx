'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { MapPinned, Pencil, Trash2, Undo2, X, Check, Loader2, Info } from 'lucide-react'
import { addSamplePlot, removeSamplePlot } from '@/features/pdd/actions/pddActions'
import type { PddDetail } from '@/features/pdd/types'
import type { PlotShape, Position } from '@/features/pdd/components/map/SamplePlotMap'

// Leaflet touches `window`, so the map only exists on the client.
const SamplePlotMap = dynamic(() => import('@/features/pdd/components/map/SamplePlotMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-sunken text-sm text-ink-muted">
      กำลังโหลดแผนที่…
    </div>
  ),
})

/** Outer ring of a GeoJSON geometry as [lng, lat] pairs. */
function outerRing(geometry: unknown): Position[] {
  const g = geometry as { type?: string; coordinates?: unknown } | null
  if (!g || !Array.isArray(g.coordinates)) return []
  if (g.type === 'MultiPolygon') return (g.coordinates[0]?.[0] ?? []) as Position[]
  if (g.type === 'Polygon') return (g.coordinates[0] ?? []) as Position[]
  return []
}

/**
 * Sample plots (PDD §5) — the sub-areas the monitoring plan measures.
 *
 * Drawing happens on the map with the project's declared boundary underneath,
 * because a plot only means something relative to the land it sits in.
 *
 * Editing an existing plot is deliberately not offered: these are small shapes,
 * redrawing is faster than dragging vertices, and half-built vertex editing
 * would be worse than none.
 */
export function SamplePlotEditor({
  pdd,
  editable,
  onError,
}: {
  pdd: PddDetail
  editable: boolean
  onError: (message: string) => void
}) {
  const router = useRouter()
  const [drawing, setDrawing] = useState(false)
  const [draftRing, setDraftRing] = useState<Position[]>([])
  const [plotName, setPlotName] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const plots: PlotShape[] = useMemo(
    () =>
      pdd.samplePlots
        .map((p) => ({ id: p.id, name: p.plotName, ring: outerRing(p.boundary) }))
        .filter((p) => p.ring.length > 0),
    [pdd.samplePlots],
  )

  const declaredBoundary = useMemo(() => {
    const ring = outerRing(pdd.project.declaredBoundary)
    return ring.length > 0 ? ring : null
  }, [pdd.project.declaredBoundary])

  const cancelDraw = useCallback(() => {
    setDrawing(false)
    setDraftRing([])
    setPlotName('')
  }, [])

  // Escape aborts, Backspace removes the last vertex — the two things anyone
  // reaches for mid-draw without being told.
  useEffect(() => {
    if (!drawing) return
    function onKey(e: KeyboardEvent) {
      const el = e.target
      if (el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (e.key === 'Escape') cancelDraw()
      if (e.key === 'Backspace') {
        e.preventDefault()
        setDraftRing((prev) => prev.slice(0, -1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawing, cancelDraw])

  async function savePlot() {
    if (draftRing.length < 3) return
    const name = plotName.trim() || `แปลงตัวอย่างที่ ${plots.length + 1}`

    setBusy(true)
    // Close the ring: GeoJSON requires the first and last positions to match.
    const closed = [...draftRing, draftRing[0]]
    const res = await addSamplePlot(pdd.projectId, name, {
      type: 'Polygon',
      coordinates: [closed],
    })
    setBusy(false)

    if (!res.ok) return onError(res.error ?? 'บันทึกแปลงตัวอย่างไม่สำเร็จ')
    cancelDraw()
    router.refresh()
  }

  async function deletePlot(plotId: string) {
    setBusy(true)
    const res = await removeSamplePlot(pdd.projectId, plotId)
    setBusy(false)
    if (!res.ok) return onError(res.error ?? 'ลบแปลงตัวอย่างไม่สำเร็จ')
    if (selectedId === plotId) setSelectedId(null)
    router.refresh()
  }

  const canClose = draftRing.length >= 3

  return (
    <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MapPinned className="h-4 w-4 text-primary" strokeWidth={2} />
            แปลงตัวอย่าง (Sample Plots)
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            พื้นที่ย่อยที่ใช้เก็บข้อมูลตามแผนติดตามผล — วาดบนแผนที่โดยมีขอบเขตโครงการที่ประกาศเป็นฉากหลัง
          </p>
        </div>

        {editable && !drawing && (
          <button
            type="button"
            onClick={() => setDrawing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            วาดแปลงใหม่
          </button>
        )}
      </div>

      {drawing && (
        <div className="mt-4 rounded-lg border border-info/40 bg-info-bg px-4 py-3">
          <p className="flex items-start gap-2 text-xs text-info">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            คลิกบนแผนที่เพื่อวางจุด · คลิกจุดแรกอีกครั้งเพื่อปิดรูป · กด{' '}
            <kbd className="rounded border border-info/30 bg-panel px-1 font-sans">Backspace</kbd>{' '}
            ถอยหนึ่งจุด · <kbd className="rounded border border-info/30 bg-panel px-1 font-sans">Esc</kbd>{' '}
            ยกเลิก
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={plotName}
              onChange={(e) => setPlotName(e.target.value)}
              placeholder={`แปลงตัวอย่างที่ ${plots.length + 1}`}
              className="h-9 min-w-[180px] flex-1 rounded-lg border border-line bg-panel px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <span className="text-xs text-ink-secondary">{draftRing.length} จุด</span>

            <button
              type="button"
              onClick={() => setDraftRing((prev) => prev.slice(0, -1))}
              disabled={draftRing.length === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"
            >
              <Undo2 className="h-4 w-4" strokeWidth={1.75} />
              ถอย
            </button>

            <button
              type="button"
              onClick={cancelDraw}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={savePlot}
              disabled={!canClose || busy}
              title={canClose ? undefined : 'ต้องมีอย่างน้อย 3 จุดจึงจะเป็นรูปปิดได้'}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <Check className="h-4 w-4" strokeWidth={2} />
              )}
              บันทึกแปลง
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 h-[420px] overflow-hidden rounded-lg border border-line">
        <SamplePlotMap
          declaredBoundary={declaredBoundary}
          plots={plots}
          draftRing={draftRing}
          drawing={drawing}
          onPoint={(position) => setDraftRing((prev) => [...prev, position])}
          onCloseRing={savePlot}
          selectedPlotId={selectedId}
          onSelectPlot={setSelectedId}
        />
      </div>

      <Legend hasDeclared={Boolean(declaredBoundary)} />

      <ul className="mt-3 flex flex-col gap-1.5">
        {pdd.samplePlots.length === 0 ? (
          <li className="rounded-lg border border-dashed border-line bg-surface px-4 py-5 text-center text-sm text-ink-muted">
            ยังไม่มีแปลงตัวอย่าง
          </li>
        ) : (
          pdd.samplePlots.map((plot) => (
            <li
              key={plot.id}
              className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 transition-colors ${
                selectedId === plot.id ? 'border-primary bg-primary/5' : 'border-line bg-surface'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedId(plot.id)}
                className="flex-1 text-left text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {plot.plotName}
              </button>
              <span className="shrink-0 text-xs text-ink-secondary">
                {plot.areaRai != null ? `${plot.areaRai.toFixed(2)} ไร่` : '—'}
              </span>
              {editable && (
                <button
                  type="button"
                  onClick={() => deletePlot(plot.id)}
                  disabled={busy}
                  aria-label={`ลบ ${plot.plotName}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

function Legend({ hasDeclared }: { hasDeclared: boolean }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted">
      {hasDeclared && (
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-[#1E40AF]" />
          ขอบเขตโครงการที่ประกาศ
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-[#F59E0B]/40 ring-1 ring-[#F59E0B]" />
        แปลงตัวอย่าง
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
        จุดที่กำลังวาด
      </span>
    </div>
  )
}
