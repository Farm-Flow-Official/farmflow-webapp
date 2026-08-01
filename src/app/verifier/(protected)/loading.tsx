import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton for the project picker — mirrors the card grid on page.tsx. */
export default function VerifierProjectPickerLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          เลือกโครงการที่จะตรวจสอบ
        </h1>
        <Skeleton className="mt-2 h-4 w-72" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-panel p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-1.5 h-3 w-24" />
              </div>
            </div>
            <div className="mt-6">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="mt-1.5 h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
