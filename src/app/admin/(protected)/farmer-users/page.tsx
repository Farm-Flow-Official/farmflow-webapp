import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchFarmers } from '@/features/farmers/services/fetchFarmers'
import { FarmerUsersTable } from '@/features/farmers/components/FarmerUsersTable'

export const metadata: Metadata = {
  title: 'บัญชีเกษตรกร — FarmFlow Admin',
}

/**
 * Account administration for farmers.
 *
 * Separate from the Farmers list on purpose: that page is about land and
 * carbon, this one is about logins. They are different jobs, done by different
 * people, at different moments — the second one usually with a farmer on the
 * phone who cannot get in.
 */
export default async function FarmerUsersPage() {
  const admin = await getAdminSession()
  const canManage = admin?.permissions.includes('farmers:manage') ?? false

  if (!canManage) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <Header />
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-panel py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="text-[13px] text-ink-muted">
            ต้องมีสิทธิ์จัดการเกษตรกรจึงจะแก้ไขบัญชีได้
          </p>
        </div>
      </div>
    )
  }

  const farmers = await fetchFarmers()

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <Header />
      <FarmerUsersTable farmers={farmers} />
    </div>
  )
}

function Header() {
  return (
    <header className="mb-6">
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
        บัญชีเกษตรกร
      </h1>
      <p className="mt-1.5 text-sm text-ink-secondary">
        แก้ชื่อผู้ใช้ ตั้งรหัสผ่านใหม่ และระงับ/ปลดระงับบัญชี — แก้ไขในบัญชีเดิมเสมอ
        ไม่มีการลบ เพราะบัญชีถือครองแปลง รอบตรวจ และเครดิตที่ออกไปแล้ว
      </p>
    </header>
  )
}
