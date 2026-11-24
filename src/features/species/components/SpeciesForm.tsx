'use client'

import { useId, useState } from 'react'
import { Info } from 'lucide-react'
import type {
  EquationFamily,
  SpeciesInput,
  SpeciesLookups,
  SpeciesRow,
} from '@/features/species/types'

const FIELD =
  'h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15'

/**
 * Create / edit one species.
 *
 * The equation family is picked first because three columns follow from it.
 * Those columns are shown as a statement of what will be saved, never as
 * inputs: they describe the equation, so offering them would let someone build
 * a row that contradicts its own maths.
 *
 * The family list comes from the API, which reads it from the carbon engine. A
 * formula the engine cannot run yields an error instead of carbon for every
 * tree recorded against it — and nobody would find out until after the field
 * work — so this picker must never offer one.
 */
export function SpeciesForm({
  initial,
  lookups,
  pending,
  onSubmit,
  onCancel,
}: {
  initial?: SpeciesRow
  lookups: SpeciesLookups
  pending: boolean
  onSubmit: (input: SpeciesInput) => void
  onCancel: () => void
}) {
  const ids = useId()
  const [form, setForm] = useState<SpeciesInput>({
    speciesCode: initial?.speciesCode ?? '',
    speciesNameTh: initial?.speciesNameTh ?? '',
    speciesNameEn: initial?.speciesNameEn ?? '',
    equationFormula: initial?.equationFormula ?? lookups.families[0]?.formula ?? '',
    equationGroupId: initial?.equationGroupId ?? '',
    growthIncrementGroupId: initial?.growthIncrementGroupId ?? '',
    forestCategoryId: initial?.forestCategoryId ?? '',
    rValue: initial?.rValue ?? null,
    cfValue: initial?.cfValue ?? null,
    tverReference: initial?.tverReference ?? '',
    equationStatus: initial?.equationStatus ?? 'provisional',
  })

  const family: EquationFamily | undefined = lookups.families.find(
    (f) => f.formula === form.equationFormula,
  )

  const growth = lookups.growthIncrementGroups.find((g) => g.id === form.growthIncrementGroupId)

  const set = <K extends keyof SpeciesInput>(key: K, value: SpeciesInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  /**
   * Switch family, and offer its group's published R / CF.
   *
   * Only into empty fields. Overwriting a value someone typed would silently
   * undo a deliberate choice — R and CF are per-species data precisely because
   * the group default is not always right.
   */
  const setFamily = (formula: string) =>
    setForm((f) => {
      const picked = lookups.families.find((x) => x.formula === formula)
      return {
        ...f,
        equationFormula: formula,
        rValue: f.rValue ?? picked?.defaultRValue ?? null,
        cfValue: f.cfValue ?? picked?.defaultCfValue ?? null,
      }
    })

  const numeric = (raw: string) => (raw.trim() === '' ? null : Number(raw))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          ...form,
          speciesNameEn: form.speciesNameEn?.trim() || null,
          tverReference: form.tverReference?.trim() || null,
          equationGroupId: form.equationGroupId || null,
          growthIncrementGroupId: form.growthIncrementGroupId || null,
          forestCategoryId: form.forestCategoryId || null,
        })
      }}
      className="flex flex-col gap-4"
    >
      <h2 className="text-base font-semibold text-ink">
        {initial ? `แก้ไข ${initial.speciesNameTh}` : 'เพิ่มชนิดพันธุ์ไม้'}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${ids}-code`} label="รหัส" hint="ไม่ซ้ำกับที่มีอยู่ เช่น OGW-TEAK">
          <input
            id={`${ids}-code`}
            required
            value={form.speciesCode}
            onChange={(e) => set('speciesCode', e.target.value)}
            className={`${FIELD} font-mono`}
          />
        </Field>
        <Field id={`${ids}-th`} label="ชื่อไทย">
          <input
            id={`${ids}-th`}
            required
            value={form.speciesNameTh}
            onChange={(e) => set('speciesNameTh', e.target.value)}
            className={FIELD}
          />
        </Field>
        <Field id={`${ids}-en`} label="ชื่ออังกฤษ" optional>
          <input
            id={`${ids}-en`}
            value={form.speciesNameEn ?? ''}
            onChange={(e) => set('speciesNameEn', e.target.value)}
            className={FIELD}
          />
        </Field>
        <Field
          id={`${ids}-status`}
          label="สถานะสมการ"
          hint="ขึ้นเป็นป้ายในตาราง ไม่กั้นการออกเครดิต"
        >
          <select
            id={`${ids}-status`}
            value={form.equationStatus}
            onChange={(e) =>
              set('equationStatus', e.target.value as SpeciesInput['equationStatus'])
            }
            className={FIELD}
          >
            <option value="provisional">ใช้ชั่วคราว (provisional)</option>
            <option value="approved">ผ่านการรับรอง (approved)</option>
          </select>
        </Field>
      </div>

      <Field
        id={`${ids}-formula`}
        label="ตระกูลสมการ"
        hint="เลือกได้เฉพาะสมการที่ระบบคำนวณรองรับจริง"
      >
        <select
          id={`${ids}-formula`}
          required
          value={form.equationFormula}
          onChange={(e) => setFamily(e.target.value)}
          className={FIELD}
        >
          {lookups.families.map((f) => (
            <option key={f.formula} value={f.formula}>
              {f.formula} · {f.nameTh}
            </option>
          ))}
        </select>
      </Field>

      {family && <FamilyNote family={family} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={`${ids}-r`}
          label="ค่า R (root-to-shoot)"
          hint="เช่น 0.27 ไม้ทั่วไป · 0.48 ป่าชายเลน"
        >
          <input
            id={`${ids}-r`}
            type="number"
            step="any"
            value={form.rValue ?? ''}
            onChange={(e) => set('rValue', numeric(e.target.value))}
            className={`${FIELD} font-mono tabular-nums`}
          />
        </Field>
        <Field id={`${ids}-cf`} label="ค่า CF (carbon fraction)" hint="เช่น 0.47">
          <input
            id={`${ids}-cf`}
            type="number"
            step="any"
            value={form.cfValue ?? ''}
            onChange={(e) => set('cfValue', numeric(e.target.value))}
            className={`${FIELD} font-mono tabular-nums`}
          />
        </Field>
        <Field
          id={`${ids}-group`}
          label="กลุ่มสมการ"
          optional
          hint={`ป้ายอ้างอิงในรายงาน ระบบไม่ได้ใช้คำนวณ — ปกติเลือกให้ตรงกับตระกูลสมการ${
            family ? ` (${family.groupCode})` : ''
          }`}
        >
          <select
            id={`${ids}-group`}
            value={form.equationGroupId ?? ''}
            onChange={(e) => set('equationGroupId', e.target.value)}
            className={FIELD}
          >
            <option value="">—</option>
            {lookups.equationGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.code} · {g.nameEn ?? ''}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${ids}-cat`} label="ประเภทป่า/ไม้" optional>
          <select
            id={`${ids}-cat`}
            value={form.forestCategoryId ?? ''}
            onChange={(e) => set('forestCategoryId', e.target.value)}
            className={FIELD}
          >
            <option value="">—</option>
            {lookups.forestCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameTh}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id={`${ids}-growth`}
        label="กลุ่มอัตราการเติบโต (ΔDBH / ΔH)"
        optional
        hint="ใช้กับค่าพยากรณ์ 10 ปีเท่านั้น ไม่กระทบคาร์บอนของต้นไม้ที่วัดจริง — เว้นว่างได้ถ้ายังไม่มีข้อมูล"
      >
        <select
          id={`${ids}-growth`}
          value={form.growthIncrementGroupId ?? ''}
          onChange={(e) => set('growthIncrementGroupId', e.target.value)}
          className={FIELD}
        >
          <option value="">— ยังไม่กำหนด (พยากรณ์ไม่ได้)</option>
          {lookups.growthIncrementGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nameTh} · {g.dbhCmPerYear} ซม./ปี · {g.heightMPerYear} ม./ปี
              {g.isPublished ? '' : ' (ค่าสมมติ)'}
            </option>
          ))}
        </select>
      </Field>

      {growth?.note && (
        <p className="-mt-2 text-[11px] leading-relaxed text-warning">{growth.note}</p>
      )}

      <Field id={`${ids}-ref`} label="อ้างอิง T-VER" optional>
        <input
          id={`${ids}-ref`}
          value={form.tverReference ?? ''}
          onChange={(e) => set('tverReference', e.target.value)}
          className={FIELD}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-action px-4 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:opacity-50"
        >
          {pending ? 'กำลังบันทึก…' : 'บันทึก'}
        </button>
      </div>
    </form>
  )
}

/**
 * What the chosen family measures, and the columns it will set.
 *
 * A statement, not checkboxes: these follow from the equation, and a form that
 * let you disagree with them would only produce rows that contradict their own
 * maths.
 */
function FamilyNote({ family }: { family: EquationFamily }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" strokeWidth={1.9} />
      <div className="min-w-0 text-[12px] leading-relaxed text-ink-secondary">
        <p className="font-medium text-ink">{family.summaryTh}</p>
        <p className="mt-1">
          ระบบจะตั้งให้เอง — วัดความสูง: {family.requiresHeight ? 'ใช่' : 'ไม่'} · วัดโคนต้น (D₀):{' '}
          {family.useD0NotDbh ? 'ใช่' : 'ไม่'} · จุดวัด:{' '}
          <span className="font-mono">{family.measurementPointCode}</span>
        </p>
        <p className="mt-1 text-ink-muted">{family.reference}</p>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  optional,
  children,
}: {
  id: string
  label: string
  hint?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink">
        {label}
        {optional && (
          <span className="ml-1 text-[11px] font-normal text-ink-muted">(ไม่บังคับ)</span>
        )}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">{hint}</p>}
    </div>
  )
}
