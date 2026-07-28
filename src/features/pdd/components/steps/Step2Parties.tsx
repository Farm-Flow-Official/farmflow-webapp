'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star, Pencil, Trash2, Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { FieldGroup, TextField, TextAreaField, ReadOnlyField } from '@/features/pdd/components/fields'
import { RepeatableSection } from '@/features/pdd/components/fields/RepeatableSection'
import { StepFrame } from '@/features/pdd/components/steps/StepFrame'
import { useStepAutosave } from '@/features/pdd/hooks/useStepAutosave'
import { addContact, removeContact, saveSection, updateContact } from '@/features/pdd/actions/pddActions'
import { step2Draft, type Step2Values } from '@/features/pdd/schemas'
import type { PddContact } from '@/features/pdd/types'
import type { StepProps } from '@/features/pdd/components/PddWizard'

/**
 * Step 2 — parties and document preparer.
 *
 * The narrative fields autosave into the document's jsonb, but the developer
 * contact blocks are their own records: they hold names, phones and emails, and
 * personal data needs to be erasable field by field rather than buried in a blob.
 */
export function Step2Parties({ pdd, editable, onDirtyChange, onSaved, onError }: StepProps) {
  const saved = (pdd.content?.step2 ?? {}) as Partial<Step2Values>
  const [editingContact, setEditingContact] = useState<PddContact | 'new' | null>(null)

  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Draft),
    mode: 'onBlur',
    defaultValues: {
      developerMain: saved.developerMain ?? '',
      developerCo: saved.developerCo ?? [],
      projectOwner: saved.projectOwner ?? '',
      projectLocationText: saved.projectLocationText ?? '',
      coordsUtmX: saved.coordsUtmX ?? '',
      coordsUtmY: saved.coordsUtmY ?? '',
      preparerName: saved.preparerName ?? '',
      preparerPosition: saved.preparerPosition ?? '',
      preparerOrg: saved.preparerOrg ?? '',
      preparerPhone: saved.preparerPhone ?? '',
    },
  })

  useStepAutosave<Step2Values>({
    form,
    editable,
    onDirtyChange,
    onSaved,
    onError,
    save: (values) => saveSection(pdd.id, 'step2', values as Record<string, unknown>),
  })

  async function handleContactSave(input: Record<string, unknown>) {
    const res =
      editingContact === 'new'
        ? await addContact(pdd.id, input)
        : await updateContact(pdd.id, (editingContact as PddContact).id, input)

    if (res.ok) onSaved(res.data)
    else onError(res.error)
    setEditingContact(null)
  }

  async function handleContactRemove(id: string) {
    const res = await removeContact(pdd.id, id)
    if (res.ok) onSaved(res.data)
    else onError(res.error)
  }

  const complete = Boolean(pdd.sectionProgress?.step2)

  return (
    <FormProvider {...form}>
      <StepFrame
        complete={complete}
        editable={editable}
        onToggleComplete={async (next) => {
          const res = await saveSection(
            pdd.id,
            'step2',
            form.getValues() as Record<string, unknown>,
            next,
          )
          if (res.ok) onSaved(res.data)
          else onError(res.error)
        }}
      >
        <FieldGroup title="2A. ข้อมูลนิติบุคคล / ที่ตั้ง">
          <TextField<Step2Values> name="developerMain" label="ผู้พัฒนาโครงการ (หลัก)" required />

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">ผู้พัฒนาโครงการร่วม</p>
            <RepeatableSection<Step2Values>
              name="developerCo"
              itemLabel={(i) => `ผู้พัฒนาร่วมรายที่ ${i}`}
              addLabel="เพิ่มผู้พัฒนาร่วม"
              emptyHint="ไม่มีผู้พัฒนาร่วม (กรณีดำเนินการแบบเดี่ยว)"
              defaultItem={{ name: '' } as never}
            >
              {(index) => (
                <TextField<Step2Values>
                  name={`developerCo.${index}.name` as never}
                  label="ชื่อหน่วยงาน"
                />
              )}
            </RepeatableSection>
          </div>

          <TextField<Step2Values> name="projectOwner" label="เจ้าของโครงการ" required />
          <TextAreaField<Step2Values>
            name="projectLocationText"
            label="ที่ตั้งโครงการ"
            required
            rows={3}
            hint="ที่ตั้งทั้งหมดของพื้นที่โครงการ"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField<Step2Values>
              name="coordsUtmX"
              label="พิกัด UTM (X)"
              placeholder="เช่น 654321"
            />
            <TextField<Step2Values>
              name="coordsUtmY"
              label="พิกัด UTM (Y)"
              placeholder="เช่น 1543210"
            />
          </div>
        </FieldGroup>

        {/* Contacts are records, not form fields — hence the separate editor. */}
        <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">2B. รายละเอียดผู้พัฒนาโครงการ</h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                ผู้ประสานงานที่ อบก. ติดต่อ — ระบุผู้พัฒนาหลักได้เพียงรายเดียว
              </p>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => setEditingContact('new')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                เพิ่มผู้ติดต่อ
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {pdd.contacts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-5 text-center text-sm text-ink-muted">
                ยังไม่มีผู้ติดต่อ
              </p>
            ) : (
              pdd.contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                      {c.isPrimary && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" strokeWidth={2} />
                      )}
                      <span className="truncate">{c.orgName}</span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {[c.coordinatorName, c.position, c.phone, c.email].filter(Boolean).join(' · ') ||
                        'ยังไม่ระบุผู้ประสานงาน'}
                    </p>
                  </div>
                  {editable && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingContact(c)}
                        aria-label={`แก้ไข ${c.orgName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleContactRemove(c.id)}
                        aria-label={`ลบ ${c.orgName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <FieldGroup title="2C. รายละเอียดการจัดทำเอกสาร">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="เอกสารฉบับที่" value={String(pdd.version)} />
            <ReadOnlyField
              label="วันที่จัดทำแล้วเสร็จ"
              value="—"
              hint="กำหนดอัตโนมัติเมื่อกดส่งเอกสาร"
            />
          </div>
          <TextField<Step2Values> name="preparerName" label="ผู้จัดทำ: ชื่อ-นามสกุล" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField<Step2Values> name="preparerPosition" label="ตำแหน่ง" required />
            <TextField<Step2Values> name="preparerOrg" label="หน่วยงาน" required />
          </div>
          <TextField<Step2Values> name="preparerPhone" label="เบอร์ติดต่อ" required />
        </FieldGroup>
      </StepFrame>

      {editingContact !== null && (
        <ContactForm
          initial={editingContact === 'new' ? null : editingContact}
          onSave={handleContactSave}
          onClose={() => setEditingContact(null)}
        />
      )}
    </FormProvider>
  )
}

/* ── Contact editor ─────────────────────────────────────────────────────── */

function ContactForm({
  initial,
  onSave,
  onClose,
}: {
  initial: PddContact | null
  onSave: (input: Record<string, unknown>) => void
  onClose: () => void
}) {
  const [orgName, setOrgName] = useState(initial?.orgName ?? '')
  const [coordinatorName, setCoordinatorName] = useState(initial?.coordinatorName ?? '')
  const [position, setPosition] = useState(initial?.position ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [fax, setFax] = useState(initial?.fax ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [isPrimary, setIsPrimary] = useState(initial?.isPrimary ?? false)
  const [touched, setTouched] = useState(false)

  const orgError = touched && orgName.trim() === ''
  const field = 'h-10 w-full rounded-lg border bg-panel px-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2'
  const ok = 'border-line focus:border-primary focus:ring-primary/15'
  const bad = 'border-error-border focus:border-error focus:ring-error/15'

  function submit() {
    setTouched(true)
    if (orgName.trim() === '') return
    onSave({
      orgName: orgName.trim(),
      coordinatorName: coordinatorName.trim() || null,
      position: position.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      fax: fax.trim() || null,
      email: email.trim() || null,
      isPrimary,
    })
  }

  return (
    <Modal
      onClose={onClose}
      closeOnBackdrop={false}
      panelClassName="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold text-ink">
          {initial ? 'แก้ไขผู้ติดต่อ' : 'เพิ่มผู้ติดต่อ'}
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          ข้อมูลส่วนบุคคลระดับองค์กร — เก็บแยกจากตัวเอกสารเพื่อให้ลบเฉพาะรายได้
        </p>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <div>
          <label htmlFor="c-org" className="mb-1.5 block text-sm font-medium text-ink">
            ผู้พัฒนาโครงการ <span className="text-error">*</span>
          </label>
          <input
            id="c-org"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            aria-invalid={orgError}
            className={`${field} ${orgError ? bad : ok}`}
          />
          {orgError && <p className="mt-1 text-xs text-error">กรุณากรอกชื่อผู้พัฒนาโครงการ</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-ink">
              ชื่อผู้ประสานงาน
            </label>
            <input id="c-name" value={coordinatorName} onChange={(e) => setCoordinatorName(e.target.value)} className={`${field} ${ok}`} />
          </div>
          <div>
            <label htmlFor="c-pos" className="mb-1.5 block text-sm font-medium text-ink">
              ตำแหน่ง
            </label>
            <input id="c-pos" value={position} onChange={(e) => setPosition(e.target.value)} className={`${field} ${ok}`} />
          </div>
        </div>

        <div>
          <label htmlFor="c-addr" className="mb-1.5 block text-sm font-medium text-ink">
            ที่อยู่
          </label>
          <textarea
            id="c-addr"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full resize-y rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="c-phone" className="mb-1.5 block text-sm font-medium text-ink">โทรศัพท์</label>
            <input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} ${ok}`} />
          </div>
          <div>
            <label htmlFor="c-fax" className="mb-1.5 block text-sm font-medium text-ink">โทรสาร</label>
            <input id="c-fax" value={fax} onChange={(e) => setFax(e.target.value)} className={`${field} ${ok}`} />
          </div>
          <div>
            <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-ink">E-mail</label>
            <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} ${ok}`} />
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">เป็นผู้พัฒนาหลัก</span>
            <span className="text-xs text-ink-muted">
              รายที่ อบก. ติดต่อ — ตั้งใหม่แล้วรายเดิมจะถูกปลดอัตโนมัติ
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isPrimary}
            onClick={() => setIsPrimary((v) => !v)}
            className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isPrimary ? 'bg-primary' : 'bg-ink-disabled'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isPrimary ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {initial ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ติดต่อ'}
        </button>
      </div>
    </Modal>
  )
}
