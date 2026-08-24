import { NotFoundPanel } from '@/components/ui/not-found-panel'

/**
 * The verifier-side twin of the admin 404: a project, session or tree that the
 * API did not return. Keeps the verifier inside Flow Verify rather than
 * dropping them at the portal chooser mid-review.
 */
export default function VerifierNotFound() {
  return (
    <NotFoundPanel
      title="ไม่พบข้อมูลที่เรียก"
      description="โครงการ เซสชัน หรือต้นไม้ที่เปิดอาจถูกลบไปแล้ว หรือยังไม่ถูกส่งเข้ามาให้ตรวจ"
      exits={[{ href: '/verifier/sessions', label: 'กลับไปคิวงานตรวจ' }]}
    />
  )
}
