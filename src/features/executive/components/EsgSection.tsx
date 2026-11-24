import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Leaf, Users, ShieldCheck } from 'lucide-react'

export type Pillar = 'environmental' | 'social' | 'governance'

const PILLARS: Record<
  Pillar,
  {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    en: string
    th: string
    blurb: string
    accent: string
    chip: string
  }
> = {
  environmental: {
    icon: Leaf,
    en: 'Environmental',
    th: 'สิ่งแวดล้อม',
    blurb: 'คาร์บอนที่วัดได้จริงจากต้นไม้ในแปลงของเกษตรกร',
    accent: 'text-esg-e',
    chip: 'bg-esg-e-bg text-esg-e',
  },
  social: {
    icon: Users,
    en: 'Social',
    th: 'สังคม',
    blurb: 'เกษตรกร พื้นที่ และโครงการที่ร่วมอยู่ในพอร์ต',
    accent: 'text-esg-s',
    chip: 'bg-esg-s-bg text-esg-s',
  },
  governance: {
    icon: ShieldCheck,
    en: 'Governance',
    th: 'ธรรมาภิบาลข้อมูล',
    blurb: 'สัญญาณที่บอกว่าตัวเลขข้างบนเชื่อถือได้แค่ไหน',
    accent: 'text-esg-g',
    chip: 'bg-esg-g-bg text-esg-g',
  },
}

/**
 * Heading for one ESG pillar.
 *
 * The accent colour is a navigational encoding — it tells a reader which pillar
 * a card belongs to once they have scrolled past the heading. It is never the
 * only signal: the pillar's name and its own icon are always present, which is
 * what makes the accents legal despite sitting in the validator's 6–8 CVD band.
 */
export function EsgSection({ pillar, children }: { pillar: Pillar; children: ReactNode }) {
  const { icon: Icon, en, th, blurb, accent, chip } = PILLARS[pillar]

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${chip}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2
              className={`text-[12px] font-semibold uppercase tracking-[0.09em] ${accent}`}
            >
              {en}
            </h2>
            <span className="text-[13px] font-medium text-ink">{th}</span>
          </div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">{blurb}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
