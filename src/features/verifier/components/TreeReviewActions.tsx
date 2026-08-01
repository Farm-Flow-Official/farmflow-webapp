'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ImageOff, ShieldCheck, TreeDeciduous } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Toast, useToast } from '@/components/ui/toast'
import { confirmTree, rejectTree } from '@/features/verifier/actions/treeActions'

/** Reasons that come up over and over, so the verifier types the exception only. */
const REJECT_PRESETS = [
  'ภาพเบลอ มองไม่เห็นลำต้นชัดเจน',
  'ภาพไม่ใช่ต้นไม้ตามที่ขึ้นทะเบียน',
  'พิกัดอยู่นอกขอบเขตแปลง',
  'วัดเส้นรอบวงไม่ถูกตำแหน่ง (ต้องวัดที่ 1.30 ม.)',
  'ภาพซ้ำกับต้นอื่น',
]

const CONFIRM_PRESETS = [
  'ตรวจแล้วเป็นต้นไม้จริง เงาบังทำให้ AI สับสน',
  'มุมภาพแปลก แต่ข้อมูลการวัดถูกต้อง',
  'พิกัดคลาดเคลื่อนเล็กน้อย ยังอยู่ในแปลง',
]

type Props = {
  sessionId: string
  snapshotId: string
  projectId: string | null
  /** The AI flagged this tree — the case both buttons exist for. */
  flagged: boolean
  rejected: boolean
  confirmed: boolean
  rejectionReason: string | null
  /** The session has been decided; nothing about it can change any more. */
  sessionDecided: boolean
}

/**
 * Rule on one tree without deciding the whole session (VERIFIER-DETAIL-04).
 *
 * Two outcomes, because a flag is a question and a question needs both answers:
 * send the photo back to be retaken, or record that it was checked and is fine.
 * With only the first, a flag a verifier disagreed with stays red forever and
 * the session keeps reading as anomalous after it has been reviewed.
 *
 * Sits directly under the photo rather than beside the AI panel: the verifier
 * has just looked at the picture, and that is the moment they decide. It was
 * originally below the assessment card, where it was easy to miss entirely.
 */
export function TreeReviewActions({
  sessionId,
  snapshotId,
  projectId,
  flagged,
  rejected,
  confirmed,
  rejectionReason,
  sessionDecided,
}: Props) {
  const [dialog, setDialog] = useState<'reject' | 'confirm' | null>(null)
  const { message, showToast } = useToast()
  const router = useRouter()

  const decided = rejected || confirmed

  // A verdict already given is stated rather than re-offered — but it stays
  // changeable while the session is still open. Nothing has been issued yet, and
  // a verifier who clicks the wrong button on photo 40 of 80 should not have to
  // ask an admin to undo it. Once the session is decided the credit exists, and
  // the verdict is frozen with it.
  if (decided) {
    return (
      <>
        <Verdict
          tone={rejected ? 'error' : 'success'}
          icon={
            rejected ? (
              <ImageOff className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={1.9} />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={1.9} />
            )
          }
          title={
            rejected
              ? 'ปฏิเสธต้นนี้แล้ว — แจ้งเกษตรกรให้ถ่ายใหม่'
              : 'ผู้ตรวจรับรองยืนยันแล้วว่าใช้ได้'
          }
          detail={rejectionReason}
          action={
            sessionDecided ? null : (
              <button
                type="button"
                onClick={() => setDialog(rejected ? 'confirm' : 'reject')}
                className="mt-2 text-[12px] font-medium text-ink-secondary underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {rejected ? 'เปลี่ยนเป็น “ใช้ได้”' : 'เปลี่ยนเป็น “ปฏิเสธ”'}
              </button>
            )
          }
        />

        {dialog && (
          <TreeVerdictDialog
            kind={dialog}
            onClose={() => setDialog(null)}
            onDone={(msg) => {
              setDialog(null)
              showToast(msg)
              router.refresh()
            }}
            submit={(text) =>
              dialog === 'reject'
                ? rejectTree(sessionId, snapshotId, text, projectId)
                : confirmTree(sessionId, snapshotId, text, projectId)
            }
          />
        )}

        <Toast message={message} />
      </>
    )
  }

  if (sessionDecided) return null

  return (
    <>
      <div className="rounded-xl border border-line bg-panel p-3.5 shadow-sm">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          ตัดสินต้นนี้
        </p>

        {flagged && (
          <p className="mb-2.5 text-[12px] leading-relaxed text-ink-secondary">
            AI ติดธงต้นนี้ไว้ — ถ้าตรวจแล้วใช้ได้ กด{' '}
            <span className="font-medium text-success">ยืนยันว่าใช้ได้</span> เพื่อปลดธง
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDialog('confirm')}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-success/40 bg-success-bg px-3 py-2.5 text-[13px] font-semibold text-success transition-colors hover:bg-success hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            ยืนยันว่าใช้ได้
          </button>
          <button
            type="button"
            onClick={() => setDialog('reject')}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-error-border bg-error-bg px-3 py-2.5 text-[13px] font-semibold text-error transition-colors hover:bg-error hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
          >
            <ImageOff className="h-4 w-4" strokeWidth={2} />
            ปฏิเสธต้นนี้
          </button>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
          ทั้งสองอย่างมีผลกับ<span className="font-medium text-ink-secondary">ต้นนี้ต้นเดียว</span> —
          ต้นอื่นและ session ไม่ได้รับผลกระทบ
        </p>
      </div>

      {dialog && (
        <TreeVerdictDialog
          kind={dialog}
          onClose={() => setDialog(null)}
          onDone={(msg) => {
            setDialog(null)
            showToast(msg)
            router.refresh()
          }}
          submit={(text) =>
            dialog === 'reject'
              ? rejectTree(sessionId, snapshotId, text, projectId)
              : confirmTree(sessionId, snapshotId, text, projectId)
          }
        />
      )}

      <Toast message={message} />
    </>
  )
}

function Verdict({
  tone,
  icon,
  title,
  detail,
  action,
}: {
  tone: 'error' | 'success'
  icon: React.ReactNode
  title: string
  detail: string | null
  action?: React.ReactNode
}) {
  const border = tone === 'error' ? 'border-error-border bg-error-bg' : 'border-success/30 bg-success-bg'
  const text = tone === 'error' ? 'text-error' : 'text-success'
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 ${border}`}>
      {icon}
      <div className="min-w-0">
        <p className={`text-[13px] font-semibold ${text}`}>{title}</p>
        {detail && (
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">{detail}</p>
        )}
        {action}
      </div>
    </div>
  )
}

/**
 * One dialog for both verdicts.
 *
 * They differ only in wording and in whether the note is required — rejection
 * text goes to the farmer as an instruction, so it cannot be blank; a
 * confirmation note is a record for the next reviewer, so it can be.
 */
function TreeVerdictDialog({
  kind,
  submit,
  onClose,
  onDone,
}: {
  kind: 'reject' | 'confirm'
  submit: (text: string) => Promise<{ ok: boolean; error?: string }>
  onClose: () => void
  onDone: (message: string) => void
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  const titleId = useId()

  const isReject = kind === 'reject'
  const presets = isReject ? REJECT_PRESETS : CONFIRM_PRESETS

  function run() {
    startTransition(async () => {
      const res = await submit(text)
      if (!res.ok) {
        setError(res.error)
        return
      }
      onDone(
        isReject
          ? 'ปฏิเสธต้นนี้แล้ว · แจ้งเกษตรกรให้ถ่ายใหม่'
          : 'ยืนยันแล้วว่าต้นนี้ใช้ได้ · ปลดธงเตือนออก',
      )
    })
  }

  return (
    <Modal
      onClose={() => !pending && onClose()}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="w-full max-w-lg p-6"
    >
      <div className="mb-1 flex items-center gap-2">
        {isReject ? (
          <TreeDeciduous className="h-4 w-4 text-error" strokeWidth={2} />
        ) : (
          <ShieldCheck className="h-4 w-4 text-success" strokeWidth={2} />
        )}
        <h2 id={titleId} className="text-base font-semibold text-ink">
          {isReject ? 'ปฏิเสธต้นไม้ต้นนี้' : 'ยืนยันว่าต้นนี้ใช้ได้'}
        </h2>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-secondary">
        {isReject ? (
          <>
            เกษตรกรจะได้รับแจ้งให้ถ่ายภาพต้นนี้ใหม่ —{' '}
            <span className="font-medium text-ink">ต้นอื่นในชุดนี้ไม่ได้รับผลกระทบ</span>{' '}
            และ session ยังอยู่ในคิวให้ตรวจต่อได้
          </>
        ) : (
          <>
            ปลดธงเตือนของต้นนี้ และ<span className="font-medium text-ink">คงค่าคาร์บอนที่ AI คำนวณไว้</span> —
            ไม่แจ้งเกษตรกร เพราะไม่มีอะไรให้เขาต้องแก้
          </>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setText(p)}
            disabled={pending}
            className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <label htmlFor="tree-verdict-note" className="mt-3 block text-[13px] font-medium text-ink">
        {isReject ? 'เหตุผล' : 'บันทึกเหตุผล (ไม่บังคับ)'}{' '}
        {isReject && <span className="text-error">*</span>}
      </label>
      <textarea
        id="tree-verdict-note"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run()
        }}
        rows={3}
        disabled={pending}
        placeholder={
          isReject ? 'เกษตรกรจะเห็นข้อความนี้' : 'เช่น ตรวจแล้วเป็นต้นไม้จริง เงาบังทำให้ AI สับสน'
        }
        className="mt-1.5 w-full resize-y rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
      />
      <p className="mt-1 text-[11px] text-ink-muted">
        เลือกข้อความสำเร็จรูปด้านบนแล้วแก้ต่อได้ · พิมพ์เองทั้งหมดก็ได้
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-error-bg px-3 py-2 text-[13px] text-error">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={run}
          disabled={pending || (isReject && text.trim().length === 0)}
          className={`h-9 rounded-lg px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
            isReject
              ? 'bg-error hover:bg-error/90 focus-visible:ring-error'
              : 'bg-success hover:bg-success/90 focus-visible:ring-success'
          }`}
        >
          {pending ? 'กำลังบันทึก…' : isReject ? 'ปฏิเสธต้นนี้' : 'ยืนยันว่าใช้ได้'}
        </button>
      </div>
    </Modal>
  )
}
