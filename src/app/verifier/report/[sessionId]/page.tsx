import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { fetchSessionById } from '@/features/verifier/services/fetchSessionById'
import { sessionHref } from '@/features/verifier/lib/routes'
import {
  issuedSessionId,
  centroidTileUrl,
  plotOverlay,
  PLOT_VIEWBOX,
} from '@/features/verifier/lib/report'
import { PrintButton } from '@/features/verifier/components/PrintButton'
import {
  formatDate,
  formatDateTime,
  formatCarbonTonnes,
  formatCarbonExact,
} from '@/lib/utils/format'

export const metadata: Metadata = {
  title: 'รายงานการตรวจรับรอง — FarmFlow',
}

export default async function SessionReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const verifier = await getVerifierSession()
  if (!verifier) redirect('/verifier/login')

  const { sessionId } = await params
  const session = await fetchSessionById(sessionId)
  if (!session) notFound()

  // The id printed on the certificate is not the internal one — see
  // `issuedSessionId`. Kept distinct from the route's `sessionId`.
  const documentId = issuedSessionId(session.id)
  const issuedAt = new Date().toISOString()

  const h = await headers()
  const host = h.get('host') ?? 'localhost:3001'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const verifyUrl = `${proto}://${host}/verifier/verify/qr-check?session_id=${documentId}`
  const qr = await QRCode.toDataURL(verifyUrl, { width: 240, margin: 1 })

  /**
   * Approved sessions are reported from the record frozen at approval; pending
   * ones from a live count, clearly labelled as provisional.
   *
   * The two agree right up until they do not — a tree re-reviewed after the
   * fact would move the live figure while the credits already issued stayed
   * where they were. A certificate must cite what was issued, so once there is
   * a decision, that is the only thing this page reads.
   */
  const certified = session.result
  const certifiedTrees = certified?.passedTrees ?? session.tally.passed
  const rejectedTrees = certified?.rejectedTrees ?? session.tally.rejected
  const certifiedCarbonKg =
    certified?.approvedTco2e != null ? certified.approvedTco2e * 1000 : session.totalCarbonKgCo2e

  // VERIFIER-DETAIL-03 — draw the plot on the imagery when we have a boundary,
  // so the document shows *which* land was assessed rather than just some land.
  const overlay = plotOverlay(session.polygon)
  const tileUrl =
    overlay?.imageUrl ??
    centroidTileUrl(session.checkinLat ?? 13.7563, session.checkinLng ?? 100.5018)

  return (
    <div className="min-h-screen bg-surface py-8 print:bg-white print:py-0">
      {/* Toolbar (screen only) */}
      <div className="mx-auto mb-6 flex max-w-[800px] items-center justify-between px-4 print:hidden">
        <Link
          href={sessionHref(session.projectId, session.id)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          กลับไป session
        </Link>
        <PrintButton />
      </div>

      {/* A4 sheet */}
      <article className="mx-auto max-w-[800px] bg-white p-10 text-ink shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* Header */}
        <header className="flex items-start justify-between border-b-2 border-primary pb-5">
          <div className="flex items-center gap-2.5">
            <Logo size={38} />
            <div>
              <p className="text-lg font-bold tracking-tight text-primary">FarmFlow</p>
              <p className="text-[11px] text-ink-muted">Carbon Verification Report</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-ink-secondary">
            <p>
              เลขที่เอกสาร: <span className="font-mono text-ink">{documentId}</span>
            </p>
            <p>
              {certified
                ? `วันที่ตรวจรับรอง: ${formatDateTime(certified.reviewedAt)}`
                : 'ยังไม่ผ่านการตรวจรับรอง'}
            </p>
            <p className="text-ink-muted">พิมพ์เมื่อ: {formatDateTime(issuedAt)}</p>
          </div>
        </header>

        <h1 className="mt-6 text-xl font-semibold">รายงานการตรวจรับรองคาร์บอน</h1>

        {/* Printed before a decision, this page is identical to the real thing
            in every respect that matters to someone holding it. Say plainly
            that it is not one. */}
        {!certified && (
          <p className="mt-3 rounded-lg border border-warning-border bg-warning-bg px-4 py-2.5 text-[13px] font-medium text-warning print:border-black print:bg-white print:text-black">
            เอกสารชั่วคราว — รอบตรวจนี้ยังไม่ผ่านการตรวจรับรอง
            ตัวเลขทั้งหมดเป็นค่าปัจจุบันที่ยังเปลี่ยนได้ ใช้อ้างอิงเป็นทางการไม่ได้
          </p>
        )}

        {/* Farm + satellite */}
        <section className="mt-5 grid grid-cols-[1fr_220px] gap-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="เกษตรกร" value={session.ownerName} />
            <Field label="เบอร์ติดต่อ" value={session.phone ?? '—'} mono />
            <Field label="ที่ตั้งฟาร์ม" value={session.farmAddress ?? '—'} span2 />
            <Field
              label="พิกัด GPS"
              value={session.checkinLat != null && session.checkinLng != null
                ? `${session.checkinLat.toFixed(5)}, ${session.checkinLng.toFixed(5)}`
                : '—'}
              mono
              span2
            />
            <Field label="ชื่อแปลง" value={session.farmName} />
            <Field label="Session ID" value={session.id} mono />
          </dl>
          <div>
            <div className="relative h-[160px] w-full overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tileUrl}
                alt="ภาพถ่ายดาวเทียมบริเวณแปลง"
                width={220}
                height={220}
                className="h-full w-full object-cover"
              />
              {overlay && (
                // Same coordinate space as the requested image, so the outline
                // stays registered to the ground however the print engine sizes
                // it. A thin stroke plus a light fill: the boundary has to be
                // unmistakable without hiding the ground it evidences.
                <svg
                  viewBox={PLOT_VIEWBOX}
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden
                >
                  <polygon
                    points={overlay.points}
                    fill="#FACC15"
                    fillOpacity={0.18}
                    stroke="#FACC15"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              )}
            </div>
            <p className="mt-1 text-center text-[10px] text-ink-muted">
              ภาพถ่ายดาวเทียม (Esri)
              {overlay && ' · เส้นสีเหลือง = ขอบเขตแปลงที่ขึ้นทะเบียน'}
            </p>
          </div>
        </section>

        {/* MRV summary */}
        <section className="mt-6">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            ข้อมูลการประเมิน (MRV)
          </h2>
          <div className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line">
            {/*
              Printed, so the "tap for the exact value" affordance used on screen
              is useless here — the full figure goes on the page itself, small,
              under the rounded one. A certificate that only carries a rounded
              number cannot be reconciled against the ledger later.
            */}
            <Stat
              label="คาร์บอนรวม"
              value={formatCarbonTonnes(certifiedCarbonKg)}
              sub={formatCarbonExact(certifiedCarbonKg)}
            />
            <Stat label="ความเชื่อมั่น AI เฉลี่ย" value={`${Math.round(session.avgConfidence * 100)}%`} />
            {/*
              The certified count, not the submitted one. This document is a
              claim about issued credits, and the carbon beside it is computed
              from these trees alone — pairing it with "how many were sent in"
              gives a reader two numbers that cannot be reconciled. What was
              sent in stays on the page, underneath, because leaving it out
              would hide the rejections.
            */}
            <Stat
              label="จำนวนต้นไม้ที่ผ่านการรับรอง"
              value={`${certifiedTrees} ต้น`}
              sub={`จากที่ส่งมา ${session.tally.submitted} ต้น · ปฏิเสธ ${rejectedTrees} ต้น${
                session.tally.unassessed > 0
                  ? ` · ไม่มีผลประเมิน ${session.tally.unassessed} ต้น`
                  : ''
              }`}
            />
          </div>
        </section>

        {/* Signature + QR */}
        <section className="mt-8 flex items-end justify-between gap-6">
          <div className="text-sm">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              ผู้ตรวจรับรอง
            </h2>
            <p className="font-medium text-ink">{verifier.username}</p>
            <p className="text-xs text-ink-muted">หน่วยงาน: {verifier.org}</p>
            {/* The signature is dated when the decision was made, not when
                somebody pressed print — otherwise the same certificate reissued
                next month carries a different signing date. */}
            <p className="mt-3 border-t border-dashed border-line pt-1 text-xs text-ink-muted">
              {certified
                ? `ลงนามอิเล็กทรอนิกส์ · ${formatDate(certified.reviewedAt)}`
                : 'ยังไม่ได้ลงนาม — รอผลการตรวจรับรอง'}
            </p>
          </div>
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR ตรวจสอบเอกสาร" width={110} height={110} className="h-[110px] w-[110px]" />
            <p className="mt-1 text-[10px] text-ink-muted">สแกนเพื่อตรวจสอบเอกสาร</p>
          </div>
        </section>

        {/*
          Printed on a document a third party may act on, so it has to name a
          page that exists. It previously said `/verify/qr-check`, which 404s —
          the public checker lives under `/verifier/`. The QR above encodes this
          same URL, so the two can no longer disagree.
        */}
        <footer className="mt-8 border-t border-line pt-3 text-[10px] text-ink-muted">
          เอกสารนี้ออกโดยระบบ FarmFlow · ตรวจสอบความถูกต้องได้ที่{' '}
          <span className="font-mono">{verifyUrl}</span>
        </footer>
      </article>
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  span2,
}: {
  label: string
  value: string
  mono?: boolean
  span2?: boolean
}) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className={`text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-3 py-2.5">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-ink">{value}</p>
      {sub && <p className="mt-0.5 break-all font-mono text-[9px] leading-tight text-ink-muted">{sub}</p>}
    </div>
  )
}
