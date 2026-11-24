'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Search, Trash2, TreePine, TrendingUp } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import { SpeciesForm } from '@/features/species/components/SpeciesForm'
import { SpeciesUsageCell } from '@/features/species/components/SpeciesUsageCell'
import { SpeciesGrowthPreview } from '@/features/species/components/SpeciesGrowthPreview'
import { CalculationChangeGate } from '@/features/species/components/CalculationChangeGate'
import {
  createSpecies,
  deleteSpecies,
  updateSpecies,
} from '@/features/species/actions/speciesActions'
import { isInUse, touchesCalculation } from '@/features/species/types'
import type { SpeciesInput, SpeciesLookups, SpeciesRow } from '@/features/species/types'

/**
 * Species and the carbon equation each one runs.
 *
 * Two safety mechanisms live here, and they are deliberately different in
 * weight. Changing a coefficient on a species trees have already been assessed
 * against goes through a typed confirmation that states the blast radius — but
 * only when a *calculation* field moved; a spelling fix passes straight
 * through, because a confirmation that fires on everything stops being read.
 * Deleting is not a confirmation at all: a species anything depends on simply
 * cannot be deleted, and the button says why.
 */
export function SpeciesManager({
  species,
  lookups,
  canWrite,
}: {
  species: SpeciesRow[]
  lookups: SpeciesLookups
  canWrite: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { message, showToast } = useToast()

  const [editing, setEditing] = useState<SpeciesRow | 'new' | null>(null)
  const [removing, setRemoving] = useState<SpeciesRow | null>(null)
  const [previewing, setPreviewing] = useState<SpeciesRow | null>(null)
  const [query, setQuery] = useState('')
  // A save held back until the person confirms they mean to move future carbon.
  const [gated, setGated] = useState<{
    species: SpeciesRow
    input: SpeciesInput
  } | null>(null)

  const familyLabel = useMemo(
    () => new Map(lookups.families.map((f) => [f.formula, f.summaryTh])),
    [lookups.families],
  )

  // The T-VER positive list alone is 58 species; scrolling for one is not a way
  // to find it.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return species
    return species.filter((s) =>
      [s.speciesNameTh, s.speciesNameEn, s.speciesCode, s.equationFormula]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle)),
    )
  }, [species, query])

  function save(input: SpeciesInput) {
    const target = editing
    if (target === null) return

    if (target === 'new') {
      run(() => createSpecies(input), 'เพิ่มชนิดพันธุ์ไม้แล้ว')
      return
    }

    // Only a change that moves future carbon needs the gate.
    if (isInUse(target.usage) && touchesCalculation(target, input)) {
      setGated({ species: target, input })
      return
    }
    run(() => updateSpecies(target.id, input), 'บันทึกแล้ว')
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        showToast(result.error ?? 'ทำรายการไม่สำเร็จ')
        return
      }
      setEditing(null)
      setGated(null)
      setRemoving(null)
      showToast(success)
      router.refresh()
    })
  }

  const columns: Column<SpeciesRow>[] = [
    {
      key: 'name',
      header: 'ชนิดพันธุ์ไม้',
      cell: (s) => (
        <div className="min-w-0">
          <span className="block truncate font-medium text-ink">{s.speciesNameTh}</span>
          <span className="font-mono text-[11px] text-ink-muted">{s.speciesCode}</span>
        </div>
      ),
    },
    {
      key: 'formula',
      header: 'สมการ',
      cell: (s) => (
        <div className="min-w-0">
          <span className="block font-mono text-[12px] text-ink">{s.equationFormula ?? '—'}</span>
          <span className="block truncate text-[11px] text-ink-muted">
            {familyLabel.get(s.equationFormula ?? '') ?? ''}
          </span>
        </div>
      ),
    },
    {
      key: 'coefficients',
      header: 'R / CF',
      align: 'right',
      cell: (s) => (
        <span className="font-mono text-[12px] tabular-nums text-ink-secondary">
          {s.rValue ?? '—'} / {s.cfValue ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (s) => (
        <Badge variant={s.equationStatus === 'approved' ? 'verified' : 'pending'}>
          {s.equationStatus === 'approved' ? 'รับรองแล้ว' : 'ใช้ชั่วคราว'}
        </Badge>
      ),
    },
    {
      key: 'growth',
      header: 'ΔDBH / ΔH',
      cell: (s) =>
        s.growthIncrementCode ? (
          <div className="min-w-0">
            <span className="block truncate text-[12px] text-ink">{s.growthIncrementNameTh}</span>
            <span className="font-mono text-[11px] tabular-nums text-ink-muted">
              {s.growthDbhCmPerYear} ซม./ปี · {s.growthHeightMPerYear} ม./ปี
            </span>
          </div>
        ) : (
          <span className="text-[12px] text-ink-muted">—</span>
        ),
    },
    {
      key: 'usage',
      header: 'ใช้งานอยู่',
      cell: (s) => <SpeciesUsageCell usage={s.usage} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label={`ดูค่าพยากรณ์ของ ${s.speciesNameTh}`}
            title="ค่าพยากรณ์ 10 ปี"
            onClick={() => setPreviewing(s)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
          </button>
          {canWrite && (
            <>
              <button
                type="button"
                aria-label={`แก้ไข ${s.speciesNameTh}`}
                onClick={() => setEditing(s)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label={`ลบ ${s.speciesNameTh}`}
                disabled={isInUse(s.usage)}
                // Disabled rather than allowed-then-refused: the row already shows
                // what depends on it, so a 409 would only repeat what is on screen.
                title={
                  isInUse(s.usage)
                    ? 'ลบไม่ได้เพราะมีฟาร์ม โครงการ หรือต้นไม้ที่คำนวณแล้วใช้อยู่'
                    : undefined
                }
                onClick={() => setRemoving(s)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-secondary"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              strokeWidth={1.9}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อไทย ชื่อวิทยาศาสตร์ รหัส หรือสมการ"
              aria-label="ค้นหาชนิดพันธุ์ไม้"
              className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <p className="text-sm text-ink-secondary">
            {query.trim()
              ? `${visible.length} จาก ${species.length} ชนิด`
              : `${species.length} ชนิด`}{' '}
            · ค่าที่แก้ที่นี่ใช้กับต้นไม้ที่ประเมินหลังจากนี้เท่านั้น
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-action px-4 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            เพิ่มชนิดพันธุ์ไม้
          </button>
        )}
      </div>

      <DataTable
        rows={visible}
        columns={columns}
        getRowKey={(s) => s.id}
        empty={
          query.trim()
            ? {
                icon: <Search className="h-6 w-6" strokeWidth={1.5} />,
                title: `ไม่พบ "${query.trim()}"`,
                description: 'ลองค้นด้วยชื่อไทย ชื่อวิทยาศาสตร์ รหัส หรือชื่อสมการ',
              }
            : {
                icon: <TreePine className="h-6 w-6" strokeWidth={1.5} />,
                title: 'ยังไม่มีชนิดพันธุ์ไม้',
                description: 'เพิ่มชนิดแรกเพื่อให้เกษตรกรเลือกได้ตอนบันทึกข้อมูลการเพาะปลูก',
              }
        }
      />

      {editing && (
        <Modal onClose={() => setEditing(null)} panelClassName="w-full max-w-2xl p-6">
          <SpeciesForm
            initial={editing === 'new' ? undefined : editing}
            lookups={lookups}
            pending={pending}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {gated && (
        <Modal onClose={() => setGated(null)} panelClassName="w-full max-w-lg p-6">
          <CalculationChangeGate
            species={gated.species}
            pending={pending}
            onCancel={() => setGated(null)}
            onConfirm={() =>
              run(() => updateSpecies(gated.species.id, gated.input), 'บันทึกค่าใหม่แล้ว')
            }
          />
        </Modal>
      )}

      {removing && (
        <ConfirmDialog
          title={`ลบ ${removing.speciesNameTh}?`}
          description="ยังไม่มีฟาร์ม โครงการ หรือต้นไม้ที่คำนวณแล้วใช้ชนิดนี้ จึงลบออกได้"
          confirmLabel="ลบ"
          pending={pending}
          onConfirm={() => run(() => deleteSpecies(removing.id), 'ลบแล้ว')}
          onClose={() => setRemoving(null)}
        />
      )}

      {previewing && (
        <Modal onClose={() => setPreviewing(null)} panelClassName="w-full max-w-3xl p-6">
          <SpeciesGrowthPreview species={previewing} />
        </Modal>
      )}

      <Toast message={message} />
    </div>
  )
}
