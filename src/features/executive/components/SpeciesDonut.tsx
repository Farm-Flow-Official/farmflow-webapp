import { TreePine } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { formatNumber } from '@/lib/utils/format'
import { CHART_OTHER_COLOR, CHART_SERIES_COLORS, formatTonnes } from '@/features/executive/lib'
import type { SpeciesSlice } from '@/features/executive/types'

/** Past this many species the tail folds into one grey bucket — never a 6th hue. */
const MAX_SLICES = 5

/**
 * What the portfolio actually grows — farms per tree species.
 *
 * Farms, not tonnage, is the measure: it answers "how concentrated are we on one
 * crop?", which is the biodiversity question an ESG reader asks. Certified
 * tonnage rides along in the legend for the reader who wants both.
 *
 * A CSS conic-gradient donut, no chart library. The 2px surface-coloured gap
 * between arcs is not styling — it is the secondary encoding that lets adjacent
 * segments stay separable for a colourblind reader, and it is why the palette
 * clears its gates. Species, not "project type": `projects.project_type` does
 * not exist in this schema, and species is what selects the T-VER allometric
 * equation anyway.
 */
export function SpeciesDonut({ data }: { data: SpeciesSlice[] }) {
  const slices = foldTail(data)
  const totalFarms = slices.reduce((sum, s) => sum + s.farms, 0)

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        ชนิดพันธุ์ไม้ในพอร์ต
      </h3>
      <p className="mt-1 text-sm text-ink-secondary">นับตามจำนวนฟาร์มที่ปลูก</p>

      {totalFarms <= 0 ? (
        <EmptyState
          className="mt-4 flex-1 border-0 px-0 py-10"
          icon={TreePine}
          title="ยังไม่มีฟาร์มที่บันทึกชนิดพันธุ์ไม้"
          description="เมื่อเกษตรกรบันทึกข้อมูลการเพาะปลูก สัดส่วนชนิดพันธุ์ไม้จะขึ้นที่นี่"
        />
      ) : (
        <Donut slices={slices} totalFarms={totalFarms} />
      )}
    </section>
  )
}

type Slice = SpeciesSlice & { color: string }

function foldTail(data: SpeciesSlice[]): Slice[] {
  const ranked = [...data].sort((a, b) => b.farms - a.farms || b.tco2e - a.tco2e)
  // Colour comes from `colorIndex` — the species' rank across the whole
  // portfolio — not from its position in this list. A species keeps its hue
  // when the reader filters to one project.
  const head = ranked
    .slice(0, MAX_SLICES)
    .map((s) => ({
      ...s,
      color: CHART_SERIES_COLORS[s.colorIndex % CHART_SERIES_COLORS.length],
    }))
  const tail = ranked.slice(MAX_SLICES)
  if (tail.length === 0) return head

  return [
    ...head,
    {
      speciesCode: '__other__',
      speciesNameTh: `อีก ${tail.length} ชนิด`,
      farms: tail.reduce((sum, s) => sum + s.farms, 0),
      tco2e: tail.reduce((sum, s) => sum + s.tco2e, 0),
      colorIndex: -1,
      color: CHART_OTHER_COLOR,
    },
  ]
}

function Donut({ slices, totalFarms }: { slices: Slice[]; totalFarms: number }) {
  // A hairline of the surface colour between arcs — the gap the validator's
  // adjacent-pair rule leans on. Skipped when there is only one slice, where a
  // gap would just look like a nick in a full ring.
  const GAP_DEG = slices.length > 1 ? 1.2 : 0

  const stops = slices
    .reduce<{ acc: number; out: string[] }>(
      ({ acc, out }, s) => {
        const start = (acc / totalFarms) * 360
        const next = acc + s.farms
        const end = (next / totalFarms) * 360
        out.push(`${s.color} ${start}deg ${Math.max(start, end - GAP_DEG)}deg`)
        if (GAP_DEG > 0) {
          out.push(`var(--color-panel) ${Math.max(start, end - GAP_DEG)}deg ${end}deg`)
        }
        return { acc: next, out }
      },
      { acc: 0, out: [] },
    )
    .out.join(', ')

  return (
    <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
      <div
        className="relative mx-auto h-28 w-28 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
        role="img"
        aria-label={`สัดส่วนชนิดพันธุ์ไม้ตามจำนวนฟาร์ม รวม ${totalFarms} ฟาร์ม`}
      >
        <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-panel">
          <span className="text-xl font-bold leading-none text-ink">{formatNumber(totalFarms)}</span>
          <span className="mt-0.5 text-[10px] text-ink-muted">ฟาร์ม</span>
        </div>
      </div>

      {/* Every slice is labelled in text with its own value — the relief that
          makes the two low-contrast slots in the palette legal. */}
      <ul className="flex flex-1 flex-col gap-2">
        {slices.map((s) => (
          <li key={s.speciesCode} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-ink-secondary">{s.speciesNameTh}</span>
            <span className="shrink-0 font-mono text-[13px] tabular-nums text-ink">
              {formatNumber(s.farms)}
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink-muted">
              {formatTonnes(s.tco2e)}t
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
