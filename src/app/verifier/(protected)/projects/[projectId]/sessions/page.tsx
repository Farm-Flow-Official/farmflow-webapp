import type { Metadata } from 'next'
import { Boxes } from 'lucide-react'
import { notFound } from 'next/navigation'
import { fetchSessions } from '@/features/verifier/services/fetchSessions'
import { findVerifierProject } from '@/features/verifier/services/fetchVerifierProjects'
import { SessionQueueTable } from '@/features/verifier/components/SessionQueueTable'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata: Metadata = {
  title: 'Session Queue — FarmFlow Verifier',
}

export default async function SessionQueuePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const [sessions, project] = await Promise.all([
    fetchSessions(projectId),
    findVerifierProject(projectId),
  ])

  // A project outside this verifier's accrediting body is simply not there.
  if (!project) notFound()

  const pending = sessions.filter((s) => s.status === 'Pending').length
  const approved = sessions.filter((s) => s.status === 'Approved').length
  const flagged = sessions.filter((s) => s.anomalyFlag && s.status === 'Pending').length

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Session Queue
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          โครงการ <span className="font-medium text-ink">{project.projectName}</span>
        </p>
      </header>

      {/*
        VERIFIER-SESS-02 — the three numbers that decide what to do next, stated
        rather than buried in a sentence. "ผิดปกติ" counts only pending sessions:
        an anomaly already ruled on is not outstanding work.
      */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QueueStat label="รอตรวจ" value={pending} tone="pending" />
        <QueueStat label="อนุมัติแล้ว" value={approved} tone="approved" />
        <QueueStat label="ผิดปกติ (รอตรวจ)" value={flagged} tone="flagged" />
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="ยังไม่มี session รอตรวจ"
          description="ชุดข้อมูล (assessment session) จะปรากฏที่นี่เมื่อเกษตรกรส่งข้อมูลคาร์บอนเข้ามาให้ตรวจรับรอง"
        />
      ) : (
        <SessionQueueTable sessions={sessions} />
      )}
    </div>
  )
}

const STAT_TONES = {
  pending: { value: 'text-ink', accent: 'bg-warning' },
  approved: { value: 'text-success', accent: 'bg-success' },
  flagged: { value: 'text-error', accent: 'bg-error' },
} as const

function QueueStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: keyof typeof STAT_TONES
}) {
  const t = STAT_TONES[tone]
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-panel p-4 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1 ${t.accent}`} aria-hidden />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${t.value}`}>{value}</p>
    </div>
  )
}
