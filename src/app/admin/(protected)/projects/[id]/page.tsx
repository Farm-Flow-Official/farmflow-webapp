import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, FileText } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchProject, fetchProjectLookups } from '@/features/projects/services/fetchProjects'
import { canWriteProjects } from '@/features/projects/permissions'
import { ProjectWorkspace } from '@/features/projects/components/ProjectWorkspace'
import { Badge } from '@/components/ui/badge'
import {
  IMPLEMENTATION_MODE_LABELS,
  PROJECT_SCALE_LABELS,
  PROJECT_STATUS_LABELS,
} from '@/features/projects/types'

export const metadata: Metadata = {
  title: 'Project — FarmFlow Admin',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, lookups, admin] = await Promise.all([
    fetchProject(id),
    fetchProjectLookups(),
    getAdminSession(),
  ])

  if (!project) notFound()

  const canWrite = admin ? canWriteProjects(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <Link
        href="/admin/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-secondary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        กลับไปรายการโครงการ
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
              {project.nameTh}
            </h1>
            <Badge variant={project.status === 'active' ? 'verified' : 'neutral'} dot>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-ink-secondary">
            {project.projectCode}
            {project.nameEn ? ` · ${project.nameEn}` : ''}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/admin/projects/${id}/pdd`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            เปิด PDD Wizard
          </Link>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <Meta label="รูปแบบ" value={IMPLEMENTATION_MODE_LABELS[project.implementationMode]} />
          <Meta label="ขนาดโครงการ" value={PROJECT_SCALE_LABELS[project.projectScale]} />
          <Meta
            label="ระยะเวลาคิดเครดิต"
            value={project.creditingPeriodYears ? `${project.creditingPeriodYears} ปี` : '—'}
          />
          <Meta label="หน่วยตรวจสอบ" value={project.verifierOrgName ?? 'ยังไม่มอบหมาย'} />
        </dl>
      </header>

      <ProjectWorkspace project={project} lookups={lookups} canWrite={canWrite} />
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  )
}
