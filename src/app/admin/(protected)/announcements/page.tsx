import type { Metadata } from 'next'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchAnnouncements } from '@/features/announcements/services/fetchAnnouncements'
import { canDeleteAnnouncement } from '@/features/announcements/permissions'
import { AnnouncementManager } from '@/features/announcements/components/AnnouncementManager'

export const metadata: Metadata = {
  title: 'Announcements — FarmFlow Admin',
}

export default async function AnnouncementsPage() {
  const [announcements, admin] = await Promise.all([
    fetchAnnouncements(),
    getAdminSession(),
  ])

  // The protected layout already guarantees a session; this is a type guard.
  const canDelete = admin ? canDeleteAnnouncement(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Announcements
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          จัดการประกาศและข่าวสารถึงเกษตรกร
        </p>
      </header>

      <AnnouncementManager initialItems={announcements} canDelete={canDelete} />
    </div>
  )
}
