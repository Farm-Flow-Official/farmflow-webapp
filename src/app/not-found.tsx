import type { Metadata } from 'next'
import { NotFoundPanel } from '@/components/ui/not-found-panel'

export const metadata: Metadata = {
  title: 'ไม่พบหน้านี้ — FarmFlow',
}

/**
 * The app-wide 404. Next routes every unmatched URL here, whatever realm it
 * looked like it was aiming for, because a nested `not-found.tsx` only catches
 * an explicit `notFound()` call in its own segment.
 *
 * It deliberately does not read the session to work out who is lost. That would
 * put an API round-trip on a route every bot that scans for /wp-admin can
 * reach, to save a signed-in admin exactly one click — the portal chooser they
 * land on still has their session, so nothing is lost but a moment.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface">
      <NotFoundPanel
        title="ไม่พบหน้าที่คุณกำลังหา"
        description="ที่อยู่นี้อาจพิมพ์ผิด หรือหน้าเดิมถูกย้ายไปแล้ว ลองกลับไปตั้งต้นที่หน้าเลือกพอร์ทัล"
        exits={[
          { href: '/', label: 'หน้าแรก FarmFlow' },
          { href: '/verifier/verify/qr-check', label: 'ตรวจสอบเอกสารคาร์บอนเครดิต' },
        ]}
      />
    </main>
  )
}
