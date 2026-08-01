'use client'

import { useState } from 'react'
import { Map, TriangleAlert, CircleHelp, CircleCheck, Loader2, UploadCloud } from 'lucide-react'
import { importBoundary } from '@/features/pdd/actions/pddActions'
import type { PddDetail } from '@/features/pdd/types'

/**
 * The KMZ/KML import and its consequences.
 *
 * The declared boundary and the farms checked against it belong on one screen:
 * uploading the file is the moment the reconciliation becomes meaningful, and
 * separating cause from effect would leave the author guessing why a farm is
 * suddenly flagged.
 */
export function BoundaryPanel({
  pdd,
  editable,
  onImported,
  onError,
}: {
  pdd: PddDetail
  editable: boolean
  onImported: (summary: { polygonCount: number; declaredAreaRai: number | null }) => void
  onError: (message: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const { declaredAreaRai, effectiveAreaRai, farmsOutside, farmsUnknown } = pdd.reconciliation
  const boundaryFile = pdd.attachments.find((a) => a.slot === 'boundary_kmz')
  const hasBoundary = declaredAreaRai != null

  async function handleFile(file: File | undefined) {
    if (!file) return
    setLocalError(null)
    setBusy(true)

    const form = new FormData()
    form.append('file', file)
    const res = await importBoundary(pdd.projectId, pdd.id, form)
    setBusy(false)

    if (!res.ok) {
      setLocalError(res.error)
      onError(res.error)
      return
    }
    onImported({ polygonCount: res.data.polygonCount, declaredAreaRai: res.data.declaredAreaRai })
  }

  return (
    <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Map className="h-4 w-4 text-primary" strokeWidth={2} />
        ขอบเขตพื้นที่โครงการ (KMZ / KML)
      </h3>
      <p className="mt-0.5 text-xs text-ink-muted">
        ฟอร์ม อบก. บังคับแนบไฟล์ขอบเขต — ระบบจะอ่านรูปหลายเหลี่ยมจากไฟล์ไปเป็นขอบเขตที่ประกาศ
      </p>

      {/* Upload */}
      {editable && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void handleFile(e.dataTransfer.files?.[0])
          }}
          className={`mt-4 rounded-lg border border-dashed transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-line bg-surface'
          }`}
        >
          <label className="flex cursor-pointer flex-col items-center gap-1.5 px-4 py-6 text-center">
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={1.75} />
            ) : (
              <UploadCloud className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
            )}
            <span className="text-sm text-ink-secondary">
              {busy
                ? 'กำลังอ่านไฟล์ขอบเขต…'
                : boundaryFile
                  ? 'อัปโหลดไฟล์ใหม่เพื่อแทนที่ขอบเขตเดิม'
                  : 'ลากไฟล์ .kmz หรือ .kml มาวาง หรือกดเพื่อเลือก'}
            </span>
            <span className="text-xs text-ink-muted">
              รับเฉพาะรูปหลายเหลี่ยมปิด — หมุดและเส้นทางจะถูกปฏิเสธ
            </span>
            <input
              type="file"
              accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz"
              disabled={busy}
              onChange={(e) => void handleFile(e.target.files?.[0] ?? undefined)}
              className="sr-only"
            />
          </label>
        </div>
      )}

      {localError && (
        <p role="alert" className="mt-2 text-xs text-error">
          {localError}
        </p>
      )}

      {boundaryFile && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-secondary">
          <CircleCheck className="h-3.5 w-3.5 text-success" strokeWidth={2} />
          ไฟล์ที่ยื่น: <span className="font-medium text-ink">{boundaryFile.displayName}</span>
        </p>
      )}

      {/* Declared vs effective */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AreaTile
          label="พื้นที่ที่ประกาศ"
          value={declaredAreaRai}
          hint="จากไฟล์ KMZ/KML ที่แนบ"
        />
        <AreaTile
          label="พื้นที่จริงจากฟาร์มสมาชิก"
          value={effectiveAreaRai}
          hint="รวมขอบเขตฟาร์มที่เข้าร่วม (ไม่นับซ้ำ)"
        />
      </div>

      {/* Reconciliation */}
      {hasBoundary && (
        <div className="mt-4 flex flex-col gap-2">
          {farmsOutside.length > 0 && (
            <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-error">
                <TriangleAlert className="h-4 w-4" strokeWidth={2} />
                {farmsOutside.length} ฟาร์มอยู่นอกขอบเขตที่ประกาศ
              </p>
              <p className="mt-1 text-xs text-error/90">
                พื้นที่ที่จะออกเครดิตอยู่นอกขอบเขตที่ยื่นต่อ อบก. — ต้องแก้ขอบเขตหรือถอนฟาร์มออก
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {farmsOutside.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-full bg-panel px-2.5 py-1 text-xs font-medium text-error"
                  >
                    {f.farmName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {farmsUnknown.length > 0 && (
            <div className="rounded-lg border border-line bg-surface px-4 py-3">
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <CircleHelp className="h-4 w-4 text-ink-muted" strokeWidth={2} />
                {farmsUnknown.length} ฟาร์มยังไม่ได้ปักขอบเขต
              </p>
              {/* Not an accusation — these farms simply have not been mapped yet. */}
              <p className="mt-1 text-xs text-ink-muted">
                ยังตรวจสอบไม่ได้ว่าอยู่ในขอบเขตหรือไม่ จนกว่าเกษตรกรจะปักขอบเขตฟาร์มในแอป
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {farmsUnknown.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-full bg-panel px-2.5 py-1 text-xs text-ink-secondary"
                  >
                    {f.farmName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {farmsOutside.length === 0 && farmsUnknown.length === 0 && (
            <p className="flex items-center gap-1.5 rounded-lg border border-line bg-success-bg px-4 py-3 text-sm text-success">
              <CircleCheck className="h-4 w-4" strokeWidth={2} />
              ฟาร์มสมาชิกทุกแห่งอยู่ในขอบเขตที่ประกาศ
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function AreaTile({
  label,
  value,
  hint,
}: {
  label: string
  value: number | null
  hint: string
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
        {value != null ? `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ไร่` : '—'}
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>
    </div>
  )
}
