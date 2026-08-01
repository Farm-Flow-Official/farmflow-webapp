'use client'

import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { BookOpen, ChevronLeft, type LucideIcon } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useHotkeys } from '@/lib/hooks/useHotkeys'

export type GuideSection = {
  id: string
  title: string
  /** One line under the title — lets a reader tell if this is their section. */
  summary: string
  icon: LucideIcon
  body: React.ReactNode
}

type GuideApi = { open: (sectionId?: string) => void }

const GuideContext = createContext<GuideApi | null>(null)

/** Opens the guide from anywhere inside a `GuideBookProvider`. */
export function useGuide(): GuideApi {
  const ctx = useContext(GuideContext)
  if (!ctx) throw new Error('useGuide must be used within <GuideBookProvider>')
  return ctx
}

type ProviderProps = {
  sections: GuideSection[]
  title: string
  subtitle: string
  /**
   * Maps the current route to the section that answers "how do I do the thing
   * on this screen?" — opening there makes the button one click from the answer
   * instead of one click from a table of contents.
   */
  resolveSection?: (pathname: string) => string
  /** Section `?` jumps to. Defaults to the contextual one. */
  shortcutsSectionId?: string
  children: React.ReactNode
}

/**
 * Portal guide book: reference material in a right-docked drawer rather than a
 * page of its own, so reading it never costs the user their place in the work
 * they were doing. Content is passed in per portal; the drawer, the context and
 * the `?` shortcut are shared.
 */
export function GuideBookProvider({
  sections,
  title,
  subtitle,
  resolveSection,
  shortcutsSectionId,
  children,
}: ProviderProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const pathname = usePathname()

  const open = useCallback(
    (sectionId?: string) =>
      setOpenSection(sectionId ?? resolveSection?.(pathname) ?? sections[0]?.id ?? null),
    [pathname, resolveSection, sections],
  )

  const api = useMemo<GuideApi>(() => ({ open }), [open])

  useHotkeys({ '?': () => open(shortcutsSectionId) })

  return (
    <GuideContext.Provider value={api}>
      {children}
      {openSection && (
        <GuideDrawer
          sections={sections}
          title={title}
          subtitle={subtitle}
          initialSection={openSection}
          onClose={() => setOpenSection(null)}
        />
      )}
    </GuideContext.Provider>
  )
}

function GuideDrawer({
  sections,
  title,
  subtitle,
  initialSection,
  onClose,
}: {
  sections: GuideSection[]
  title: string
  subtitle: string
  initialSection: string
  onClose: () => void
}) {
  const titleId = useId()
  // null = table of contents. Drill-down beats a long scroll: each section is a
  // page of its own, and the reader always knows where they are.
  const [sectionId, setSectionId] = useState<string | null>(initialSection)
  const section = sections.find((s) => s.id === sectionId) ?? null

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      placement="right"
      panelClassName="flex w-full max-w-md flex-col"
    >
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        {section ? (
          <button
            type="button"
            onClick={() => setSectionId(null)}
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="กลับไปสารบัญ"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
          </button>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
            <BookOpen className="h-4 w-4" strokeWidth={1.9} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-sm font-semibold text-ink">
            {section ? section.title : title}
          </h2>
          <p className="truncate text-[11px] text-ink-muted">
            {section ? section.summary : subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ปิด · Esc
        </button>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {section ? (
          section.body
        ) : (
          <nav className="flex flex-col gap-1.5">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSectionId(s.id)}
                className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-3 text-left transition-colors hover:border-primary-muted hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-secondary">
                  <s.icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink">{s.title}</span>
                  <span className="block text-[12px] leading-snug text-ink-muted">{s.summary}</span>
                </span>
              </button>
            ))}
          </nav>
        )}
      </div>

      {section && (
        <footer className="border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={() => setSectionId(null)}
            className="text-[12px] font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ← หัวข้อทั้งหมด
          </button>
        </footer>
      )}
    </Modal>
  )
}
