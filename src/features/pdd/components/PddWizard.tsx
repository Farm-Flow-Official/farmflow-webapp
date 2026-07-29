'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CircleDot, Lock, Loader2, CloudCheck, TriangleAlert } from 'lucide-react'
import { Toast, useToast } from '@/components/ui/toast'
import {
  WIZARD_STEPS,
  isEditable,
  pddFingerprint,
  type PddDetail,
  type StepId,
} from '@/features/pdd/types'
import { Step1Project } from '@/features/pdd/components/steps/Step1Project'
import { Step2Parties } from '@/features/pdd/components/steps/Step2Parties'
import { Step3Details } from '@/features/pdd/components/steps/Step3Details'
import { Step4Conditions } from '@/features/pdd/components/steps/Step4Conditions'
import { Step5Area } from '@/features/pdd/components/steps/Step5Area'
import { Step6Methodology } from '@/features/pdd/components/steps/Step6Methodology'
import { Step7Calculation } from '@/features/pdd/components/steps/Step7Calculation'
import { Step8Monitoring } from '@/features/pdd/components/steps/Step8Monitoring'
import { ReviewPanel } from '@/features/pdd/components/ReviewPanel'

/** What the wizard shell hands every step. */
export type StepProps = {
  pdd: PddDetail
  editable: boolean
  /** Report a step's save state so the shell can show it and guard navigation. */
  onDirtyChange: (dirty: boolean) => void
  onSaved: (pdd: PddDetail) => void
  onError: (message: string) => void
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const STEP_COMPONENTS: Record<StepId, (props: StepProps) => React.ReactNode> = {
  step1: Step1Project,
  step2: Step2Parties,
  step3: Step3Details,
  step4: Step4Conditions,
  step5: Step5Area,
  step6: Step6Methodology,
  step7: Step7Calculation,
  step8: Step8Monitoring,
}

/**
 * The PDD wizard shell.
 *
 * Navigation is non-linear on purpose: a PDD is revisited over weeks and the
 * author rarely works front to back, so every step is always reachable and no
 * step gates another. Completeness is shown, never enforced — the form is
 * checked at submit, not while it is being written.
 */
export function PddWizard({
  initial,
  canWrite,
  canSubmit,
}: {
  initial: PddDetail
  canWrite: boolean
  canSubmit: boolean
}) {
  const router = useRouter()
  const [pdd, setPdd] = useState(initial)
  const [active, setActive] = useState<StepId>('step1')
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const { message, showToast } = useToast()

  // `router.refresh()` re-renders the server page with a fresh `initial`, but
  // `useState` only ever reads its initializer once — without this the boundary
  // import, the sample-plot editor and a new revision would all write to the
  // server and leave the screen showing the old document.
  // Adjusted during render rather than in an effect — React's documented way to
  // reset state when a prop changes, and it avoids painting the stale document
  // for one frame. The fingerprint is the comparison key because `initial` is a
  // fresh object on every render.
  const incoming = pddFingerprint(initial)
  const [seen, setSeen] = useState(incoming)
  if (incoming !== seen) {
    setSeen(incoming)
    setPdd(initial)
  }

  const editable = canWrite && isEditable(pdd)
  const progress = (pdd.sectionProgress ?? {}) as Record<string, boolean>
  const doneCount = WIZARD_STEPS.filter((s) => progress[s.id]).length

  // Autosave is debounced, so a close/reload can outrun the in-flight save.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current) }, [])

  const handleDirty = useCallback((next: boolean) => {
    setDirty(next)
    if (next) setSaveState('saving')
  }, [])

  const handleSaved = useCallback((next: PddDetail) => {
    setPdd(next)
    setDirty(false)
    setSaveState('saved')
    // Let "saved" linger briefly, then fall quiet — a permanent badge stops
    // meaning anything.
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaveState('idle'), 2500)
  }, [])

  const handleError = useCallback(
    (msg: string) => {
      setSaveState('error')
      showToast(msg)
    },
    [showToast],
  )

  const stepProps: StepProps = useMemo(
    () => ({ pdd, editable, onDirtyChange: handleDirty, onSaved: handleSaved, onError: handleError }),
    [pdd, editable, handleDirty, handleSaved, handleError],
  )

  const ActiveStep = STEP_COMPONENTS[active]

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Stepper */}
      <nav
        aria-label="ขั้นตอนการกรอก PDD"
        className="shrink-0 lg:sticky lg:top-24 lg:w-64"
      >
        <div className="rounded-xl border border-line bg-panel p-3 shadow-sm">
          <div className="px-2 pb-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              ความคืบหน้า
            </p>
            <p className="mt-1 text-sm text-ink">
              <span className="font-semibold">{doneCount}</span>
              <span className="text-ink-secondary"> / {WIZARD_STEPS.length} ขั้นตอน</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${(doneCount / WIZARD_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <ul className="mt-2 flex flex-col gap-0.5">
            {WIZARD_STEPS.map((step) => {
              const done = Boolean(progress[step.id])
              const current = step.id === active
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActive(step.id)}
                    aria-current={current ? 'step' : undefined}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      current ? 'bg-primary-subtle' : 'hover:bg-surface'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        done
                          ? 'bg-success text-white'
                          : current
                            ? 'bg-primary text-white'
                            : 'bg-sunken text-ink-muted'
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : step.number}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-[13px] ${
                          current ? 'font-semibold text-primary' : 'font-medium text-ink'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="block truncate text-[11px] text-ink-muted">
                        {step.formRef}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-3 border-t border-line px-2.5 pt-3 text-[11px] text-ink-muted">
            ข้ามไปกรอกขั้นตอนใดก่อนก็ได้ — ระบบตรวจความครบถ้วนจริงตอนกดส่งเอกสาร
          </p>
        </div>
      </nav>

      {/* Step body */}
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {WIZARD_STEPS.find((s) => s.id === active)?.title}
            </h2>
            <p className="text-xs text-ink-muted">
              เอกสารฉบับที่ {pdd.version} · {WIZARD_STEPS.find((s) => s.id === active)?.formRef}
            </p>
          </div>
          <SaveBadge state={saveState} editable={editable} />
        </div>

        {!editable && (
          <p className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-sunken px-4 py-3 text-sm text-ink-secondary">
            <Lock className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {canWrite
              ? 'เอกสารฉบับนี้ส่งแล้ว จึงล็อกไว้เป็นหลักฐานการยื่น — หากต้องแก้ไข ให้สร้างฉบับใหม่'
              : 'คุณมีสิทธิ์อ่านอย่างเดียว'}
          </p>
        )}

        <ActiveStep {...stepProps} />

        <div className="mt-6">
          <ReviewPanel
            pdd={pdd}
            canWrite={canWrite}
            canSubmit={canSubmit}
            onGoToStep={setActive}
            // Submitting or revising changes which document the page is for, so
            // the server data is refetched rather than patched in place.
            onSubmitted={() => router.refresh()}
          />
        </div>
      </div>

      <Toast message={message} />
    </div>
  )
}

function SaveBadge({ state, editable }: { state: SaveState; editable: boolean }) {
  if (!editable) return null

  const map = {
    idle: null,
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />,
      label: 'กำลังบันทึก…',
      tone: 'text-ink-secondary',
    },
    saved: {
      icon: <CloudCheck className="h-3.5 w-3.5" strokeWidth={2} />,
      label: 'บันทึกแล้ว',
      tone: 'text-success',
    },
    error: {
      icon: <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2} />,
      label: 'บันทึกไม่สำเร็จ',
      tone: 'text-error',
    },
  } as const

  const meta = map[state]
  if (!meta) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
        <CircleDot className="h-3.5 w-3.5" strokeWidth={2} />
        บันทึกอัตโนมัติ
      </span>
    )
  }

  return (
    <span role="status" className={`flex items-center gap-1.5 text-xs font-medium ${meta.tone}`}>
      {meta.icon}
      {meta.label}
    </span>
  )
}
