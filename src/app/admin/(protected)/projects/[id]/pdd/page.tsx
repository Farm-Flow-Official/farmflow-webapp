import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, FileText } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchPdd } from '@/features/pdd/services/fetchPdd'
import { canWriteProjects } from '@/features/projects/permissions'
import { PddWizard } from '@/features/pdd/components/PddWizard'
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

  if (!pdd) notFound()

  // The wizard writes to the project as well as the document (step 1 lives on
  // `projects`), so it is the project write permission that gates editing.
  const canWrite = admin ? canWriteProjects(admin) : false

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
          <Badge variant={pdd.status === 'draft' ? 'neutral' : 'verified'} dot>
            {STATUS_LABELS[pdd.status] ?? pdd.status}
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-ink-secondary">
          {pdd.project.nameTh} · {pdd.project.projectCode} — เอกสารข้อเสนอโครงการตามฟอร์ม อบก.
          (T-VER-S-F001-PDD)
        </p>
      </header>

      <PddWizard initial={pdd} canWrite={canWrite} />
    </div>
  )
}
