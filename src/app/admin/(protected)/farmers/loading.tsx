import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

/** Skeleton for the farmer list — mirrors farmers/page.tsx header + DataTable. */
export default function FarmersLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-8 py-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Farmer Management
        </h1>
        <Skeleton className="mt-2 h-4 w-56" />
      </header>

      <SkeletonTable columns={6} rows={8} />
    </div>
  )
}
