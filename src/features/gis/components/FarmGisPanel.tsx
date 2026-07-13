import Link from 'next/link'
import { X, MapPin, ExternalLink, TriangleAlert, Satellite } from 'lucide-react'
import {
  farmMapState,
  type FarmGeo,
  type FarmMapState,
  type FarmStatus,
  type GeeStatus,
} from '@/features/gis/types'

const GEE_META: Record<GeeStatus, { label: string; text: string; dot: string }> = {
  verified: { label: 'ผ่าน', text: 'text-success', dot: 'bg-gis-verified' },
  review: { label: 'ควรตรวจสอบ', text: 'text-warning', dot: 'bg-gis-pending' },
  failed: { label: 'ไม่ผ่าน (NDVI ต่ำ)', text: 'text-error', dot: 'bg-gis-flagged' },
}

const STATE_META: Record<FarmMapState, { label: string; dot: string; text: string }> = {
  flagged: { label: 'ทับซ้อน', dot: 'bg-gis-flagged', text: 'text-error' },
  pending: { label: 'รอตรวจสอบ', dot: 'bg-gis-pending', text: 'text-warning' },
  verified: { label: 'ผ่านการตรวจ', dot: 'bg-gis-verified', text: 'text-success' },
}

const FARM_STATUS_LABEL: Record<FarmStatus, string> = {
  Draft: 'ร่าง',
  Pending: 'รอตรวจสอบ',
  Active: 'ใช้งาน',
  Rejected: 'ปฏิเสธ',
  Suspended: 'ระงับ',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[13px] text-ink-muted">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-ink">{children}</dd>
    </div>
  )
}

export function FarmGisPanel({
  farm,
  onClose,
}: {
  farm: FarmGeo | null
  onClose: () => void
}) {
  if (!farm) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <MapPin className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-ink-secondary">เลือกแปลงบนแผนที่</p>
        <p className="text-[13px] text-ink-muted">คลิกพื้นที่แปลงเพื่อดูรายละเอียดและตรวจสอบ</p>
      </div>
    )
  }

  const state = farmMapState(farm)
  const meta = STATE_META[state]

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-ink">{farm.farmName}</h2>
          <span
            className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${meta.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
            {meta.label}
          </span>
        </div>
        <button
          type="button"
          aria-label="ปิด"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {farm.gee && farm.gee.status !== 'verified' && (
        <div className="mx-5 mt-3 flex items-start gap-2 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span>
            {farm.gee.status === 'failed'
              ? 'พื้นที่นี้น่าจะไม่ใช่พื้นที่เกษตร (เช่น แหล่งน้ำ สิ่งปลูกสร้าง หรือพื้นที่ว่าง) — ควรตรวจสอบก่อนรับรอง'
              : 'พืชพรรณเบาบาง ควรตรวจสอบภาพถ่ายดาวเทียมเพิ่มเติม'}
          </span>
        </div>
      )}

      <dl className="divide-y divide-line px-5 py-2">
        <Row label="Farm ID">
          <span className="font-mono">{farm.id}</span>
        </Row>
        <Row label="เกษตรกร">
          <Link
            href={`/admin/farmers/${farm.ownerUserId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {farm.ownerName ?? farm.ownerUserId}
            <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
          </Link>
        </Row>
        <Row label="พิกัด GPS">
          {farm.checkinLat != null && farm.checkinLng != null ? (
            <a
              href={`https://www.google.com/maps?q=${farm.checkinLat},${farm.checkinLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono tabular-nums text-primary hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {farm.checkinLat.toFixed(5)}, {farm.checkinLng.toFixed(5)}
              <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
            </a>
          ) : (
            <span className="text-ink-disabled">—</span>
          )}
        </Row>
        <Row label="พื้นที่ (คำนวณ)">
          <span className="font-mono tabular-nums">{farm.calculatedAreaRai} ไร่</span>
        </Row>
        {farm.areaDiscrepancyFlag && (
          <Row label="พื้นที่แจ้ง">
            <span className="inline-flex items-center gap-1 text-warning">
              <TriangleAlert className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="font-mono tabular-nums">{farm.declaredAreaRai} ไร่</span>
              <span className="text-[11px]">(ต่างเกิน 15%)</span>
            </span>
          </Row>
        )}
        {farm.overlapFlag && (
          <Row label="ทับซ้อน">
            <span className="font-mono tabular-nums text-error">
              {farm.overlapPercent != null ? `${farm.overlapPercent}%` : 'พบการทับซ้อน'}
            </span>
          </Row>
        )}
        <Row label="ตรวจสอบ GEE">
          {farm.gee ? (
            <span className={`inline-flex items-center gap-1.5 ${GEE_META[farm.gee.status].text}`}>
              <Satellite className="h-3.5 w-3.5" strokeWidth={1.75} />
              {GEE_META[farm.gee.status].label}
              <span className="font-mono text-xs text-ink-muted">
                (NDVI {farm.gee.ndvi.toFixed(2)})
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-ink-muted">
              <Satellite className="h-3.5 w-3.5" strokeWidth={1.75} />
              ยังไม่ได้ตรวจสอบ
            </span>
          )}
        </Row>
        <Row label="สถานะแปลง">{FARM_STATUS_LABEL[farm.farmStatus]}</Row>
      </dl>

      <div className="px-5 py-4">
        <Link
          href={`/admin/farmers/${farm.ownerUserId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          เปิดข้อมูลเกษตรกร (แท็บใหม่)
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}
