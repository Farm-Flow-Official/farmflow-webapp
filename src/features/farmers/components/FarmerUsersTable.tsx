'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyRound, Search, ShieldOff, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { formatDateTime } from '@/lib/utils/format'
import { setFarmerStatus } from '@/features/farmers/actions/setFarmerStatus'
import { FarmerCredentialsDialog } from '@/features/farmers/components/FarmerCredentialsDialog'
import { FARMER_USERS_PAGE_SIZE } from '@/features/farmers/types/page-size'
import type { Farmer } from '@/features/farmers/types'

/**
 * Farmer accounts, seen as accounts rather than as people.
 *
 * The farmers list next door answers "who farms what". This one answers the
 * question a support call actually asks: which login is this, does it even have
 * a password, and when did it last work. Everything here is an in-place repair
 * — there is no delete, because a farmer's account owns their farms, sessions
 * and issued credits, and "just make them a new one" quietly destroys all three.
 */
export function FarmerUsersTable({ farmers }: { farmers: Farmer[] }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Farmer | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return farmers
    return farmers.filter(
      (f) =>
        f.username.toLowerCase().includes(needle) || f.fullName.toLowerCase().includes(needle),
    )
  }, [farmers, q])

  const start = (page - 1) * FARMER_USERS_PAGE_SIZE
  const rows = filtered.slice(start, start + FARMER_USERS_PAGE_SIZE)

  function toggleStatus(farmer: Farmer) {
    const next = farmer.accountStatus === 'Active' ? 'Suspended' : 'Active'
    const reason =
      next === 'Suspended'
        ? window.prompt('เหตุผลที่ระงับบัญชี (เกษตรกรจะเห็นข้อความนี้)')?.trim()
        : undefined

    // A suspension with no reason is one the farmer cannot argue with, so the
    // server rejects it too — stopping here just saves the round trip.
    if (next === 'Suspended' && !reason) return

    startTransition(async () => {
      await setFarmerStatus(farmer.id, next, reason)
      router.refresh()
    })
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.75}
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="ค้นหาชื่อผู้ใช้หรือชื่อเกษตรกร"
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
        <p className="text-[13px] text-ink-muted">{filtered.length} บัญชี</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-semibold">ชื่อผู้ใช้</th>
              <th className="px-5 py-3 font-semibold">เกษตรกร</th>
              <th className="px-5 py-3 font-semibold">วิธีเข้าระบบ</th>
              <th className="px-5 py-3 font-semibold">เข้าระบบล่าสุด</th>
              <th className="px-5 py-3 font-semibold">สถานะ</th>
              <th className="px-5 py-3 text-right font-semibold">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <UserRound className="mx-auto h-7 w-7 text-ink-disabled" strokeWidth={1.5} />
                  <p className="mt-2 text-sm text-ink-secondary">ไม่พบบัญชีที่ค้นหา</p>
                </td>
              </tr>
            ) : (
              rows.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-surface">
                  <td className="px-5 py-3 font-mono text-[13px] font-medium text-ink">
                    {f.username}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/farmers/${f.id}`}
                      className="text-ink-secondary underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {f.fullName}
                    </Link>
                    <span className="ml-2 text-[12px] text-ink-muted">{f.farmsCount} แปลง</span>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-ink-secondary">
                    {f.hasPassword ? 'ชื่อผู้ใช้ + รหัสผ่าน' : 'Google เท่านั้น'}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-ink-secondary" suppressHydrationWarning>
                    {f.lastLoginAt ? formatDateTime(f.lastLoginAt) : 'ยังไม่เคยเข้า'}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={f.accountStatus === 'Active' ? 'verified' : 'rejected'}>
                      {f.accountStatus === 'Active' ? 'ใช้งานอยู่' : 'ถูกระงับ'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditing(f)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <KeyRound className="h-3.5 w-3.5" strokeWidth={1.9} />
                        แก้ไขบัญชี
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(f)}
                        disabled={pending}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                      >
                        {f.accountStatus === 'Active' ? (
                          <>
                            <ShieldOff className="h-3.5 w-3.5" strokeWidth={1.9} />
                            ระงับ
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.9} />
                            ปลดระงับ
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={filtered.length}
        pageSize={FARMER_USERS_PAGE_SIZE}
        onPageChange={setPage}
      />

      {editing && (
        <FarmerCredentialsDialog
          farmerId={editing.id}
          currentUsername={editing.username}
          hasPassword={editing.hasPassword}
          onClose={() => {
            setEditing(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
