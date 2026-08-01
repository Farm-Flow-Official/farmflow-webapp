import type { Metadata } from 'next'
import { fetchFarms } from '@/features/farms/services/fetchFarms'
import { FarmQueueTable } from '@/features/farms/components/FarmQueueTable'
import { FARM_PAGE_SIZE } from '@/features/farms/types/page-size'
import type { AdminFarmPage } from '@/features/farms/types'
import { describeApiFailure } from '@/lib/api/describe-failure'
import { ApiFailurePanel } from '@/components/ui/api-failure'

export const metadata: Metadata = {
  title: 'คิวอนุมัติแปลง — FarmFlow Admin',
}

type Search = Promise<Record<string, string | string[] | undefined>>

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

export default async function FarmsQueuePage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams

  // "Awaiting review" is the default view: it is the only one with work in it,
  // and every other status is reachable in one click from the toolbar.
  const status = one(sp.status) ?? 'draft,pending'
  const page = Math.max(1, Number(one(sp.page) ?? 1))

  // Only the read sits in the try — constructing JSX inside one would put the
  // render outside the catch's reach anyway (see the same note on Projects).
  let result: AdminFarmPage
  try {
    result = await fetchFarms({
      status: status === 'all' ? undefined : status.split(','),
      q: one(sp.q),
      sort: (one(sp.sort) as 'createdAt') ?? 'createdAt',
      dir: (one(sp.dir) as 'asc' | 'desc') ?? 'desc',
      limit: FARM_PAGE_SIZE,
      offset: (page - 1) * FARM_PAGE_SIZE,
    })
  } catch (err) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <Header />
        <ApiFailurePanel {...describeApiFailure(err, 'คิวอนุมัติแปลง')} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <Header />
      <FarmQueueTable page={result} />
    </div>
  )
}

function Header() {
  return (
    <header className="mb-6">
      <h1 className="text-xl font-semibold text-ink">คิวอนุมัติแปลง</h1>
      <p className="mt-1 text-[13px] text-ink-secondary">
        แปลงที่เกษตรกรขึ้นทะเบียนไว้ ต้องได้รับการอนุมัติก่อนจึงจะออกคาร์บอนเครดิตได้
      </p>
    </header>
  )
}
