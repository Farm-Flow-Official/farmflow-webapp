/**
 * What we call a farm's reference carbon stock, in one place.
 *
 * **This wording is not settled.** The requirement says "Baseline (เส้นฐาน)",
 * but in T-VER that phrase normally means the *baseline scenario*
 * (business-as-usual) — a different thing from the initial carbon stock at t=0
 * that the system actually records. Putting the wrong one on a certification
 * document would confuse a VVB at exactly the wrong moment.
 *
 * So every user-facing string comes from here. When the VGREEN advisor rules,
 * changing these four constants changes the TAG, the dialog, the detail panel
 * and the PDF at once — no hunting through components.
 */
export const BASELINE_LABEL = 'Baseline (เส้นฐาน)'

/** Short form for badges and table cells, where the parenthetical will not fit. */
export const BASELINE_LABEL_SHORT = 'Baseline'

/** The checkbox on the approve dialog. */
export const BASELINE_ACTION_LABEL = 'บันทึกเป็นเส้นฐาน (Baseline) ของฟาร์มนี้'

/** One line explaining what setting a baseline commits the verifier to. */
export const BASELINE_HELP =
  'ปริมาณคาร์บอนของรอบนี้จะถูกใช้เป็นจุดอ้างอิงตั้งต้น (ปีที่ 0) ของฟาร์มในโครงการนี้ ' +
  'รอบถัดไปจะวัดส่วนที่เพิ่มขึ้นจากค่านี้ — ตั้งได้ครั้งเดียวต่อฟาร์มต่อโครงการ'
