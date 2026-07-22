import type { ComponentType, SVGProps } from 'react'
import {
  TreePine,
  Ruler,
  ArrowUpFromLine,
  ImageOff,
  Copy,
  MapPinOff,
  TriangleAlert,
} from 'lucide-react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

/**
 * Thai labels for the vision model's anomaly flags (ADR 0022). Exported so the
 * verifier guide can list every flag a reviewer might meet, from one source.
 */
export const AI_FLAG_LABELS: Record<string, string> = {
  not_a_tree: 'ภาพอาจไม่ใช่ต้นไม้',
  dbh_photo_mismatch: 'ขนาดลำต้นไม่ตรงกับ DBH ที่แจ้ง',
  height_photo_mismatch: 'ความสูงไม่ตรงกับที่แจ้ง',
  low_image_quality: 'คุณภาพภาพต่ำ ตัดสินได้ยาก',
  duplicate_or_stock_photo: 'อาจเป็นภาพซ้ำหรือภาพสต๊อก',
  location_inconsistent: 'ฉากไม่สอดคล้องกับสถานที่ที่อ้าง',
}

/** Icon per flag code — pairs with the label so each chip reads at a glance. */
export const AI_FLAG_ICONS: Record<string, IconType> = {
  not_a_tree: TreePine,
  dbh_photo_mismatch: Ruler,
  height_photo_mismatch: ArrowUpFromLine,
  low_image_quality: ImageOff,
  duplicate_or_stock_photo: Copy,
  location_inconsistent: MapPinOff,
}

/** Human-readable Thai label for a flag code (falls back to the raw code). */
export function aiFlagLabel(flag: string): string {
  return AI_FLAG_LABELS[flag] ?? flag
}

/** Icon for a flag code (falls back to a generic warning triangle). */
export function aiFlagIcon(flag: string): IconType {
  return AI_FLAG_ICONS[flag] ?? TriangleAlert
}
