import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { fetchPdd } from '@/features/pdd/services/fetchPdd'
import { PrintButton } from '@/features/verifier/components/PrintButton'
import {
  IMPLEMENTATION_MODE_LABELS,
  PROJECT_SCALE_LABELS,
} from '@/features/projects/types'
import { LAND_TENURE_OPTIONS } from '@/features/pdd/schemas'
import type { PddDetail } from '@/features/pdd/types'

export const metadata: Metadata = {
  title: 'PDD — พิมพ์เอกสาร',
}

/**
 * The PDD laid out for paper, in the authority's section order.
 *
 * Printed through the browser rather than generated server-side: production
 * runs the API as a compiled binary on a distroless image, which has no
 * Chromium to drive (see ADR 0012). The browser also renders Thai correctly
 * without embedding fonts by hand, which a PDF library would have to.
 */
export default async function PddPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pdd = await fetchPdd(id)
  if (!pdd) notFound()

  const c = (pdd.content ?? {}) as Record<string, Record<string, unknown>>
  const p = pdd.project

  return (
    <>
      {/* Scoped to this route so the A4 geometry never leaks into the console. */}
      <style>{`
        @page { size: A4; margin: 18mm 16mm; }
        @media print {
          html, body { background: #fff; }
          .pdd-section { break-inside: avoid; }
          .pdd-break { break-before: page; }
          h2, h3 { break-after: avoid; }
          tr, li { break-inside: avoid; }
        }
      `}</style>

      <div className="min-h-screen bg-surface py-8 print:bg-white print:py-0">
        <div className="mx-auto mb-6 flex max-w-[820px] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
          <Link
            href={`/admin/projects/${id}/pdd`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            กลับไปแก้ไขเอกสาร
          </Link>
          <PrintButton />
        </div>

        <article className="mx-auto max-w-[820px] bg-white p-12 text-[13px] leading-relaxed text-ink shadow-sm print:max-w-none print:p-0 print:shadow-none">
          {/* Cover */}
          <header className="pdd-section mb-8 border-b-2 border-ink pb-6 text-center">
            <p className="text-xs tracking-wide text-ink-secondary">
              เอกสารข้อเสนอโครงการ (Project Design Document: PDD)
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              โครงการลดก๊าซเรือนกระจกภาคสมัครใจตามมาตรฐานของประเทศไทย (T-VER)
            </p>
            <h1 className="mt-4 text-xl font-bold text-ink">{p.nameTh}</h1>
            {p.nameEn && <p className="mt-1 text-sm text-ink-secondary">{p.nameEn}</p>}
            <p className="mt-3 text-xs text-ink-muted">
              รหัสโครงการ {p.projectCode} · เอกสารฉบับที่ {pdd.version} ·{' '}
              {pdd.status === 'draft' ? 'ฉบับร่าง (ยังไม่ได้ยื่น)' : 'ฉบับที่ยื่น'}
            </p>
          </header>

          <Section title="ส่วนที่ 1 ข้อมูลหลักโครงการ">
            <Rows
              rows={[
                ['ชื่อโครงการ (ไทย)', p.nameTh],
                ['ชื่อโครงการ (อังกฤษ)', p.nameEn],
                ['ประเภทโครงการ', 'การลด ดูดซับ และการกักเก็บฯ จากภาคป่าไม้และการเกษตร'],
                [
                  'รูปแบบการดำเนินโครงการ',
                  IMPLEMENTATION_MODE_LABELS[
                    p.implementationMode as keyof typeof IMPLEMENTATION_MODE_LABELS
                  ],
                ],
                [
                  'ขนาดโครงการ',
                  PROJECT_SCALE_LABELS[p.projectScale as keyof typeof PROJECT_SCALE_LABELS],
                ],
                ['เงินลงทุนทั้งหมด', num(p.totalInvestmentMillionThb, 'ล้านบาท')],
                [
                  'ปริมาณก๊าซที่คาดว่าจะลด/ดูดกลับ',
                  num(p.expectedReductionTco2eYr, 'tCO₂e/ปี'),
                ],
                [
                  'ระยะเวลาคิดเครดิต',
                  p.creditingPeriodYears ? `${p.creditingPeriodYears} ปี` : null,
                ],
                ['วันเริ่มคิดเครดิต', p.creditingStartDate],
                ['วันสิ้นสุดคิดเครดิต', p.creditingEndDate],
              ]}
            />
          </Section>

          <Section title="ส่วนที่ 2 ผู้เกี่ยวข้องและผู้จัดทำเอกสาร">
            <SubTitle>2A. ข้อมูลนิติบุคคล / ที่ตั้ง</SubTitle>
            <Rows
              rows={[
                ['ผู้พัฒนาโครงการ (หลัก)', text(c.step2?.developerMain)],
                ['ผู้พัฒนาโครงการร่วม', coDevelopers(c.step2?.developerCo)],
                ['เจ้าของโครงการ', text(c.step2?.projectOwner)],
                ['ที่ตั้งโครงการ', text(c.step2?.projectLocationText)],
                [
                  'พิกัดที่ตั้ง (UTM)',
                  joinCoords(text(c.step2?.coordsUtmX), text(c.step2?.coordsUtmY)),
                ],
              ]}
            />

            <SubTitle>2B. รายละเอียดผู้พัฒนาโครงการ</SubTitle>
            {pdd.contacts.length === 0 ? (
              <Empty />
            ) : (
              pdd.contacts.map((contact) => (
                <div key={contact.id} className="mb-3 border-l-2 border-line pl-3">
                  <p className="font-semibold">
                    {contact.orgName}
                    {contact.isPrimary && (
                      <span className="ml-2 text-xs font-normal text-ink-secondary">
                        (ผู้พัฒนาหลัก)
                      </span>
                    )}
                  </p>
                  <Rows
                    compact
                    rows={[
                      ['ชื่อผู้ประสานงาน', contact.coordinatorName],
                      ['ตำแหน่ง', contact.position],
                      ['ที่อยู่', contact.address],
                      ['โทรศัพท์', contact.phone],
                      ['โทรสาร', contact.fax],
                      ['E-mail', contact.email],
                    ]}
                  />
                </div>
              ))
            )}

            <SubTitle>2C. รายละเอียดการจัดทำเอกสาร</SubTitle>
            <Rows
              rows={[
                ['เอกสารฉบับที่', String(pdd.version)],
                ['ผู้จัดทำ', text(c.step2?.preparerName)],
                ['ตำแหน่ง', text(c.step2?.preparerPosition)],
                ['หน่วยงาน', text(c.step2?.preparerOrg)],
                ['เบอร์ติดต่อ', text(c.step2?.preparerPhone)],
              ]}
            />
          </Section>

          <Section title="1.1 รายละเอียดและกิจกรรมของโครงการ">
            <Prose label="วัตถุประสงค์ของโครงการ" value={text(c.step3?.objective)} />
            <Prose label="รายละเอียดหน่วยงาน/ชุมชนที่เกี่ยวข้อง" value={text(c.step3?.orgBackground)} />
            <Prose
              label="ลักษณะและการดำเนินงานก่อนมีโครงการ (กรณีฐาน)"
              value={text(c.step3?.preProjectCondition)}
            />
            <Prose label="กิจกรรมลดก๊าซเรือนกระจกของโครงการ" value={text(c.step3?.projectActivities)} />
            <Prose label="วัตถุดิบ / แหล่งที่มา / ปริมาณ" value={text(c.step3?.materialsSource)} />
            <Prose
              label="ปริมาณก๊าซที่คาดว่าจะลดได้ตลอดช่วงคิดเครดิต"
              value={text(c.step3?.expectedReductionNarrative)}
            />
          </Section>

          <Section title="1.2 ขอบเขตการดำเนินโครงการ">
            <Prose label="เทคโนโลยี / อุปกรณ์หลัก" value={text(c.step3?.technologyDesc)} />
            <Prose label="ขอบเขตการดำเนินงานและนิติบุคคลที่เกี่ยวข้อง" value={text(c.step3?.operationScope)} />
            <Attachments pdd={pdd} slot="boundary_image" label="ภาพ Project Boundary / แผนผังโครงการ" />
          </Section>

          <Section title="1.3 การนับซ้ำ (Double Counting)" breakBefore>
            <Rows
              rows={[
                [
                  'เคยขึ้นทะเบียนกับมาตรฐานอื่น',
                  c.step4?.doubleCounting === 'yes' ? 'มี' : c.step4?.doubleCounting === 'none' ? 'ไม่มี' : null,
                ],
                ['ชื่อโครงการที่ขึ้นทะเบียน', text(c.step4?.dcProjectName)],
                ['ชื่อกลไก / มาตรฐาน', text(c.step4?.dcMechanism)],
                ['ช่วงเวลาที่ขอรับรองเครดิต', text(c.step4?.dcCreditPeriod)],
              ]}
            />
          </Section>

          <Section title="1.4 การพิสูจน์ส่วนเพิ่มเติม (Additionality)">
            <Rows
              rows={[
                [
                  'ต้องพิสูจน์ Additionality',
                  c.step4?.additionalityRequirement === 'required' ? 'ต้องพิสูจน์' : 'ไม่ต้องพิสูจน์',
                ],
                ['เหตุผลกรณีไม่ต้องพิสูจน์', text(c.step4?.additionalityReasonNotReq)],
                [
                  'ผลการพิสูจน์',
                  c.step4?.additionalityResult === 'has'
                    ? 'มี Additionality'
                    : c.step4?.additionalityResult === 'none'
                      ? 'ไม่มี Additionality'
                      : null,
                ],
                ['เหตุผลประกอบ', text(c.step4?.additionalityReason)],
              ]}
            />
          </Section>

          <Section title="1.5 ระยะเวลาการคิดเครดิต">
            <Rows
              rows={[
                ['วันเริ่มดำเนินโครงการ', text(c.step4?.projectStartDate)],
                ['เหตุผลของวันเริ่มโครงการ', text(c.step4?.startDateReason)],
                ['ระยะเวลาคิดเครดิต', p.creditingPeriodYears ? `${p.creditingPeriodYears} ปี` : null],
              ]}
            />
          </Section>

          <Section title="1.6 พื้นที่โครงการ" breakBefore>
            <Rows
              rows={[
                ['สิทธิการใช้ประโยชน์ที่ดิน', landTenure(c.step5?.landTenureType)],
                ['รายละเอียดเพิ่มเติม', text(c.step5?.landTenureNote)],
                ['พื้นที่ที่ประกาศ (จากไฟล์ขอบเขต)', num(p.declaredAreaRai, 'ไร่')],
                [
                  'พื้นที่จริงจากฟาร์มสมาชิก',
                  num(pdd.reconciliation.effectiveAreaRai, 'ไร่'),
                ],
              ]}
            />

            {pdd.samplePlots.length > 0 && (
              <>
                <SubTitle>แปลงตัวอย่าง</SubTitle>
                <Table
                  head={['ชื่อแปลง', 'พื้นที่ (ไร่)']}
                  rows={pdd.samplePlots.map((plot) => [
                    plot.plotName,
                    plot.areaRai != null ? plot.areaRai.toFixed(2) : '—',
                  ])}
                />
              </>
            )}

            <Attachments pdd={pdd} slot="boundary_kmz" label="ไฟล์ขอบเขต KMZ/KML" />
            <Attachments pdd={pdd} slot="land_right" label="หลักฐานสิทธิที่ดิน" />
            <Attachments pdd={pdd} slot="power_of_attorney" label="หนังสือมอบอำนาจ" />
            <Attachments pdd={pdd} slot="area_photo" label="รูปภาพพื้นที่" />
          </Section>

          <Section title="ส่วนที่ 2 ระเบียบวิธีและแหล่งปล่อย/สะสมคาร์บอน" breakBefore>
            <SubTitle>2.1 ระเบียบวิธีและเครื่องมือคำนวณ</SubTitle>
            <Table
              head={['ลำดับ', 'รหัส', 'เวอร์ชั่น', 'ชื่อระเบียบวิธี / เครื่องมือ']}
              rows={list(c.step6?.methodologies).map((m, i) => [
                String(i + 1),
                text(m.code) ?? '—',
                text(m.version) ?? '—',
                text(m.name) ?? '—',
              ])}
            />

            <SubTitle>2.2 เงื่อนไขของกิจกรรมโครงการ</SubTitle>
            <Prose label="ลักษณะกิจกรรมที่เข้าข่าย" value={text(c.step6?.applicabilityDesc)} />
            <Prose label="เหตุผลที่เข้าข่าย" value={text(c.step6?.applicabilityReason)} />
            {list(c.step6?.conditions).length > 0 && (
              <Table
                head={['เงื่อนไข', 'เหตุผล']}
                rows={list(c.step6?.conditions).map((x) => [
                  text(x.condition) ?? '—',
                  text(x.reason) ?? '—',
                ])}
              />
            )}

            <SubTitle>2.3 แหล่งปล่อยก๊าซเรือนกระจก</SubTitle>
            <Table
              head={['ขอบเขต', 'แหล่งปล่อย', 'ชนิดก๊าซ', 'รายละเอียด']}
              rows={list(c.step6?.emissionSources).map((x) => [
                scopeLabel(x.scope),
                text(x.sourceName) ?? '—',
                text(x.gasType) ?? '—',
                text(x.detail) ?? '—',
              ])}
            />

            <SubTitle>2.4 แหล่งสะสมคาร์บอน</SubTitle>
            <Table
              head={['ขอบเขต', 'แหล่งสะสม', 'รายละเอียด']}
              rows={list(c.step6?.carbonPools).map((x) => [
                scopeLabel(x.scope),
                text(x.poolType) ?? '—',
                text(x.detail) ?? '—',
              ])}
            />
          </Section>

          <Section title="ส่วนที่ 3 การคำนวณการลดก๊าซเรือนกระจก" breakBefore>
            <Table
              head={['ปี', 'BE_y', 'PE_y', 'LE_y', 'ER_y']}
              rows={list(c.step7?.yearlyEstimates).map((r) => [
                String(r.year ?? '—'),
                fmt(r.baseline),
                fmt(r.project),
                fmt(r.leakage),
                fmt(r.netReduction),
              ])}
            />
            <Rows
              rows={[
                ['รวมตลอดช่วงเครดิต', num(numeric(c.step7?.totalTco2e), 'tCO₂e')],
                ['จำนวนปี', numeric(c.step7?.periodYears) ? `${numeric(c.step7?.periodYears)} ปี` : null],
                ['เฉลี่ยต่อปี', num(numeric(c.step7?.avgPerYear), 'tCO₂e/ปี')],
              ]}
            />
            <Prose label="หมายเหตุสมการและพารามิเตอร์" value={text(c.step7?.equationNote)} />
          </Section>

          <Section title="ส่วนที่ 4 แผนการติดตามผล" breakBefore>
            <Prose label="โครงสร้างหน่วยงานและหน้าที่" value={text(c.step8?.monitoringOrgStructure)} />
            <Prose
              label="ขั้นตอนการจัดเก็บ บันทึก คำนวณ และรายงานข้อมูล"
              value={text(c.step8?.monitoringDataProcess)}
            />

            <SubTitle>4.2 พารามิเตอร์ที่ไม่ต้องติดตามผล</SubTitle>
            <Table
              head={['พารามิเตอร์', 'ค่าที่ใช้', 'หน่วย', 'ความหมาย', 'แหล่งข้อมูล']}
              rows={list(c.step8?.fixedParams).map((x) => [
                text(x.param) ?? '—',
                text(x.value) ?? '—',
                text(x.unit) ?? '—',
                text(x.meaning) ?? '—',
                text(x.source) ?? '—',
              ])}
            />

            <SubTitle>4.3 พารามิเตอร์ที่ต้องติดตามผล</SubTitle>
            <Table
              head={['พารามิเตอร์', 'หน่วย', 'ความหมาย', 'แหล่งข้อมูล', 'วิธีการติดตามผล']}
              rows={list(c.step8?.monitoredParams).map((x) => [
                text(x.param) ?? '—',
                text(x.unit) ?? '—',
                text(x.meaning) ?? '—',
                text(x.source) ?? '—',
                text(x.method) ?? '—',
              ])}
            />

            <Attachments pdd={pdd} slot="qa_diagram" label="แผนผังขั้นตอนและ QA" />
            <Attachments pdd={pdd} slot="monitoring_map" label="ผังจุดตรวจวัด" />
            <Attachments pdd={pdd} slot="appendix" label="เอกสารประกอบอื่น ๆ" />
          </Section>

          <footer className="pdd-section mt-10 border-t border-line pt-4 text-[11px] text-ink-muted">
            จัดทำผ่านระบบ FarmFlow · เอกสารฉบับที่ {pdd.version} ·{' '}
            {pdd.status === 'draft'
              ? 'ฉบับร่าง — ยังไม่ได้ยื่นต่อ อบก.'
              : 'ยื่นต่อ อบก. แล้ว'}
          </footer>
        </article>
      </div>
    </>
  )
}

/* ── Layout pieces ──────────────────────────────────────────────────────── */

function Section({
  title,
  breakBefore,
  children,
}: {
  title: string
  breakBefore?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={`pdd-section mb-7 ${breakBefore ? 'pdd-break' : ''}`}>
      <h2 className="mb-3 border-b border-ink/30 pb-1 text-[15px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-4 text-[13px] font-semibold text-ink">{children}</h3>
}

/** Label/value pairs — the form's dominant shape. */
function Rows({
  rows,
  compact,
}: {
  rows: [string, string | null | undefined][]
  compact?: boolean
}) {
  return (
    <dl className="grid grid-cols-[minmax(150px,34%)_1fr] gap-x-4">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt
            className={`border-b border-line/60 text-ink-secondary ${compact ? 'py-1' : 'py-1.5'}`}
          >
            {label}
          </dt>
          <dd
            className={`whitespace-pre-wrap border-b border-line/60 ${compact ? 'py-1' : 'py-1.5'} ${
              value ? 'text-ink' : 'text-ink-muted'
            }`}
          >
            {value || '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Prose({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="mb-3">
      <p className="text-ink-secondary">{label}</p>
      <p className={`mt-0.5 whitespace-pre-wrap ${value ? 'text-ink' : 'text-ink-muted'}`}>
        {value || '—'}
      </p>
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  if (rows.length === 0) return <Empty />
  return (
    <table className="mb-3 w-full border-collapse text-[12px]">
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="border border-line bg-surface px-2 py-1.5 text-left font-semibold text-ink"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border border-line px-2 py-1.5 align-top text-ink">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Attachments are listed by name, not embedded. The authority receives the
 * files themselves alongside the form; reproducing them inline would make the
 * printout claim to be something it is not.
 */
function Attachments({ pdd, slot, label }: { pdd: PddDetail; slot: string; label: string }) {
  const files = pdd.attachments.filter((a) => a.slot === slot)
  return (
    <div className="mb-2 mt-3">
      <p className="text-ink-secondary">{label}</p>
      {files.length === 0 ? (
        <p className="mt-0.5 text-ink-muted">— ไม่มีไฟล์แนบ</p>
      ) : (
        <ul className="mt-0.5 list-inside list-disc text-ink">
          {files.map((f) => (
            <li key={f.id}>{f.displayName ?? f.fileId}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Empty() {
  return <p className="mb-2 text-ink-muted">— ยังไม่ได้กรอกข้อมูล</p>
}

/* ── Value helpers ──────────────────────────────────────────────────────── */

const text = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim() : null

const numeric = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

const fmt = (v: unknown): string => {
  const n = numeric(v)
  return n == null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const num = (v: number | null | undefined, unit: string): string | null =>
  v == null ? null : `${v.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${unit}`

const list = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? (v as Record<string, unknown>[]) : []

const joinCoords = (x: string | null, y: string | null): string | null =>
  x || y ? `X: ${x ?? '—'}, Y: ${y ?? '—'}` : null

const coDevelopers = (v: unknown): string | null => {
  const names = list(v)
    .map((d) => text(d.name))
    .filter((n): n is string => Boolean(n))
  return names.length > 0 ? names.join(', ') : null
}

const landTenure = (v: unknown): string | null =>
  LAND_TENURE_OPTIONS.find((o) => o.value === v)?.label ?? text(v)

const scopeLabel = (v: unknown): string =>
  v === 'baseline' ? 'กรณีฐาน' : v === 'project' ? 'โครงการ' : v === 'leakage' ? 'การรั่วไหล' : '—'
