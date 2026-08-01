'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { MapPinned, Pencil, Trash2, Undo2, X, Check, Loader2, Info, Maximize2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
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
  const [expanded, setExpanded] = useState(false)

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

  // Backspace removes the last vertex — the thing anyone reaches for mid-draw
  // without being told. Escape is handled by the dialog instead (see
  // `closeExpanded`), because Modal traps it before it can reach this listener
  // and only the dialog knows whether Escape means "abandon this shape" or
  // "close the map".
  useEffect(() => {
    if (!drawing) return
    function onKey(e: KeyboardEvent) {
      const el = e.target
      if (el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (e.key === 'Backspace') {
        e.preventDefault()
        setDraftRing((prev) => prev.slice(0, -1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawing])

  /**
   * Drawing only happens in the expanded dialog: placing vertices needs to pan
   * and zoom, and the inline map has neither. So the draw button opens the
   * dialog with the pencil already armed rather than leaving someone tapping at
   * a map that will not move.
   */
  const startDrawing = useCallback(() => {
    setDrawing(true)
    setExpanded(true)
  }, [])

  // Escape while drawing abandons the shape; Escape otherwise closes the map.
  // Losing an unfinished polygon to a stray key would be the worse surprise.
  const closeExpanded = useCallback(() => {
    if (drawing) return cancelDraw()
    setExpanded(false)
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

  // One set of map props, two mounts: a locked preview in the form and a live
  // one in the dialog. They must not drift apart.
  const mapProps = {
    declaredBoundary,
    plots,
    draftRing,
    drawing,
    onPoint: (position: Position) => setDraftRing((prev) => [...prev, position]),
    onCloseRing: savePlot,
    selectedPlotId: selectedId,
    onSelectPlot: setSelectedId,
  }

  const drawButton = (
    <button
      type="button"
      onClick={startDrawing}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Pencil className="h-4 w-4" strokeWidth={2} />
      วาดแปลงใหม่
    </button>
  )

  // The draw controls live in the dialog, which is the only place drawing
  // happens.
  const drawPanel = drawing && (
    <div className="shrink-0 border-b border-line bg-info-bg px-5 py-3">
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
  )

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

        {editable && drawButton}
      </div>

      {/* Preview: shows the shapes, moves for nobody. */}
      <div className="relative mt-4 h-[420px] overflow-hidden rounded-lg border border-line">
        <SamplePlotMap {...mapProps} locked />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute right-3 top-3 z-[800] inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel/95 px-3 py-2 text-xs font-semibold text-ink shadow-sm backdrop-blur transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
          ขยายแผนที่
        </button>
      </div>

      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
        แผนที่นี้ล็อกการเลื่อนและซูมไว้ เพื่อไม่ให้ปัดโดนระหว่างเลื่อนหน้าจอ — กด{' '}
        <span className="font-medium text-ink-secondary">ขยายแผนที่</span> เพื่อเลื่อน ซูม หรือวาดแปลง
      </p>

      <Legend hasDeclared={Boolean(declaredBoundary)} />

      {expanded && (
        <Modal
          onClose={closeExpanded}
          // A stray tap on the backdrop must not throw away an unfinished shape.
          closeOnBackdrop={!drawing}
          labelledBy="sample-plot-map-title"
          panelClassName="flex h-[92vh] w-[96vw] max-w-6xl flex-col overflow-hidden p-0"
        >
          <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-3">
            <div>
              <h4 id="sample-plot-map-title" className="text-sm font-semibold text-ink">
                แปลงตัวอย่าง (Sample Plots)
              </h4>
              <p className="mt-0.5 text-xs text-ink-muted">
                เลื่อนและซูมได้ตามปกติ · กดปิดเมื่อดูเสร็จ
              </p>
            </div>

            <div className="flex items-center gap-2">
              {editable && !drawing && drawButton}
              <button
                type="button"
                onClick={closeExpanded}
                title={drawing ? 'ยกเลิกการวาดก่อน แล้วกดอีกครั้งเพื่อปิด' : 'ปิด'}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
                ปิด
              </button>
            </div>
          </div>

          {drawPanel}

          {/* min-h-0 lets the map take the leftover height instead of overflowing
              the panel — flex children refuse to shrink below content otherwise. */}
          <div className="min-h-0 flex-1">
            <SamplePlotMap {...mapProps} />
          </div>

          <div className="shrink-0 border-t border-line px-5 py-2">
            <Legend hasDeclared={Boolean(declaredBoundary)} inDialog />
          </div>
        </Modal>
      )}

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

function Legend({ hasDeclared, inDialog = false }: { hasDeclared: boolean; inDialog?: boolean }) {
  return (
    <div
      className={`flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted ${inDialog ? '' : 'mt-2'}`}
    >
      {hasDeclared && (
        <span className="flex items-center gap-1.5">
          {/* White dashes on a dark bar — the swatch has to read the way the
              line does on imagery, or the legend stops matching the map. */}
          <span className="flex h-3 w-5 items-center justify-center rounded-sm bg-[#0F172A]/70">
            <span className="h-0 w-full border-t-2 border-dashed border-white" />
          </span>
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
