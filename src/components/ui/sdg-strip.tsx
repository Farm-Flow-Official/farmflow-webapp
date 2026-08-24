type Props = {
  /**
   * Icon edge length: `sm` 56px on working pages, `md` 64px where it is a
   * footer statement. 56 is the floor — rendered at 48 the longest label
   * ("PARTNERSHIPS FOR THE GOALS") stops being readable and goal 17 degrades
   * into a blue square.
   */
  size?: 'sm' | 'md'
  className?: string
}

/**
 * The three UN Sustainable Development Goals this platform works toward.
 *
 * Deliberately aspirational, not a measured claim — the heading says "มุ่งสนับสนุน"
 * because nothing here is tied to a number the system can back. That keeps it in
 * line with the rule Flow Decide follows everywhere else: never state more than
 * the data supports.
 *
 * The official tiles carry their number and name as vector paths rather than
 * `<text>`, so a screen reader sees nothing — `alt` is the only accessible name
 * these icons have, and it must stay filled in.
 */
export function SdgStrip({ size = 'md', className = '' }: Props) {
  const px = size === 'sm' ? 56 : 64

  return (
    <section className={`flex flex-col items-center gap-3 ${className}`}>
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
        เป้าหมายการพัฒนาที่ยั่งยืนที่แพลตฟอร์มนี้มุ่งสนับสนุน
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-2.5">
        {GOALS.map((g) => {
          const label = `เป้าหมายการพัฒนาที่ยั่งยืนข้อ ${g.n}: ${g.th}`
          return (
            <li key={g.n}>
              {/* Same call as `Logo`: a local SVG has nothing for the image
                  optimiser to do, and next/image refuses SVG outright unless
                  `dangerouslyAllowSVG` is turned on. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={label}
                title={label}
                width={px}
                height={px}
                // The files declare width="100%", so the box has to come from
                // here — without both dimensions they collapse or stretch.
                className="block rounded-sm"
                style={{ width: px, height: px }}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const GOALS = [
  {
    n: 13,
    src: '/Sustainable_Development_Goal_13Climate.svg',
    th: 'การรับมือกับการเปลี่ยนแปลงสภาพภูมิอากาศ',
  },
  {
    n: 15,
    src: '/Sustainable_Development_Goal_15LifeOnLand.svg',
    th: 'การใช้ประโยชน์จากระบบนิเวศทางบก',
  },
  {
    n: 17,
    src: '/Sustainable_Development_Goal_17Partnerships.svg',
    th: 'ความร่วมมือเพื่อการพัฒนาที่ยั่งยืน',
  },
]
