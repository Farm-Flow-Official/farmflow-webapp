import { cookies } from 'next/headers'
import { mockFarmerDetails } from '@/features/farmers/data/mockFarmerDetails'
import type { FarmerDetail, Farm } from '@/features/farmers/types'

type ApiFarm = {
  id: string
  farmName: string
  farmAddress: string | null
  calculatedAreaRai: number | null
  declaredAreaRai: number | null
  farmStatus: string
  createdAt: string
}

type ApiFarmerDetail = {
  id: string
  username: string
  accountStatus: 'active' | 'suspended'
  createdAt: string
  profileAvatarFileId: string | null
  farms: ApiFarm[]
}

function mapApiFarm(f: ApiFarm): Farm {
  return {
    id: f.id,
    name: f.farmName,
    farmAddress: f.farmAddress,
    areaRai: f.calculatedAreaRai ?? f.declaredAreaRai,
    farmStatus: f.farmStatus,
    registeredAt: f.createdAt,
    province: null,
    cropType: null,
    carbonKgCo2e: null,
    _live: true,
  }
}

function mapApiDetail(f: ApiFarmerDetail): FarmerDetail {
  return {
    id: f.id,
    username: f.username,
    fullName: null,
    phone: null,
    email: null,
    accountStatus: f.accountStatus === 'active' ? 'Active' : 'Suspended',
    farmsCount: f.farms.length,
    registeredAt: f.createdAt,
    _live: true,
    farms: f.farms.map(mapApiFarm),
    totalCarbonKgCo2e: null,
    estimatedValueThb: null,
  }
}

const mockWithFlag = Object.fromEntries(
  Object.entries(mockFarmerDetails).map(([k, v]) => [
    k,
    {
      ...v,
      username: v.fullName ?? v.id,
      _live: false,
      farms: v.farms.map((f) => ({ ...f, farmAddress: null, farmStatus: 'active', _live: false })),
    } satisfies FarmerDetail,
  ]),
)

export async function fetchFarmerById(id: string): Promise<FarmerDetail | null> {
  const apiBase = process.env.FARMFLOW_API_URL
  if (!apiBase) return mockWithFlag[id] ?? null

  const store = await cookies()
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  try {
    const res = await fetch(`${apiBase}/admin/farmers/${encodeURIComponent(id)}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) return mockWithFlag[id] ?? null

    const json = (await res.json()) as { data?: ApiFarmerDetail }
    return json.data ? mapApiDetail(json.data) : null
  } catch {
    return mockWithFlag[id] ?? null
  }
}
