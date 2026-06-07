import type { Metadata } from 'next'
import { fetchFarmers } from '@/features/farmers/services/fetchFarmers'
import { FarmerTable } from '@/features/farmers/components/FarmerTable'

export const metadata: Metadata = {
  title: 'Farmer Management — FarmFlow Admin',
}

export default async function FarmersPage() {
  const farmers = await fetchFarmers()

  return (
    <div className="mx-auto max-w-[1440px] px-8 py-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Farmer Management
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          จัดการบัญชีเกษตรกรทั้งหมด ·{' '}
          <span className="font-medium text-ink">{farmers.length}</span> ราย
        </p>
      </header>

      <FarmerTable farmers={farmers} />
    </div>
  )
}
