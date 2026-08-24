import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

/**
 * Mirrors the real page: the heading is static text, so it is rendered for real
 * rather than as a grey block, and the table skeleton shares `DataTable`'s
 * geometry so the swap produces no shift.
 */
export default function SpeciesLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          ชนิดพันธุ์ไม้และสมการคาร์บอน
        </h1>
        <Skeleton className="mt-2 h-4 w-[32rem] max-w-full" />
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <SkeletonTable columns={6} rows={8} />
    </div>
  )
}
