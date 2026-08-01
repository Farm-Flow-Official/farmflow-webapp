'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2, Loader2 } from 'lucide-react'
import { startPdd } from '@/features/pdd/actions/pddActions'

/**
 * Shown when a project has no PDD yet.
 *
 * Opening the page used to create the document as a side effect of reading it —
 * which meant the print preview could bring one into existence. Starting the
 * declaration is now something the admin does on purpose, from here.
 */
export function PddStart({ projectId, canWrite }: { projectId: string; canWrite: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    if (busy) return
    setBusy(true)
    setError(null)
    const res = await startPdd(projectId)
    if (res.ok) router.refresh()
    else {
      setError(res.error)
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-line bg-panel p-8 text-center shadow-sm">
      <FilePlus2 className="mx-auto h-9 w-9 text-ink-disabled" strokeWidth={1.5} />
      <h2 className="mt-3 text-base font-semibold text-ink">โครงการนี้ยังไม่มีเอกสาร PDD</h2>
      <p className="mx-auto mt-1.5 max-w-lg text-sm text-ink-secondary">
        เอกสารข้อเสนอโครงการ (T-VER-S-F001-PDD) คือสิ่งที่ อบก. ใช้พิจารณาขึ้นทะเบียน
        เมื่อเริ่มแล้วจะบันทึกอัตโนมัติทุกขั้นตอน และแก้ไขได้จนกว่าจะกดส่ง
      </p>

      {canWrite ? (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          {busy ? 'กำลังเริ่ม…' : 'เริ่มเขียนเอกสาร PDD'}
        </button>
      ) : (
        <p className="mt-5 text-sm text-ink-muted">คุณไม่มีสิทธิ์เริ่มเอกสารนี้</p>
      )}

      {error && <p className="mt-3 text-sm text-error">{error}</p>}
    </section>
  )
}
