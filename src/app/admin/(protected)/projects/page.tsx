import type { Metadata } from 'next'
import { getAdminSession } from '@/features/auth/services/adminSession'
import {
  fetchProjects,
  fetchProjectLookups,
  type ProjectLookups,
} from '@/features/projects/services/fetchProjects'
import type { ProjectListItem } from '@/features/projects/types'
import { canDeleteProjects, canWriteProjects } from '@/features/projects/permissions'
import { ProjectManager } from '@/features/projects/components/ProjectManager'
import { ApiFailurePanel } from '@/components/ui/api-failure'
import { describeApiFailure } from '@/lib/api/describe-failure'

export const metadata: Metadata = {
  title: 'Projects — FarmFlow Admin',
}

export default async function ProjectsPage() {
  const admin = await getAdminSession()

  // Read inside a try so the page can say *why* it is empty. Letting the
  // `ApiError` escape gave Next's blank error page, whose message production
  // redacts — which is how a webapp deployed ahead of its API read on screen as
  // "something is wrong with the data".
  let data: { projects: ProjectListItem[]; verifierOrgs: ProjectLookups['verifierOrgs'] }
  try {
    const [projects, lookups] = await Promise.all([fetchProjects(), fetchProjectLookups()])
    data = { projects, verifierOrgs: lookups.verifierOrgs }
  } catch (err) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <Header />
        <ApiFailurePanel {...describeApiFailure(err, 'รายการโครงการ')} />
      </div>
    )
  }

  // The protected layout already guarantees a session; this is a type guard.
  const canWrite = admin ? canWriteProjects(admin) : false
  const canDelete = admin ? canDeleteProjects(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <Header />
      <ProjectManager
        initialItems={data.projects}
        verifierOrgs={data.verifierOrgs}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </div>
  )
}

function Header() {
  return (
    <header className="mb-6">
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">Projects</h1>
      <p className="mt-1.5 text-sm text-ink-secondary">
        โครงการ T-VER — หน่วยที่ อบก. รับรอง ฟาร์มเข้าร่วมได้ครั้งละหนึ่งโครงการ
      </p>
    </header>
  )
}
