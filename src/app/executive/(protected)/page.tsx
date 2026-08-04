import type { Metadata } from 'next'
import { Users, MapPin, Hourglass, TreePine, Sprout, FolderTree } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import { ApiFailurePanel } from '@/components/ui/api-failure'
import { describeApiFailure } from '@/lib/api/describe-failure'
import { fetchExecutiveOverview } from '@/features/executive/services/fetchExecutiveOverview'
import { buildSignals, formatTonnes } from '@/features/executive/lib'
import { ExecutiveHeader } from '@/features/executive/components/ExecutiveHeader'
import { ProjectScopePicker } from '@/features/executive/components/ProjectScopePicker'
import { SignalStrip } from '@/features/executive/components/SignalStrip'
import { EsgSection } from '@/features/executive/components/EsgSection'
import { CarbonHeroCard } from '@/features/executive/components/CarbonHeroCard'
import { ExecutiveKpiCard } from '@/features/executive/components/ExecutiveKpiCard'
import { CarbonTrendChart } from '@/features/executive/components/CarbonTrendChart'
import { SpeciesDonut } from '@/features/executive/components/SpeciesDonut'
import { CarbonFunnelBar } from '@/features/executive/components/CarbonFunnelBar'
import { ProjectDistribution } from '@/features/executive/components/ProjectDistribution'
import { ProjectMap } from '@/features/executive/components/ProjectMap'
import { GovernancePanel } from '@/features/executive/components/GovernancePanel'

export const metadata: Metadata = {
  title: 'ESG Executive Dashboard — FarmFlow',
}

type Search = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)

export default async function ExecutivePage({ searchParams }: { searchParams: Search }) {
  const projectId = one((await searchParams).project)

  let overview
  try {
    // Only the read sits in the try — building JSX inside one would put the
    // render outside the catch's reach.
    overview = await fetchExecutiveOverview(projectId)
  } catch (err) {
    // Next redacts server error messages in production, so the failure is
    // classified here and rendered in place rather than thrown at the boundary.
    return <ApiFailurePanel {...describeApiFailure(err, 'ภาพรวมเชิงบริหาร')} />
  }

  const {
    asOf,
    scope,
    projectOptions,
    target,
    marketPriceThbPerTon,
    kpis,
    trend,
    funnel,
    bySpecies,
    governance,
    byProject,
    impact,
  } = overview

  const activeProjectId = scope?.projectId

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <ExecutiveHeader asOf={asOf} scope={scope} />
        {/* One filter row, above everything it scopes — never inside a card. */}
        <ProjectScopePicker options={projectOptions} />
      </div>

      <SignalStrip signals={buildSignals(overview)} />

      <EsgSection pillar="environmental">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CarbonHeroCard
              certified={kpis.certified}
              target={target}
              marketPriceThbPerTon={marketPriceThbPerTon}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
            <ExecutiveKpiCard
              label="คาร์บอนในไปป์ไลน์"
              value={formatTonnes(kpis.pipeline.value)}
              unit="tCO₂e"
              sub={`${formatNumber(kpis.pipeline.pendingSessions)} เซสชันรอผู้ตรวจ`}
              hint="ประเมินแล้วแต่ผู้ตรวจสอบยังไม่ตัดสิน ไม่มีตัวเลขเทียบเดือนก่อนเพราะระบบไม่ได้เก็บประวัติของสถานะนี้"
              icon={Hourglass}
              pillar="environmental"
              trend={trend.map((p) => p.estimated - p.certified)}
            />
            <ExecutiveKpiCard
              label="ต้นไม้ที่บันทึกแล้ว"
              value={formatNumber(impact.treeSnapshots)}
              unit="ต้น"
              sub={`จาก ${formatNumber(impact.completedSessions)} เซสชันสำรวจที่สำเร็จ`}
              hint="ทุกต้นมีภาพถ่ายพร้อมพิกัดและเวลา เป็นหลักฐานตั้งต้นของคาร์บอนทุกตันบนหน้านี้"
              icon={TreePine}
              pillar="environmental"
            />
            <ExecutiveKpiCard
              label="ชนิดพันธุ์ไม้"
              value={formatNumber(impact.speciesCount)}
              unit="ชนิด"
              sub="ยิ่งหลากหลาย ยิ่งกระจายความเสี่ยง"
              hint="แต่ละชนิดใช้สมการ allometric ของ T-VER คนละชุด ความหลากหลายจึงมีผลทั้งเชิงนิเวศและเชิงการคำนวณ"
              icon={Sprout}
              pillar="environmental"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CarbonTrendChart data={trend} />
          </div>
          <SpeciesDonut data={bySpecies} />
        </div>

        <CarbonFunnelBar funnel={funnel} />
      </EsgSection>

      <EsgSection pillar="social">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ExecutiveKpiCard
            label="เกษตรกร Active"
            value={formatNumber(kpis.farmers.value)}
            kpi={kpis.farmers}
            unit="คน"
            sub={scope ? 'เจ้าของฟาร์มในโครงการนี้' : 'บัญชีที่ยังใช้งานอยู่'}
            icon={Users}
            pillar="social"
          />
          <ExecutiveKpiCard
            label="พื้นที่ฟาร์มรวม"
            value={formatNumber(Math.round(kpis.area.value))}
            kpi={kpis.area}
            unit="ไร่"
            sub={`${formatNumber(kpis.area.farms)} ฟาร์มที่ใช้งานอยู่`}
            icon={MapPin}
            pillar="social"
          />
          <ExecutiveKpiCard
            label="โครงการที่มีฟาร์ม"
            value={formatNumber(kpis.farmers.projects)}
            unit="โครงการ"
            sub={scope ? 'กำลังดูเฉพาะโครงการนี้' : 'มีฟาร์มเข้าร่วมแล้ว'}
            icon={FolderTree}
            pillar="social"
          />
          <ExecutiveKpiCard
            label="เซสชันสำรวจสำเร็จ"
            value={formatNumber(impact.completedSessions)}
            unit="ครั้ง"
            sub="งานภาคสนามที่เกษตรกรทำเสร็จแล้ว"
            icon={Sprout}
            pillar="social"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ProjectDistribution data={byProject} activeProjectId={activeProjectId} />
          <ProjectMap rows={byProject.rows} activeProjectId={activeProjectId} />
        </div>
      </EsgSection>

      <EsgSection pillar="governance">
        <GovernancePanel governance={governance} />
      </EsgSection>
    </div>
  )
}
