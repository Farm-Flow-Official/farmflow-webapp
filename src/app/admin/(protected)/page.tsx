import type { Metadata } from 'next'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { signOutAdmin } from '@/features/auth/actions/signOutAdmin'

export const metadata: Metadata = {
  title: 'แดชบอร์ด — FarmFlow Admin',
}

export default async function AdminDashboardPage() {
  // The (protected) layout already guarantees a session; this read is memoised.
  const admin = await getAdminSession()
  if (!admin) return null

  return (
    <main className="min-h-screen bg-[#F7F8F9]">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between border-b border-[#E4E7EB] bg-white px-8 py-4">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 3C16 3 5 10 5 19C5 24.5 9.5 29 16 29C22.5 29 27 24.5 27 19C27 10 16 3 16 3Z"
              fill="#004C22"
              fillOpacity="0.12"
              stroke="#004C22"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M16 29V15M16 15C16 15 20.5 17.5 23 22"
              stroke="#004C22"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-[#004C22]">
            FarmFlow
          </span>
          <span className="ml-1 text-xs text-[#9CA3AF]">Admin Dashboard</span>
        </div>

        <form action={signOutAdmin}>
          <button
            type="submit"
            className="rounded-md border border-[#E4E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
          >
            ออกจากระบบ
          </button>
        </form>
      </header>

      {/* ── Body ── */}
      <section className="mx-auto max-w-[880px] px-8 py-10">
        <h1 className="text-xl font-semibold text-[#111827]">
          ยินดีต้อนรับ, {admin.username}
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          เข้าสู่ระบบสำเร็จ — นี่คือหน้าแดชบอร์ดชั่วคราวสำหรับยืนยันการล็อกอิน
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E4E7EB] bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              Admin ID
            </p>
            <p className="mt-1.5 break-all font-mono text-sm text-[#111827]">
              {admin.id}
            </p>
          </div>

          <div className="rounded-xl border border-[#E4E7EB] bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              Role ID
            </p>
            <p className="mt-1.5 break-all font-mono text-sm text-[#111827]">
              {admin.roleId}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#E4E7EB] bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Permissions ({admin.permissions.length})
          </p>
          {admin.permissions.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {admin.permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded-md bg-[#004C22]/8 px-2.5 py-1 font-mono text-xs text-[#004C22]"
                >
                  {perm}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-[#9CA3AF]">— ไม่มีสิทธิ์ที่กำหนด —</p>
          )}
        </div>
      </section>
    </main>
  )
}
