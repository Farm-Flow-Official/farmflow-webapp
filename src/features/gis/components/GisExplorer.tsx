'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { TriangleAlert, Map as MapIcon, Search } from 'lucide-react'
import { FarmGisPanel } from '@/features/gis/components/FarmGisPanel'
import type { FarmGeo } from '@/features/gis/types'

const GisMap = dynamic(() => import('@/features/gis/components/GisMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-ink-muted">
      <MapIcon className="h-4 w-4 animate-pulse" strokeWidth={1.75} />
      กำลังโหลดแผนที่…
    </div>
  ),
})

const LEGEND: { label: string; color: string }[] = [
  { label: 'ผ่านการตรวจ', color: '#22C55E' },
  { label: 'รอตรวจสอบ', color: '#F59E0B' },
  { label: 'ทับซ้อน', color: '#EF4444' },
]

export function GisExplorer({ farms }: { farms: FarmGeo[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [province, setProvince] = useState<string>('all')
  const [focusId, setFocusId] = useState<string | null>(null)
  const [focusNonce, setFocusNonce] = useState(0)

  const flaggedCount = useMemo(
    () => farms.filter((f) => f.overlapFlag).length,
    [farms],
  )
  const provinces = useMemo(
    () => Array.from(new Set(farms.map((f) => f.province))).sort(),
    [farms],
  )
  const shown = useMemo(
    () =>
      farms.filter(
        (f) =>
          (!flaggedOnly || f.overlapFlag) &&
          (province === 'all' || f.province === province),
      ),
    [farms, flaggedOnly, province],
  )
  const selected = farms.find((f) => f.id === selectedId) ?? null
  const focusFarm = farms.find((f) => f.id === focusId) ?? null

  // Select + fly to a farm (from the search box). Reveal it if a filter hides it.
  function pickFarm(id: string) {
    const farm = farms.find((f) => f.id === id)
    if (farm) {
      if (flaggedOnly && !farm.overlapFlag) setFlaggedOnly(false)
      if (province !== 'all' && farm.province !== province) setProvince('all')
    }
    setSelectedId(id)
    setFocusId(id)
    setFocusNonce((n) => n + 1)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-panel px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-ink">GIS Farm Map</h1>
          {flaggedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-error-border bg-error-bg px-2.5 py-1 text-xs font-semibold text-error">
              <TriangleAlert className="h-3.5 w-3.5" strokeWidth={1.75} />
              {flaggedCount} แปลงทับซ้อน
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <FarmSearch farms={farms} onPick={pickFarm} />
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            aria-label="กรองจังหวัด"
            className="h-9 rounded-lg border border-line bg-panel px-3 text-sm text-ink transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">ทุกจังหวัด</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-secondary">
            แสดงเฉพาะที่ทับซ้อน
            <button
              type="button"
              role="switch"
              aria-checked={flaggedOnly}
              onClick={() => setFlaggedOnly((v) => !v)}
              className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                flaggedOnly ? 'bg-primary' : 'bg-ink-disabled'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  flaggedOnly ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Map + panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <GisMap
            farms={shown}
            selectedId={selectedId}
            onSelect={setSelectedId}
            focusFarm={focusFarm}
            focusNonce={focusNonce}
          />

          {/* Empty DB: no farms to plot yet — float a calm hint over the map. */}
          {farms.length === 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-6 z-[500] flex justify-center px-4">
              <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-panel/95 px-4 py-3 shadow-md backdrop-blur">
                <MapIcon className="h-4 w-4 shrink-0 text-ink-disabled" strokeWidth={1.75} />
                <p className="text-[13px] text-ink-secondary">
                  ยังไม่มีแปลงเกษตรในระบบ — ขอบเขตแปลงจะปรากฏบนแผนที่เมื่อเกษตรกรลงทะเบียนแปลง
                </p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg border border-line bg-panel/95 px-3 py-2 shadow-md backdrop-blur">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
              สถานะแปลง
            </p>
            <ul className="flex flex-col gap-1">
              {LEGEND.map((l) => (
                <li key={l.label} className="flex items-center gap-2 text-xs text-ink-secondary">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.label}
                </li>
              ))}
              <li className="mt-1 flex items-center gap-2 border-t border-line pt-1.5 text-xs text-ink-secondary">
                <span className="h-2.5 w-3.5 rounded-sm border border-dashed border-ink-secondary" />
                รอตรวจ GEE
              </li>
            </ul>
          </div>

          {/* Mobile detail sheet */}
          {selected && (
            <div className="absolute inset-x-0 bottom-0 z-[500] max-h-[55%] overflow-y-auto border-t border-line bg-panel shadow-xl lg:hidden">
              <FarmGisPanel farm={selected} onClose={() => setSelectedId(null)} />
            </div>
          )}
        </div>

        {/* Desktop side panel */}
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-line bg-panel lg:block">
          <FarmGisPanel farm={selected} onClose={() => setSelectedId(null)} />
        </aside>
      </div>
    </div>
  )
}

/* ── Farm search (locate + fly-to) ──────────────────────────────────────── */

function FarmSearch({
  farms,
  onPick,
}: {
  farms: FarmGeo[]
  onPick: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return farms
      .filter(
        (f) =>
          f.farmName.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          (f.ownerName?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 6)
  }, [farms, query])

  return (
    <div className="relative w-full sm:w-64">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        strokeWidth={1.75}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="ค้นหาแปลง / เกษตรกร"
            data-search-input
        aria-label="ค้นหาแปลง"
        className="h-9 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-[600] mt-1 max-h-72 w-full overflow-auto rounded-lg border border-line bg-panel py-1 shadow-xl">
          {matches.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onPick(f.id)
                  setQuery(f.farmName)
                  setOpen(false)
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
              >
                <span className="text-sm font-medium text-ink">{f.farmName}</span>
                <span className="font-mono text-[11px] text-ink-muted">
                  {f.id} · {f.ownerName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
