import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { fetchBatchById } from '@/features/verifier/services/fetchBatchById'
import { batchSessionId, centroidTileUrl } from '@/features/verifier/lib/report'
import { PrintButton } from '@/features/verifier/components/PrintButton'
import { formatDate, formatNumber, formatDateTime } from '@/lib/utils/format'

export const metadata: Metadata = {
  title: 'รายงานการตรวจรับรอง — FarmFlow',
}

export default async function BatchReportPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const verifier = await getVerifierSession()
  if (!verifier) redirect('/verifier/login')

  const { batchId } = await params
  const batch = await fetchBatchById(batchId)
  if (!batch) notFound()

  const sessionId = batchSessionId(batch.id)
  const issuedAt = new Date().toISOString()

  const h = await headers()
  const host = h.get('host') ?? 'localhost:3001'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const verifyUrl = `${proto}://${host}/verifier/verify/qr-check?session_id=${sessionId}`
  const qr = await QRCode.toDataURL(verifyUrl, { width: 240, margin: 1 })

  const tileUrl = centroidTileUrl(batch.checkinLat, batch.checkinLng)

  return (
    <div className="min-h-screen bg-surface py-8 print:bg-white print:py-0">
      {/* Toolbar (screen only) */}
      <div className="mx-auto mb-6 flex max-w-[800px] items-center justify-between px-4 print:hidden">
        <Link
          href={`/verifier/batches/${batch.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          กลับไป batch
        </Link>
        <PrintButton />
      </div>

      {/* A4 sheet */}
      <article className="mx-auto max-w-[800px] bg-white p-10 text-ink shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* Header */}
        <header className="flex items-start justify-between border-b-2 border-primary pb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-primary">FarmFlow</p>
              <p className="text-[11px] text-ink-muted">Carbon Verification Report</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-ink-secondary">
            <p>
              เลขที่เอกสาร: <span className="font-mono text-ink">{sessionId}</span>
            </p>
            <p>ออกรายงานเมื่อ: {formatDateTime(issuedAt)}</p>
          </div>
        </header>

        <h1 className="mt-6 text-xl font-semibold">รายงานการตรวจรับรองคาร์บอน</h1>

        {/* Farm + satellite */}
        <section className="mt-5 grid grid-cols-[1fr_220px] gap-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="เกษตรกร" value={batch.ownerName} />
            <Field label="เบอร์ติดต่อ" value={batch.phone} mono />
            <Field label="ที่ตั้งฟาร์ม" value={batch.farmAddress} span2 />
            <Field
              label="พิกัด GPS"
              value={`${batch.checkinLat.toFixed(5)}, ${batch.checkinLng.toFixed(5)}`}
              mono
              span2
            />
            <Field label="ชื่อแปลง" value={batch.farmName} />
            <Field label="Batch" value={batch.id} mono />
          </dl>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tileUrl}
              alt="ภาพถ่ายดาวเทียมบริเวณแปลง"
              width={220}
              height={220}
              className="h-[160px] w-full rounded-lg border border-line object-cover"
            />
            <p className="mt-1 text-center text-[10px] text-ink-muted">
              ภาพถ่ายดาวเทียม (Esri)
            </p>
          </div>
        </section>

        {/* MRV summary */}
        <section className="mt-6">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            ข้อมูลการประเมิน (MRV)
          </h2>
          <div className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line">
            <Stat label="คาร์บอนรวม" value={`${formatNumber(batch.totalCarbonKgCo2e)} kgCO₂e`} />
            <Stat label="ความเชื่อมั่น AI เฉลี่ย" value={`${Math.round(batch.avgConfidence * 100)}%`} />
            <Stat label="จำนวนต้นไม้" value={`${batch.treeCount} ต้น`} />
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
            <p className="mt-3 border-t border-dashed border-line pt-1 text-xs text-ink-muted">
              ลงนามอิเล็กทรอนิกส์ · {formatDate(issuedAt)}
            </p>
          </div>
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR ตรวจสอบเอกสาร" width={110} height={110} className="h-[110px] w-[110px]" />
            <p className="mt-1 text-[10px] text-ink-muted">สแกนเพื่อตรวจสอบเอกสาร</p>
          </div>
        </section>

        <footer className="mt-8 border-t border-line pt-3 text-[10px] text-ink-muted">
          เอกสารนี้ออกโดยระบบ FarmFlow · ตรวจสอบความถูกต้องได้ที่ verifier.farmflow → /verify/qr-check
          (session: {sessionId})
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}
