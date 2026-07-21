'use client'

import { GuideBookProvider } from '@/components/ui/guide-book'
import { ADMIN_GUIDE_SECTIONS, type AdminGuideSectionId } from '@/features/admin/guide/content'

/** Section that answers "what am I looking at?" for the current route. */
function resolveSection(pathname: string): AdminGuideSectionId {
  if (pathname.startsWith('/admin/farmers')) return 'farmers'
  if (pathname.startsWith('/admin/gis')) return 'gis'
  if (pathname.startsWith('/admin/announcements')) return 'content'
  if (
    pathname.startsWith('/admin/settings') ||
    pathname.startsWith('/admin/audit-log') ||
    pathname.startsWith('/admin/admin-users')
  ) {
    return 'system'
  }
  return 'overview'
}

/** Admin portal guide — content only; the drawer lives in `ui/guide-book`. */
export function AdminGuideProvider({ children }: { children: React.ReactNode }) {
  return (
    <GuideBookProvider
      sections={ADMIN_GUIDE_SECTIONS}
      title="คู่มือผู้ดูแลระบบ"
      subtitle="หน้าที่ของแต่ละเมนู ข้อควรระวัง และคีย์ลัด"
      resolveSection={resolveSection}
      shortcutsSectionId="shortcuts"
    >
      {children}
    </GuideBookProvider>
  )
}
