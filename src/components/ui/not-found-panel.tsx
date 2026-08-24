import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Exit = { href: string; label: string }

/**
 * The 404 surface, shared by every `not-found.tsx` in the app the way
 * `ErrorPanel` is shared by every `error.tsx`.
 *
 * Two situations wear the same face on purpose. A mistyped URL and a record
 * that no longer exists are the same experience for the person in front of the
 * screen — they asked for something and it is not there — so what changes
 * between them is the wording and the way out, not the design.
 *
 * The mascot's sign already reads "404 Page Not Found", but it is pixels: a
 * screen reader gets nothing from it. The heading below carries the message in
 * text, which is why the alt attribute describes the drawing rather than
 * repeating words the heading already says.
 */
export function NotFoundPanel({
  title,
  description,
  exits,
}: {
  title: string
  description: string
  /** Where to go instead. The first is styled as the primary way out. */
  exits: Exit[]
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:flex-row sm:gap-10 sm:text-left">
      <Image
        src="/404PageNotFound_Mascot.png"
        alt="เจ้าหน้าที่ FarmFlow ยืนถือป้ายไม้ พร้อมทำหน้างง"
        width={1214}
        height={1295}
        // The hero of the page, so it is worth blocking on. Capped at 280px
        // because a 1214px original at full width would tower over the text
        // that carries the actual message.
        priority
        sizes="(max-width: 640px) 200px, 280px"
        className="h-auto w-[200px] shrink-0 sm:w-[280px]"
      />

      <div className="flex max-w-md flex-col items-center gap-3 sm:items-start">
        {/* No font class: globals.css already gives every h1 the display face,
            with Prompt behind it for Thai glyphs. */}
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {/* English underneath because the platform is read by partners and
            auditors who do not read Thai — worded so it adds to the sign in the
            mascot's hand rather than reprinting it. */}
        <p className="text-sm text-ink-muted">The page you asked for isn’t here.</p>

        <p className="text-[15px] leading-relaxed text-ink-secondary">{description}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {exits.map((exit, i) => (
            <Link
              key={exit.href}
              href={exit.href}
              className={
                i === 0
                  ? 'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                  : 'inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              }
            >
              {i === 0 && <ArrowLeft className="h-4 w-4" strokeWidth={2} />}
              {exit.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
