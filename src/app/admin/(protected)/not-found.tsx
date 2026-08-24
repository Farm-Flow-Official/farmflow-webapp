import { NotFoundPanel } from '@/components/ui/not-found-panel'

/**
 * Reached when an admin screen calls `notFound()` — a farm, farmer, project or
 * PDD whose id resolved to nothing. Renders inside the admin layout, so the
 * sidebar stays put and the reader can see they are still signed in and still
 * inside Flow Control.
 *
 * The wording says the record is missing rather than the page, because the URL
 * was right: whatever it pointed at is gone.
 */
export default function AdminNotFound() {
  return (
    <NotFoundPanel
      title="ไม่พบข้อมูลที่เรียก"
      description="รายการนี้อาจถูกลบไปแล้ว หรือลิงก์ที่ใช้เปิดชี้ไปยังรหัสที่ไม่มีอยู่ในระบบ"
      exits={[{ href: '/admin', label: 'กลับหน้า Dashboard' }]}
    />
  )
}
