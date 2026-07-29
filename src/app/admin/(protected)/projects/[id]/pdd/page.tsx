import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchPdd } from '@/features/pdd/services/fetchPdd'
import { fetchProject } from '@/features/projects/services/fetchProjects'
import { canSubmitPdd, canWritePdd, canWriteProjects } from '@/features/projects/permissions'
import { PddWizard } from '@/features/pdd/components/PddWizard'
import { PddStart } from '@/features/pdd/components/PddStart'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'PDD Wizard — FarmFlow Admin',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'ฉบับร่าง',
  in_review: 'อยู่ระหว่างทบทวน',
  submitted: 'ส่งแล้ว',
  registered: 'ขึ้นทะเบียนแล้ว',
}

export default async function PddWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [pdd, admin] = await Promise.all([fetchPdd(id), getAdminSession()])

  // Without a document there is nothing to name the page after, so fall back to
  // the project itself — and 404 only if the project is genuinely gone.
  const project = pdd?.project ?? (await fetchProject(id))
  if (!project) notFound()
  const title = `${project.nameTh} · ${project.projectCode}`

  // The wizard needs both codes, and used to check only the second: steps 2–8
  // save through `pdd:write`, while step 1 and step 7's scale band write to the
  // project itself under `projects:write`. Holding one without the other gave
  // an editable form whose saves 403'd, so gate on the pair.
  const canWrite = admin ? canWritePdd(admin) && canWriteProjects(admin) : false
  const canSubmit = admin ? canSubmitPdd(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <Link
        href={`/admin/projects/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-secondary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        กลับไปหน้าโครงการ
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2.5 text-[28px] font-semibold leading-tight tracking-tight text-ink">
            <FileText className="h-6 w-6 text-primary" strokeWidth={1.75} />
            PDD Wizard
          </h1>
          {pdd && (
            <Badge variant={pdd.status === 'draft' ? 'neutral' : 'verified'} dot>
              {STATUS_LABELS[pdd.status] ?? pdd.status}
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-sm text-ink-secondary">
          {title} — เอกสารข้อเสนอโครงการตามฟอร์ม อบก. (T-VER-S-F001-PDD)
        </p>
      </header>

      {pdd ? (
        <PddWizard initial={pdd} canWrite={canWrite} canSubmit={canSubmit} />
      ) : (
        <PddStart projectId={id} canWrite={canWrite} />
      )}
    </div>
  )
}
