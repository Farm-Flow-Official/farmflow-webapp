'use client'

import { useState, useTransition } from 'react'
import { Check, Copy, KeyRound, Loader2, ShieldAlert } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { PasswordInput } from '@/components/ui/password-input'
import { updateFarmerCredentials } from '@/features/farmers/actions/credentialActions'

/**
 * Repair a farmer's login (support desk).
 *
 * There is no self-service reset in the app — most farmer accounts have no
 * verified email — so a forgotten password arrives as a phone call. The two
 * things that call needs are a new password the admin can read aloud, and the
 * ability to correct a username that was typed wrong at registration.
 *
 * Deleting and recreating the account would also "fix" the login, and would
 * take every farm, session and issued credit with it. So this edits in place,
 * and there is deliberately no delete here.
 */
export function FarmerCredentialsDialog({
  farmerId,
  currentUsername,
  hasPassword,
  onClose,
}: {
  farmerId: string
  currentUsername: string
  hasPassword: boolean
  onClose: () => void
}) {
  const [username, setUsername] = useState(currentUsername)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<{ username: string; password: string | null } | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  const usernameChanged = username.trim() !== currentUsername

  function submit(mode: 'set' | 'generate') {
    setError(null)
    startTransition(async () => {
      const res = await updateFarmerCredentials(farmerId, {
        username: usernameChanged ? username.trim() : undefined,
        password: mode === 'set' ? password || undefined : undefined,
        generatePassword: mode === 'generate',
      })
      if (!res.ok) return setError(res.error)
      setIssued({ username: res.username, password: res.password })
    })
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Second screen: the credentials, shown once.
  if (issued) {
    return (
      <Modal onClose={onClose} closeOnBackdrop={false} panelClassName="w-full max-w-md p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          <Check className="h-4.5 w-4.5 text-success" strokeWidth={2} />
          แก้ไขบัญชีเรียบร้อย
        </h2>

        <dl className="mt-4 flex flex-col gap-3">
          <div>
            <dt className="text-xs text-ink-muted">ชื่อผู้ใช้</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-ink">{issued.username}</dd>
          </div>

          {issued.password && (
            <div>
              <dt className="text-xs text-ink-muted">รหัสผ่านใหม่</dt>
              <dd className="mt-0.5 flex items-center gap-2">
                <span className="flex-1 break-all rounded-lg bg-surface px-3 py-2 font-mono text-sm font-semibold text-ink">
                  {issued.password}
                </span>
                <button
                  type="button"
                  onClick={() => copy(issued.password!)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-success" strokeWidth={2} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </dd>
            </div>
          )}
        </dl>

        {issued.password && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-warning-border bg-warning-bg px-3 py-2.5 text-[12px] leading-relaxed text-warning">
            <ShieldAlert className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            รหัสนี้แสดงครั้งเดียว — คัดลอกส่งให้เกษตรกรก่อนปิดหน้าต่าง ปิดแล้วดูซ้ำไม่ได้
            ต้องตั้งใหม่ · ระบบไม่ได้เก็บรหัสนี้ไว้ที่ไหน
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          ปิด
        </button>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose} closeOnBackdrop={false} panelClassName="w-full max-w-md p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <KeyRound className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
        แก้ไขบัญชีเกษตรกร
      </h2>
      <p className="mt-1 text-[13px] text-ink-secondary">
        แก้ชื่อผู้ใช้ หรือตั้งรหัสผ่านใหม่ให้เกษตรกรที่เข้าระบบไม่ได้
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-error-border bg-error-bg px-3 py-2 text-[13px] text-error">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor="farmer-username" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
            ชื่อผู้ใช้
          </label>
          <input
            id="farmer-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-line bg-panel px-3 font-mono text-sm text-ink outline-none transition-shadow focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
          {!hasPassword && (
            <p className="mt-1.5 text-[12px] text-ink-muted">
              บัญชีนี้เข้าระบบด้วย Google — ยังไม่มีรหัสผ่าน การตั้งรหัสจะเพิ่มช่องทางเข้าระบบให้
            </p>
          )}
        </div>

        <div>
          <label htmlFor="farmer-password" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
            รหัสผ่านใหม่ <span className="font-normal text-ink-muted">(เว้นว่างได้ถ้าจะให้ระบบสุ่ม)</span>
          </label>
          <PasswordInput
            id="farmer-password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
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
          onClick={() => submit('generate')}
          disabled={pending}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-panel px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          สุ่มรหัสให้
        </button>
        <button
          type="button"
          onClick={() => submit('set')}
          disabled={pending || (!usernameChanged && !password)}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          บันทึก
        </button>
      </div>
    </Modal>
  )
}
