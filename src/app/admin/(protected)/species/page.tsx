import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { ApiFailurePanel } from '@/components/ui/api-failure'
import { describeApiFailure } from '@/lib/api/describe-failure'
import { canManageSpecies } from '@/features/species/permissions'
import { fetchSpecies, fetchSpeciesLookups } from '@/features/species/services/fetchSpecies'
import { SpeciesManager } from '@/features/species/components/SpeciesManager'

export const metadata: Metadata = {
  title: 'ชนิดพันธุ์ไม้ — FarmFlow Admin',
}

export default async function SpeciesPage() {
  const admin = await getAdminSession()

  let species
  let lookups
  try {
    // Only the reads sit in the try — building JSX inside one would put the
    // render outside the catch's reach.
    ;[species, lookups] = await Promise.all([fetchSpecies(), fetchSpeciesLookups()])
  } catch (err) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <Header />
        <ApiFailurePanel {...describeApiFailure(err, 'รายการชนิดพันธุ์ไม้')} />
      </div>
    )
  }

  // The protected layout already guarantees a session; this is a type guard.
  const canWrite = admin ? canManageSpecies(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <Header />
      {!canWrite && (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-secondary">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.9} />
          บัญชีนี้ดูได้อย่างเดียว — การแก้ค่าสมการต้องใช้สิทธิ์ระดับผู้ดูแลสูงสุด
        </p>
      )}
      <SpeciesManager species={species} lookups={lookups} canWrite={canWrite} />
    </div>
  )
}

function Header() {
  return (
    <header className="mb-6">
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
        ชนิดพันธุ์ไม้และสมการคาร์บอน
      </h1>
      <p className="mt-1.5 text-sm text-ink-secondary">
        ชนิดที่เกษตรกรเลือกได้ตอนบันทึกข้อมูลการเพาะปลูก และสมการที่ใช้คำนวณคาร์บอนของแต่ละชนิด
      </p>
    </header>
  )
}
