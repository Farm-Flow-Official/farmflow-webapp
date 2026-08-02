'use client'

import { useId, useSyncExternalStore } from 'react'
import { Megaphone, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useStoredIds } from '@/lib/hooks/useStoredIds'
import { publicFileUrl } from '@/lib/farm-cover'
import type { LiveAnnouncement } from '@/features/announcements/types/targets'

const DISMISSED_KEY = 'farmflow.announcements.dismissed'

/** Nothing to subscribe to — hydration happens once and never changes back. */
const noSubscribe = () => () => {}

/**
 * The banner form of an announcement (ADMIN-ANN-02) — for things that should be
 * seen now, not found later.
 *
 * It is a notice in the middle of the screen rather than a strip along the top,
 * because a strip is exactly what a reader has trained themselves to scroll
 * past. This one has to be answered before the dashboard is usable, which is
 * the whole point of the channel: the bell is for things you can catch up on,
 * this is for things you cannot.
 *
 * The panel shrink-wraps its image, so a portrait poster stays portrait and a
 * wide one stays wide — the admin who designed the artwork decided the shape,
 * not this component. Both dimensions are capped against the viewport so the
 * close button is never off-screen, which is the one way a modal notice can
 * turn into a trap.
 *
 * Dismissal sticks per device, per announcement id: a notice that reappears on
 * every navigation stops being read within a day, and pinning it to the id
 * means the *next* one is not silently swallowed with it.
 *
 * Only the newest undismissed one is shown. Two stacked notices compete rather
 * than inform, and the rest are still in the bell.
 */
export function AnnouncementBanner({ announcements }: { announcements: LiveAnnouncement[] }) {
  const [dismissed, setDismissed] = useStoredIds(DISMISSED_KEY)
  const titleId = useId()

  /**
   * Wait for the client before showing anything.
   *
   * `useStoredIds` reports nothing-dismissed on the server, which is the right
   * default for a strip — err toward showing it. For a modal it would mean
   * every already-dismissed notice flashing up, stealing focus and locking the
   * scroll for a frame on every page load. Rendering after hydration also gives
   * the dashboard a moment to paint underneath, so the notice reads as arriving
   * on top of the page rather than replacing it.
   *
   * Read as an external store rather than set in an effect: "am I on the
   * client" is exactly a value that differs between the two snapshots, and
   * setting state in an effect to discover it costs a second render pass.
   */
  const ready = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  )

  const current = announcements.find((a) => !dismissed.includes(a.id))
  if (!ready || !current) return null

  const bannerUrl = publicFileUrl(current.bannerFileId)
  const close = () => setDismissed([...dismissed, current.id])

  return (
    <Modal
      onClose={close}
      labelledBy={titleId}
      // Dismissal is permanent for this device, and an announcement targeted at
      // the banner alone has nowhere to be found again — so closing it takes a
      // deliberate press, not a stray click beside the panel.
      closeOnBackdrop={false}
      panelClassName="flex w-auto max-w-[min(92vw,34rem)] max-h-[90vh] flex-col overflow-hidden p-0"
    >
      <button
        type="button"
        onClick={close}
        aria-label="ปิดประกาศนี้"
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-panel/85 text-ink-secondary shadow-sm backdrop-blur transition-colors hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>

      {bannerUrl && (
        <div className="flex shrink-0 justify-center bg-sunken">
          {/* `w-auto` + a height cap lets the file's own proportions set the
              width, so the panel ends up the shape of the artwork. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt=""
            className="max-h-[62vh] w-auto max-w-full object-contain"
          />
        </div>
      )}

      {/* The words are never only in the picture: an image-only notice is
          silent to a screen reader and blank when the file fails to load. */}
      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-6 py-5">
        <p id={titleId} className="flex items-start gap-2 text-base font-semibold text-ink">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.9} />
          {current.title}
        </p>
        {current.body && (
          <p className="whitespace-pre-line pl-6 text-[13px] leading-relaxed text-ink-secondary">
            {current.body}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-line px-6 py-3">
        <button
          type="button"
          onClick={close}
          className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          รับทราบ
        </button>
      </div>
    </Modal>
  )
}
