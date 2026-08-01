import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

/**
 * Skeleton for the farm approval queue — header, stat row, then the table.
 *
 * The queue is server-filtered, so every search and page change is a round trip.
 * Without this the whole screen blanks on each one, which reads as a failure
 * rather than a wait.
 */
export default function FarmQueueLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          คิวอนุมัติแปลง
        </h1>
        <Skeleton className="mt-2 h-4 w-80" />
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[76px] rounded-xl" />
        ))}
      </div>

      <SkeletonTable columns={6} rows={8} />
    </div>
  )
}
