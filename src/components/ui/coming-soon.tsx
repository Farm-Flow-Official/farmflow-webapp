import type { ComponentType, SVGProps } from 'react'
import { Construction } from 'lucide-react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Props = {
  title: string
  description?: string
  /**
   * API endpoints this feature needs before it can show real data. Listing them
   * keeps the "no mock" contract honest: the page stays empty until the backend
   * exposes these, then it can be wired with no fake data in between.
   */
  requiredEndpoints?: string[]
  icon?: IconType
}

/**
 * Honest placeholder for a feature whose backing API does not exist yet in the
 * current spec (e.g. Business billing, Admin payouts). Shows what it will do and
 * exactly which endpoints unblock it — never mock data.
 */
export function ComingSoon({ title, description, requiredEndpoints, icon: Icon = Construction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-panel px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
        <Icon className="h-7 w-7" strokeWidth={1.6} />
      </span>
      <div>
        <p className="text-base font-semibold text-ink">{title}</p>
        {description && (
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-secondary">
            {description}
          </p>
        )}
      </div>
      {requiredEndpoints && requiredEndpoints.length > 0 && (
        <div className="mt-2 w-full max-w-md rounded-xl border border-line bg-surface px-4 py-3 text-left">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            รอ API เหล่านี้ (ไม่ใช้ mock)
          </p>
          <ul className="flex flex-col gap-1">
            {requiredEndpoints.map((ep) => (
              <li key={ep} className="font-mono text-[12px] text-ink-secondary">
                {ep}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
