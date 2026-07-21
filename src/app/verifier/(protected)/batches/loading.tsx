import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

/** Skeleton for the verifier batch queue — header + queue table. */
export default function BatchQueueLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Farm Batch Queue
        </h1>
        <Skeleton className="mt-2 h-4 w-72" />
      </header>

      <SkeletonTable columns={6} rows={8} />
    </div>
  )
}
