import type { Metadata } from 'next'
import { getAdminSession } from '@/features/auth/services/adminSession'
import {
  fetchProjects,
  fetchProjectLookups,
} from '@/features/projects/services/fetchProjects'
import { canDeleteProjects, canWriteProjects } from '@/features/projects/permissions'
import { ProjectManager } from '@/features/projects/components/ProjectManager'

export const metadata: Metadata = {
  title: 'Projects — FarmFlow Admin',
}

export default async function ProjectsPage() {
  const [projects, lookups, admin] = await Promise.all([
    fetchProjects(),
    fetchProjectLookups(),
    getAdminSession(),
  ])

  // The protected layout already guarantees a session; this is a type guard.
  const canWrite = admin ? canWriteProjects(admin) : false
  const canDelete = admin ? canDeleteProjects(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Projects
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          โครงการ T-VER — หน่วยที่ อบก. รับรอง ฟาร์มเข้าร่วมได้ครั้งละหนึ่งโครงการ
        </p>
      </header>

      <ProjectManager
        initialItems={projects}
        verifierOrgs={lookups.verifierOrgs}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </div>
  )
}
