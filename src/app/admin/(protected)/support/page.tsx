import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { MessageCircle, ExternalLink, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Support — FarmFlow Admin',
}

// FarmFlow LINE Official Account — the primary support/complaint channel for the
// prototype (business req: ticketing via LINE OA, no in-app ticket system).
const LINE_OA_URL = 'https://line.me/R/ti/p/@334uvoak'
const LINE_OA_ID = '@334uvoak'

export default async function SupportPage() {
  const qr = await QRCode.toDataURL(LINE_OA_URL, { width: 240, margin: 1 })

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Support
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          ช่องทางสนับสนุนและรับเรื่องร้องเรียน
        </p>
      </header>

      <div className="max-w-2xl">
        <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <MessageCircle className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">LINE Official Account</h2>
              <p className="text-xs text-ink-muted">ช่องทางสนับสนุนหลัก</p>
            </div>
          </div>

          <p className="text-sm text-ink-secondary">
            เกษตรกรและผู้ใช้งานสามารถติดต่อสอบถาม แจ้งปัญหา หรือร้องเรียน ผ่าน LINE
            Official Account ของ FarmFlow ทีม Support จะรับเรื่องและส่งต่อให้ทีมที่
            เกี่ยวข้อง (Verify / Finance) ตามความเหมาะสม
          </p>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                LINE OA ID
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-ink">{LINE_OA_ID}</p>
              <a
                href={LINE_OA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#06C755] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755] focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                เปิด LINE OA
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.9} />
              </a>
            </div>

            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="QR เพิ่มเพื่อน LINE OA FarmFlow"
                width={120}
                height={120}
                className="h-[120px] w-[120px] rounded-lg border border-line"
              />
              <p className="mt-1 text-[11px] text-ink-muted">สแกนเพื่อเพิ่มเพื่อน</p>
            </div>
          </div>
        </section>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-xs text-ink-secondary">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.75} />
          <span>
            ใน BETA ระบบรับเรื่องผ่าน LINE OA เป็นหลัก — ยังไม่มีระบบ ticket ในแอป
            (ระบบ ticket ในแอป + การ escalate ไว้พัฒนาในเฟส Production)
          </span>
        </div>
      </div>
    </div>
  )
}
