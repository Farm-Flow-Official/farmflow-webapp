'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, TreePine, MapPinned, AlertTriangle } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { ListToolbar } from '@/components/ui/list-toolbar'
import { AreaRai } from '@/components/ui/area-rai'
import { ContactCell } from '@/features/farmers/components/ContactCell'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import type { ProjectDetail, ProjectMemberFarm } from '@/features/projects/types'
import type { ProjectLookups } from '@/features/projects/types/lookups'
import {
  enrolFarm,
  setProjectSpecies,
  withdrawFarm,
} from '@/features/projects/actions/projectActions'

const FARM_SORTS = [
  { value: 'farmName', label: 'ชื่อฟาร์ม' },
  { value: 'calculatedAreaRai', label: 'พื้นที่' },
  { value: 'farmStatus', label: 'สถานะ' },
  { value: 'withinDeclaredBoundary', label: 'ขอบเขต' },
]

type Props = {
  project: ProjectDetail
  lookups: ProjectLookups
  canWrite: boolean
}

export function ProjectWorkspace({ project: initial, lookups, canWrite }: Props) {
  const router = useRouter()
  const [project, setProject] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<ProjectMemberFarm | null>(null)
  const { message, showToast } = useToast()

  // Farms the picker may offer: those free to enrol, minus any already added in
  // this session (the server list was fetched before those enrollments).
  const memberIds = useMemo(() => new Set(project.farms.map((f) => f.id)), [project.farms])

  const [farmQuery, setFarmQuery] = useState('')
  const [farmSort, setFarmSort] = useState('farmName')
  const [farmDir, setFarmDir] = useState<'asc' | 'desc'>('asc')

  const visibleFarms = useMemo(() => {
    const needle = farmQuery.trim().toLowerCase()
    const rows = needle
      ? project.farms.filter(
          (f) =>
            f.farmName.toLowerCase().includes(needle) ||
            (f.ownerName?.toLowerCase().includes(needle) ?? false),
        )
      : project.farms

    const pick = (f: ProjectMemberFarm) => {
      switch (farmSort) {
        case 'calculatedAreaRai':
          return f.calculatedAreaRai ?? -1
        case 'farmStatus':
          return f.farmStatus
        case 'withinDeclaredBoundary':
          // Sort the ones that need attention (outside, then unknown) first.
          return f.withinDeclaredBoundary === false ? 0 : f.withinDeclaredBoundary == null ? 1 : 2
        default:
          return f.farmName
      }
    }

    return [...rows].sort((a, b) => {
      const av = pick(a)
      const bv = pick(b)
      if (av === bv) return 0
      return (av < bv ? -1 : 1) * (farmDir === 'asc' ? 1 : -1)
    })
  }, [project.farms, farmQuery, farmSort, farmDir])
  const available = useMemo(
    () => lookups.enrollableFarms.filter((f) => !memberIds.has(f.id)),
    [lookups.enrollableFarms, memberIds],
  )

  const outsideCount = project.farms.filter((f) => f.withinDeclaredBoundary === false).length

  async function handleEnrol(farmId: string) {
    const res = await enrolFarm(project.id, farmId)
    if (!res.ok) return showToast(res.error)
    setProject(res.data)
    setAdding(false)
    showToast('เพิ่มฟาร์มเข้าโครงการเรียบร้อย')
  }

  async function handleWithdraw() {
    if (!removing) return
    const res = await withdrawFarm(project.id, removing.id)
    if (!res.ok) {
      setRemoving(null)
      return showToast(res.error)
    }
    setProject(res.data)
    setRemoving(null)
    showToast('ถอนฟาร์มออกจากโครงการเรียบร้อย')
  }

  async function handleSpecies(speciesIds: string[]) {
    const res = await setProjectSpecies(project.id, speciesIds)
    if (!res.ok) return showToast(res.error ?? 'บันทึกชนิดพันธุ์ไม่สำเร็จ')
    setProject((p) => ({
      ...p,
      allowedSpecies: lookups.species
        .filter((s) => speciesIds.includes(s.id))
        .map((s) => ({
          speciesId: s.id,
          speciesNameTh: s.speciesNameTh,
          speciesNameEn: s.speciesNameEn,
        })),
    }))
    showToast('บันทึกชนิดพันธุ์ที่อนุญาตเรียบร้อย')
  }

  const columns: Column<ProjectMemberFarm>[] = [
    {
      key: 'farm',
      header: 'ฟาร์ม',
      cell: (f) => (
        <div className="flex flex-col">
          <span className="font-medium text-ink">{f.farmName}</span>
          <span className="text-xs text-ink-muted">{f.ownerName ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'ข้อมูลติดต่อ',
      cell: (f) => (
        // Clicking reveal must not also open the farm — the row is a link.
        <span onClick={(e) => e.stopPropagation()} role="presentation">
          <ContactCell
            farmerId={f.ownerUserId}
            phoneMasked={f.ownerPhoneMasked}
            emailMasked={f.ownerEmailMasked}
            hasContact={f.hasContact}
          />
        </span>
      ),
    },
    {
      key: 'area',
      header: 'พื้นที่',
      align: 'right',
      cell: (f) => (
        <span className="text-ink-secondary">
          <AreaRai rai={f.calculatedAreaRai} />
        </span>
      ),
    },
    {
      key: 'boundary',
      header: 'อยู่ในขอบเขตที่ประกาศ',
      cell: (f) => <BoundaryBadge state={f.withinDeclaredBoundary} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (f) =>
        canWrite ? (
          <button
            type="button"
            aria-label={`ถอน ${f.farmName} ออกจากโครงการ`}
            onClick={() => setRemoving(f)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="พื้นที่ที่ประกาศไว้"
          value={project.declaredAreaRai != null ? `${project.declaredAreaRai.toFixed(2)} ไร่` : '—'}
          hint="จากไฟล์ KMZ/KML ใน PDD"
        />
        <StatCard
          label="พื้นที่จริงจากฟาร์มสมาชิก"
          value={
            project.effectiveAreaRai != null ? `${project.effectiveAreaRai.toFixed(2)} ไร่` : '—'
          }
          hint="รวมขอบเขตฟาร์มที่เข้าร่วม (ไม่นับซ้ำ)"
        />
        <StatCard
          label="ฟาร์มที่เข้าร่วม"
          value={`${project.farms.length}`}
          hint={outsideCount > 0 ? `${outsideCount} แห่งอยู่นอกขอบเขตที่ประกาศ` : undefined}
          tone={outsideCount > 0 ? 'warning' : 'neutral'}
        />
      </section>

      <SpeciesPanel
        allowed={project.allowedSpecies.map((s) => s.speciesId)}
        catalogue={lookups.species}
        canWrite={canWrite}
        onSave={handleSpecies}
      />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">ฟาร์มในโครงการ</h2>
          {canWrite && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              เพิ่มฟาร์ม
            </button>
          )}
        </div>

        {/* ADMIN-PROJ-04 — a project can hold hundreds of farms; scanning them
            without search or sort was the complaint. Filtered in the browser
            because this list is bounded by one project's membership. */}
        <ListToolbar
          q={farmQuery}
          onQueryChange={setFarmQuery}
          placeholder="ค้นหาชื่อฟาร์มหรือเกษตรกร…"
          sorts={FARM_SORTS}
          sortValue={farmSort}
          dir={farmDir}
          onSortChange={(s, d) => {
            setFarmSort(s)
            setFarmDir(d)
          }}
        />

        <DataTable
          columns={columns}
          rows={visibleFarms}
          getRowKey={(f) => f.id}
          // ADMIN-PROJ-02 — each row opens the farm it names.
          onRowClick={(f) => router.push(`/admin/farms/${f.id}`)}
          empty={{
            icon: <MapPinned className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
            title: farmQuery ? 'ไม่พบฟาร์มที่ตรงกับคำค้นหา' : 'ยังไม่มีฟาร์มในโครงการ',
            description: farmQuery
              ? 'ลองคำค้นหาอื่น'
              : 'เพิ่มฟาร์มด้วยตนเอง หรือรอให้เกษตรกรสมัครผ่านแอปมือถือ',
          }}
        />
      </section>

      {adding && (
        <FarmPicker farms={available} onPick={handleEnrol} onClose={() => setAdding(false)} />
      )}

      {removing && (
        <ConfirmDialog
          title="ถอนฟาร์มออกจากโครงการ"
          description={
            <>
              ถอน “{removing.farmName}” ออกจากโครงการนี้? ข้อมูลการประเมินเดิมยังอยู่ครบ
              แต่ฟาร์มจะย้ายไปอยู่ในคิว “ฟาร์มที่ยังไม่เข้าโครงการ”
            </>
          }
          confirmLabel="ถอนฟาร์ม"
          tone="danger"
          onConfirm={handleWithdraw}
          onClose={() => setRemoving(null)}
        />
      )}

      <Toast message={message} />
    </div>
  )
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function BoundaryBadge({ state }: { state: boolean | null }) {
  // Null means one of the two geometries is missing — unknown, not a failure.
  if (state === null) {
    return <span className="text-[13px] text-ink-muted">ยังไม่มีข้อมูลขอบเขต</span>
  }
  return state ? (
    <Badge variant="verified" dot>
      อยู่ในขอบเขต
    </Badge>
  ) : (
    <Badge variant="pending" dot>
      อยู่นอกขอบเขต
    </Badge>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'neutral' | 'warning'
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs ${
            tone === 'warning' ? 'text-warning' : 'text-ink-muted'
          }`}
        >
          {tone === 'warning' && <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />}
          {hint}
        </p>
      )}
    </div>
  )
}

function SpeciesPanel({
  allowed,
  catalogue,
  canWrite,
  onSave,
}: {
  allowed: string[]
  catalogue: ProjectLookups['species']
  canWrite: boolean
  onSave: (speciesIds: string[]) => Promise<void>
}) {
  const [selected, setSelected] = useState<string[]>(allowed)
  const [saving, setSaving] = useState(false)
  const dirty = useMemo(
    () => [...selected].sort().join() !== [...allowed].sort().join(),
    [selected, allowed],
  )

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  return (
    <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <TreePine className="h-4 w-4 text-primary" strokeWidth={2} />
            ชนิดพันธุ์ที่อนุญาต
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {selected.length === 0
              ? 'ไม่เลือกเลย = ไม่จำกัดชนิดพันธุ์ — ฟาร์มในโครงการปลูกอะไรก็ได้'
              : `ฟาร์มในโครงการนี้ปลูกได้เฉพาะ ${selected.length} ชนิดที่เลือก`}
          </p>
        </div>
        {canWrite && dirty && (
          <button
            type="button"
            // The species set is a full replace, so a double click sends the
            // same list twice — harmless, but the second toast reads as a bug.
            disabled={saving}
            onClick={async () => {
              if (saving) return
              setSaving(true)
              await onSave(selected)
              setSaving(false)
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึกชนิดพันธุ์'}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {catalogue.map((s) => {
          const on = selected.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              role="switch"
              aria-checked={on}
              disabled={!canWrite}
              onClick={() => toggle(s.id)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${
                on
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-line bg-surface text-ink-secondary hover:text-ink'
              }`}
            >
              {s.speciesNameTh}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function FarmPicker({
  farms,
  onPick,
  onClose,
}: {
  farms: ProjectLookups['enrollableFarms']
  onPick: (farmId: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = farms.filter(
    (f) =>
      f.farmName.toLowerCase().includes(query.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Modal
      onClose={onClose}
      panelClassName="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold text-ink">เพิ่มฟาร์มเข้าโครงการ</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          แสดงเฉพาะฟาร์มที่ยังไม่ได้เข้าร่วมโครงการใด — ฟาร์มหนึ่งอยู่ได้ครั้งละหนึ่งโครงการ
        </p>
      </div>

      <div className="border-b border-line px-6 py-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อฟาร์มหรือเจ้าของ…"
          className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-ink-muted">
            ไม่พบฟาร์มที่ว่างอยู่
          </p>
        ) : (
          filtered.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onPick(f.id)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-ink">{f.farmName}</span>
                <span className="text-xs text-ink-muted">{f.ownerName}</span>
              </span>
              <span className="shrink-0 text-xs text-ink-secondary">
                {f.calculatedAreaRai != null ? `${f.calculatedAreaRai.toFixed(1)} ไร่` : '—'}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="flex justify-end border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ปิด
        </button>
      </div>
    </Modal>
  )
}
