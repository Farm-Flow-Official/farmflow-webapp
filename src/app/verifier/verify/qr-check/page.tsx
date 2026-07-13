import type { Metadata } from 'next'
import { CircleCheck, CircleX, ShieldCheck, Search } from 'lucide-react'
import { verifySession } from '@/features/verifier/services/verifySession'
import { formatDate } from '@/lib/utils/format'

export const metadata: Metadata = {
  title: 'ตรวจสอบเอกสาร — FarmFlow',
}

export default async function QrCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const sessionId = session_id?.trim() ?? ''
  const result = sessionId ? await verifySession(sessionId) : null
  // The form was submitted (param present) but left blank.
  const emptyError = session_id !== undefined && sessionId === ''

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-[480px]">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="text-xl font-semibold tracking-tight text-primary">FarmFlow</span>
          </div>
          <span className="text-xs text-ink-muted">ตรวจสอบความถูกต้องของเอกสาร</span>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`mb-5 rounded-xl border p-6 shadow-sm ${
              result.valid ? 'border-primary-muted bg-success-bg' : 'border-error-border bg-error-bg'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.valid ? (
                <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-success" strokeWidth={1.9} />
              ) : (
                <CircleX className="mt-0.5 h-6 w-6 shrink-0 text-error" strokeWidth={1.9} />
              )}
              <div className="min-w-0">
                <p className={`text-base font-semibold ${result.valid ? 'text-success' : 'text-error'}`}>
                  {result.valid ? 'เอกสารถูกต้อง' : 'ไม่พบเอกสาร'}
                </p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {result.valid
                    ? 'Session ID นี้มีอยู่ในระบบ FarmFlow'
                    : 'ไม่พบ Session ID นี้ในระบบ หรือเอกสารอาจถูกเพิกถอน'}
                </p>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-ink-muted">Session ID:</dt>
                    <dd className="font-mono text-ink">{result.sessionId}</dd>
                  </div>
                  {result.valid && result.issuedAt && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">ออกเอกสารเมื่อ:</dt>
                      <dd className="text-ink">{formatDate(result.issuedAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Lookup form (GET — works without JS; the QR link uses the same param) */}
        <form method="get" className="rounded-xl border border-line bg-panel p-5 shadow-sm">
          <label htmlFor="session_id" className="mb-1.5 block text-sm font-medium text-ink">
            กรอก Session ID หรือสแกน QR จากเอกสาร
          </label>
          <div className="flex gap-2">
            <input
              id="session_id"
              name="session_id"
              type="text"
              defaultValue={sessionId}
              placeholder="เช่น SES-2026-0034"
              aria-invalid={emptyError}
              className={`h-10 w-full rounded-lg border bg-panel px-3 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted outline-none transition-shadow focus:ring-2 ${
                emptyError
                  ? 'border-error-border focus:border-error focus:ring-error/15'
                  : 'border-line focus:border-primary focus:ring-primary/15'
              }`}
            />
            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Search className="h-4 w-4" strokeWidth={1.9} />
              ตรวจสอบ
            </button>
          </div>
          {emptyError && (
            <p className="mt-1.5 text-xs text-error">กรุณากรอก Session ID</p>
          )}
        </form>

        <p className="mt-5 text-center text-xs text-ink-muted">
          ตรวจสอบเฉพาะความถูกต้องของเอกสาร · ไม่เปิดเผยข้อมูลส่วนบุคคล
        </p>
      </div>
    </main>
  )
}
