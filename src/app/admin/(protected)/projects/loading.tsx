import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

/** Skeleton for the project list — mirrors projects/page.tsx header + DataTable. */
export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Projects
        </h1>
        <Skeleton className="mt-2 h-4 w-72" />
      </header>

      <SkeletonTable columns={7} rows={6} />
    </div>
  )
}
