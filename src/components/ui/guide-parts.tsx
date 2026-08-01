import { Kbd } from '@/components/ui/kbd'

/** Shared building blocks for guide section bodies — keeps every portal's guide
 *  visually identical, and the content files free of layout noise. */

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-ink-secondary">{children}</p>
}

export function Steps({ items }: { items: [title: string, detail: string][] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {items.map(([title, detail], i) => (
        <li key={title} className="flex gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-mono text-[11px] font-bold text-primary">
            {i + 1}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink">{title}</p>
            <p className="text-[13px] leading-relaxed text-ink-secondary">{detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] leading-relaxed text-ink-secondary">
      {children}
    </p>
  )
}

export function Topic({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[13px] font-semibold text-ink">{title}</p>
      {children}
    </div>
  )
}

/** One shortcut row — key caps right-aligned so they scan as a column. */
export function Key({ keys, children }: { keys: string[]; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-[13px] text-ink-secondary">{children}</span>
      <span className="flex shrink-0 items-center gap-1">
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </span>
    </div>
  )
}

export function KeyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
        {title}
      </p>
      <div className="divide-y divide-line">{children}</div>
    </div>
  )
}
