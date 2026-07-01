import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchFarmGeo } from '@/features/gis/services/fetchFarmGeo'
import { canViewGis } from '@/features/gis/permissions'
import { GisExplorer } from '@/features/gis/components/GisExplorer'

export const metadata: Metadata = {
  title: 'GIS Map — FarmFlow Admin',
}

export default async function GisPage() {
  const [farms, admin] = await Promise.all([fetchFarmGeo(), getAdminSession()])
  const canView = admin ? canViewGis(admin) : false

  if (!canView) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-panel py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="text-[13px] text-ink-muted">
            เฉพาะ Verifier และ Super Admin เท่านั้นที่เข้าถึงแผนที่ GIS ได้
          </p>
        </div>
      </div>
    )
  }

  // Full-bleed: GisExplorer owns its own full-height layout (map + panel).
  return <GisExplorer farms={farms} />
}
