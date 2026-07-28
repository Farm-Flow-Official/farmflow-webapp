import type { Metadata } from 'next'
import { Boxes } from 'lucide-react'
import { notFound } from 'next/navigation'
import { fetchBatches } from '@/features/verifier/services/fetchBatches'
import { findVerifierProject } from '@/features/verifier/services/fetchVerifierProjects'
import { BatchQueueTable } from '@/features/verifier/components/BatchQueueTable'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata: Metadata = {
  title: 'Batch Queue — FarmFlow Verifier',
}

export default async function BatchQueuePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const [batches, project] = await Promise.all([
    fetchBatches(projectId),
    findVerifierProject(projectId),
  ])

  // A project outside this verifier's accrediting body is simply not there.
  if (!project) notFound()

  const pending = batches.filter((b) => b.status === 'Pending').length
  const flagged = batches.filter((b) => b.anomalyFlag && b.status === 'Pending').length

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Farm Batch Queue
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          โครงการ <span className="font-medium text-ink">{project.projectName}</span> · รอตรวจ{' '}
          <span className="font-medium text-ink">{pending}</span> batch ·{' '}
          <span className="font-medium text-error">{flagged}</span> รายการผิดปกติ
        </p>
      </header>

      {batches.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="ยังไม่มี batch รอตรวจ"
          description="ชุดข้อมูล (assessment session) จะปรากฏที่นี่เมื่อเกษตรกรส่งข้อมูลคาร์บอนเข้ามาให้ตรวจรับรอง"
        />
      ) : (
        <BatchQueueTable batches={batches} />
      )}
    </div>
  )
}
