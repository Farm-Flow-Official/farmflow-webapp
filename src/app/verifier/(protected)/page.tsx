import type { Metadata } from 'next'
import Link from 'next/link'
import { Boxes, FolderTree, MapPinned, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import {
  fetchVerifierProjects,
  type VerifierProject,
} from '@/features/verifier/services/fetchVerifierProjects'

export const metadata: Metadata = {
  title: 'เลือกโครงการ — FarmFlow Verifier',
}

/**
 * The portal's landing page: pick the project to review before anything else.
 *
 * The queue is scoped to a project from here on, so every later screen can state
 * plainly which project's work is on screen — a verifier must never approve a
 * batch while unsure which project it belongs to.
 */
export default async function VerifierProjectPickerPage() {
  const projects = await fetchVerifierProjects()
  const totalPending = projects.reduce((sum, p) => sum + p.pendingCount, 0)

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          เลือกโครงการที่จะตรวจสอบ
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          {projects.length > 0
            ? `${projects.length} โครงการในความรับผิดชอบ · รอตรวจรวม ${totalPending} batch`
            : 'ยังไม่มีงานตรวจในความรับผิดชอบของคุณ'}
        </p>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="ยังไม่มีโครงการให้ตรวจ"
          description="เมื่อเกษตรกรส่งข้อมูลการประเมินเข้ามา โครงการนั้นจะปรากฏที่นี่"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: VerifierProject }) {
  // The unassigned bucket is not a project — it has no code, and its own icon
  // keeps it visually distinct from real projects in the same grid.
  const isBucket = project.id === 'unassigned'
  const Icon = isBucket ? MapPinned : FolderTree
  const urgent = project.pendingCount > 0

  return (
    <Link
      href={`/verifier/projects/${project.id}/batches`}
      className="group flex h-full flex-col justify-between gap-4 rounded-xl border border-line bg-panel p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isBucket ? 'bg-sunken text-ink-secondary' : 'bg-info-bg text-info'
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{project.projectName}</p>
          <p className="mt-0.5 truncate text-xs text-ink-muted">
            {project.projectCode ?? 'ไม่สังกัดโครงการ'}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-semibold tracking-tight ${
                urgent ? 'text-warning' : 'text-ink'
              }`}
            >
              {project.pendingCount}
            </span>
            <span className="text-xs text-ink-secondary">รอตรวจ</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
            <Boxes className="h-3.5 w-3.5" strokeWidth={1.75} />
            ทั้งหมด {project.totalCount} batch
          </p>
        </div>
        <ChevronRight
          className="h-5 w-5 text-ink-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-ink-secondary"
          strokeWidth={2}
        />
      </div>
    </Link>
  )
}
