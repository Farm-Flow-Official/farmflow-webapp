import { cookies } from 'next/headers'
import { mockFarmers } from '@/features/farmers/data/mockFarmers'
import type { Farmer, FarmerAccountStatus } from '@/features/farmers/types'

type ApiFarmer = {
  id: string
  username: string
  accountStatus: 'active' | 'suspended'
  createdAt: string
  farmsCount: number
}

function mapApiFarmer(f: ApiFarmer): Farmer {
  return {
    id: f.id,
    username: f.username,
    fullName: null,
    phone: null,
    email: null,
    accountStatus: f.accountStatus === 'active' ? 'Active' : 'Suspended',
    farmsCount: f.farmsCount,
    registeredAt: f.createdAt,
    _live: true,
  }
}

const mockWithFlag: Farmer[] = mockFarmers.map((f) => ({
  ...f,
  username: f.fullName ?? f.id,
  _live: false as const,
  accountStatus: f.accountStatus as FarmerAccountStatus,
}))

export async function fetchFarmers(): Promise<Farmer[]> {
  const apiBase = process.env.FARMFLOW_API_URL
  if (!apiBase) return mockWithFlag

  const store = await cookies()
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  try {
    const res = await fetch(`${apiBase}/admin/farmers`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return mockWithFlag

    const json = (await res.json()) as { data?: ApiFarmer[] }
    return (json.data ?? []).map(mapApiFarmer)
  } catch {
    return mockWithFlag
  }
}
