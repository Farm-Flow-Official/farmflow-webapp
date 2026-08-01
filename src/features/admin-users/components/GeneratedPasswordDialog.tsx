'use client'

import { useId, useState } from 'react'
import { Check, Copy, KeyRound, TriangleAlert } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

/**
 * Shows a generated password once, and makes the admin acknowledge that.
 *
 * The plaintext exists only in this response — it is hashed on the way into the
 * database and never returned again — so closing this dialog without copying it
 * means resetting the password. The confirm button stays disabled until it has
 * been copied, because "I'll remember it" is how a verifier ends up locked out
 * on their first day.
 */
export function GeneratedPasswordDialog({
  username,
  password,
  onClose,
}: {
  username: string
  password: string
  onClose: () => void
}) {
  const titleId = useId()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
    } catch {
      // Clipboard access can be refused (insecure context, permissions). The
      // password is on screen and selectable, so this is recoverable — just let
      // the admin confirm manually rather than trapping them in the dialog.
      setCopied(true)
    }
  }

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="w-full max-w-md p-6"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <KeyRound className="h-4 w-4" strokeWidth={2} />
        </span>
        <h2 id={titleId} className="text-base font-semibold text-ink">
          รหัสผ่านสำหรับ {username}
        </h2>
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-warning-bg px-3 py-2.5 text-[13px] leading-relaxed text-warning">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
        <span>
          รหัสผ่านนี้จะแสดง<span className="font-semibold">ครั้งเดียว</span> —
          ปิดหน้าต่างนี้แล้วจะดูอีกไม่ได้ ต้องตั้งใหม่เท่านั้น
        </span>
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-surface p-3">
        <code className="flex-1 select-all break-all font-mono text-sm text-ink">{password}</code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.2} />
              คัดลอกแล้ว
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
              คัดลอก
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
        ส่งรหัสนี้ให้เจ้าตัวผ่านช่องทางที่ปลอดภัย —
        ระบบจะบังคับให้เปลี่ยนรหัสผ่านเองตอนเข้าสู่ระบบครั้งแรก
      </p>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={!copied}
          className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? 'เรียบร้อย' : 'กรุณาคัดลอกก่อน'}
        </button>
      </div>
    </Modal>
  )
}
