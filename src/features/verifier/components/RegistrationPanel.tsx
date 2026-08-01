import { CalendarClock, FolderTree, Sprout } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { BASELINE_LABEL } from '@/features/verifier/baseline'
import type { SessionBaseline, SessionRegistration } from '@/features/verifier/types'

type Props = {
  projectName: string | null
  projectCode: string | null
  registration: SessionRegistration
  baseline: SessionBaseline | null
}

/**
 * Which project this farm is registered to, what its reference stock is, and
 * when it is next due to be measured (VERIFIER-DETAIL-02 / -BASELINE-01).
 *
 * These three facts decide whether the numbers on this page mean anything: a
 * session outside a crediting period, or measured against no baseline, is not
 * something a verifier should approve without noticing.
 */
export function RegistrationPanel({ projectName, projectCode, registration, baseline }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
        การขึ้นทะเบียน
      </h2>

      <dl className="space-y-3.5">
        <Row icon={FolderTree} label="โครงการ">
          {projectName ? (
            <span className="text-sm font-medium text-ink">
              {projectName}
              {projectCode && (
                <span className="ml-1.5 font-mono text-[11px] text-ink-muted">{projectCode}</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-warning">ยังไม่เข้าร่วมโครงการ</span>
          )}
        </Row>

        <Row icon={CalendarClock} label="ช่วงคิดเครดิต">
          {registration.creditingStartDate && registration.creditingEndDate ? (
            <span className="text-sm text-ink">
              {formatDate(registration.creditingStartDate)} –{' '}
              {formatDate(registration.creditingEndDate)}
              {registration.creditingPeriodYears != null && (
                <span className="ml-1.5 text-[12px] text-ink-muted">
                  ({registration.creditingPeriodYears} ปี)
                </span>
              )}
            </span>
          ) : (
            <span className="text-sm text-ink-disabled">—</span>
          )}
        </Row>

        <Row icon={CalendarClock} label="ปีที่ต้องเก็บข้อมูลครั้งถัดไป">
          {registration.nextCollectionYear != null ? (
            <span className="font-mono text-sm font-semibold text-ink">
              {registration.nextCollectionYear}
            </span>
          ) : (
            // Distinguish "no next round" from "we do not know" — the first is a
            // fact about the project, the second is missing data.
            <span className="text-sm text-ink-muted">
              {registration.creditingEndDate ? 'สิ้นสุดช่วงคิดเครดิตแล้ว' : '—'}
            </span>
          )}
        </Row>

        <Row icon={Sprout} label={BASELINE_LABEL}>
          {baseline ? (
            <span className="text-sm text-ink">
              <span className="inline-flex items-center gap-1">
                <span className="font-mono font-semibold text-success">
                  {baseline.carbonTco2e.toFixed(2)} tCO₂e
                </span>
                {/* Every later round is measured against this number, so the
                    exact one has to stay reachable. */}
                {Number(baseline.carbonTco2e.toFixed(2)) !== baseline.carbonTco2e && (
                  <InfoTooltip label="ดูค่าเต็มของเส้นฐาน">
                    <p className="font-medium text-ink">ค่าที่ระบบเก็บจริง</p>
                    <p className="mt-1 break-all font-mono text-[11px] text-ink-secondary">
                      {baseline.carbonTco2e} tCO₂e
                    </p>
                  </InfoTooltip>
                )}
              </span>
              <span className="ml-1.5 text-[12px] text-ink-muted">
                {baseline.isThisSession
                  ? '· ตั้งจากรอบนี้'
                  : `· ตั้งเมื่อ ${formatDate(baseline.approvedAt)}`}
              </span>
            </span>
          ) : (
            <span className="text-sm text-ink-muted">ยังไม่ได้ตั้งเส้นฐาน</span>
          )}
        </Row>
      </dl>
    </section>
  )
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof FolderTree
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {label}
      </dt>
      <dd className="pl-5">{children}</dd>
    </div>
  )
}
