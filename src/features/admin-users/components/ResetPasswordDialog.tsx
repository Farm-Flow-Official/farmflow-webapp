'use client'

import { useId, useState, useTransition } from 'react'
import { KeyRound, Loader2, Shuffle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { PasswordInput } from '@/components/ui/password-input'

/**
 * Set an admin's password — typed, or generated.
 *
 * The reset used to generate one and nothing else. A generated password is
 * sixteen characters of mixed case with symbols in it, which is fine when it is
 * copied to a clipboard and terrible when it is read down a phone line or
 * retyped on a Thai layout where `!#*` are a shift and a layout switch away.
 * Someone who mistypes it twice concludes the reset did not work.
 *
 * So typing one is the default path and generating stays available. Whichever
 * is used, the account is asked to change it at next sign-in, so a password
 * chosen for ease of transcription does not have to last.
 */
export function ResetPasswordDialog({
  username,
  onSubmit,
  onClose,
}: {
  username: string
  /** Resolves once the reset has been attempted; `undefined` means "generate". */
  onSubmit: (password: string | undefined) => Promise<void>
  onClose: () => void
}) {
  const titleId = useId()
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [pending, startTransition] = useTransition()

  const tooShort = password.length > 0 && password.length < 8
  const error = touched && tooShort ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : null

  function run(value: string | undefined) {
    setTouched(true)
    if (value !== undefined && value.length < 8) return
    startTransition(async () => {
      await onSubmit(value)
    })
  }

  return (
    <Modal onClose={onClose} labelledBy={titleId} closeOnBackdrop={false} panelClassName="w-full max-w-md p-6">
      <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold text-ink">
        <KeyRound className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
        ตั้งรหัสผ่านใหม่
      </h2>
      <p className="mt-1 text-[13px] text-ink-secondary">
        บัญชี <span className="font-mono font-medium text-ink">{username}</span> ·
        เจ้าตัวจะถูกขอให้เปลี่ยนรหัสเองตอนเข้าระบบครั้งถัดไป
      </p>

      <div className="mt-4">
        <label htmlFor="new-admin-password" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
          รหัสผ่านใหม่
        </label>
        <PasswordInput
          id="new-admin-password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-error">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 flex-1 rounded-lg border border-line bg-panel px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={() => run(undefined)}
          disabled={pending}
          title="ให้ระบบสุ่มรหัสให้ แล้วแสดงครั้งเดียวเพื่อคัดลอก"
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-panel px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Shuffle className="h-4 w-4" strokeWidth={1.9} />
          )}
          สุ่มให้
        </button>
        <button
          type="button"
          onClick={() => run(password)}
          disabled={pending || password.length === 0}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          ใช้รหัสนี้
        </button>
      </div>
    </Modal>
  )
}
