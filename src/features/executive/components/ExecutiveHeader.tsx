import Image from 'next/image'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { formatDateTime } from '@/lib/utils/format'
import { projectCoverUrl, projectPattern } from '@/lib/project-cover'
import type { ExecutiveScope } from '@/features/executive/types'

/**
 * Whether to show the partner mark beside the FarmFlow one. The board this page
 * serves is FarmFlow's and TRUE's, so the funder is named on it — but a partner
 * relationship ends more often than a dashboard does, hence a flag rather than
 * a hard-coded logo.
 */
const SHOW_PARTNER_LOGO = true

type Props = {
  asOf: string
  scope: ExecutiveScope
  /** The scoped project's picture and code — absent on the portfolio view. */
  cover?: { fileId: string | null; code: string }
}

/**
 * Page header, in two forms.
 *
 * On the portfolio view it is plain type. Scoped to one project it becomes a
 * banner carrying that project's picture — the page is about that project now,
 * and it should look like it.
 *
 * The banner ABSORBS the header rather than sitting above it. An extra hero
 * would have pushed the signal strip below the fold, and the strip is the one
 * element on this page that asks the reader to do something.
 *
 * Either way it states WHEN the numbers were read: this view has no date picker,
 * so without a timestamp a reader cannot tell a fresh figure from a cached one.
 */
export function ExecutiveHeader({ asOf, scope, cover }: Props) {
  if (scope && cover) {
    return <ScopedBanner asOf={asOf} projectName={scope.projectName} cover={cover} />
  }

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <Eyebrow />
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
          <span className="text-lead-in">ภาพรวม</span>พอร์ตคาร์บอน
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
          ข้อมูล ณ {formatDateTime(asOf)}
          <span className="text-ink-muted"> · ทุกตัวเลขมาจากฐานข้อมูลจริง</span>
        </p>
      </div>

      {SHOW_PARTNER_LOGO && <PartnerMark />}
    </header>
  )
}

function ScopedBanner({
  asOf,
  projectName,
  cover,
}: {
  asOf: string
  projectName: string
  cover: { fileId: string | null; code: string }
}) {
  const url = projectCoverUrl(cover.fileId)

  return (
    <header
      className="relative overflow-hidden rounded-2xl border border-line"
      // A project with no picture still gets its code-derived pattern here, so
      // the scoped view never drops back to a plain heading mid-session.
      style={url ? undefined : projectPattern(cover.code)}
    >
      {url && (
        <ImageWithSkeleton
          src={url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity"
        />
      )}

      {/* One scrim for both backdrops. A photo can be any brightness and the
          pattern is pale, so darkening whatever is underneath is the only way
          one text treatment stays legible over both. */}
      <div className="relative bg-gradient-to-t from-black/70 via-black/35 to-black/10">
        <div className="flex min-h-40 flex-col justify-end gap-4 p-5 sm:min-h-48 sm:p-6">
          {SHOW_PARTNER_LOGO && (
            <div className="absolute right-4 top-4">
              <PartnerMark />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-white/75">
              Flow Decide · ESG · เฉพาะโครงการนี้
            </p>
            <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-[30px]">
              {projectName}
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/80">
              <span className="font-mono">{cover.code}</span> · ข้อมูล ณ {formatDateTime(asOf)}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

function Eyebrow() {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
      Flow Decide · ESG
    </p>
  )
}

function PartnerMark() {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-line bg-panel/90 px-3 py-2 backdrop-blur">
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
        Powered by
      </span>
      <Image
        src="/True_Corporation_(Thailand).svg.webp"
        alt="True Corporation"
        width={64}
        height={22}
        className="h-[22px] w-auto"
      />
    </div>
  )
}
