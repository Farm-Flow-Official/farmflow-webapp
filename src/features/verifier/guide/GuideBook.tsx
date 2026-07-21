'use client'

import { GuideBookProvider } from '@/components/ui/guide-book'
import {
  VERIFIER_GUIDE_SECTIONS,
  type GuideSectionId,
} from '@/features/verifier/guide/content'

/** Section that answers "how do I do the thing on this screen?" per route. */
function resolveSection(pathname: string): GuideSectionId {
  if (/\/batches\/[^/]+\/tree\//.test(pathname)) return 'criteria'
  if (/\/batches\/[^/]+/.test(pathname)) return 'decision'
  return 'workflow'
}

/** Verifier portal guide — content only; the drawer lives in `ui/guide-book`. */
export function VerifierGuideProvider({ children }: { children: React.ReactNode }) {
  return (
    <GuideBookProvider
      sections={VERIFIER_GUIDE_SECTIONS}
      title="คู่มือผู้ตรวจสอบ"
      subtitle="วิธีตรวจรับรอง เกณฑ์ตัดสิน และคีย์ลัด"
      resolveSection={resolveSection}
      shortcutsSectionId="shortcuts"
    >
      {children}
    </GuideBookProvider>
  )
}
