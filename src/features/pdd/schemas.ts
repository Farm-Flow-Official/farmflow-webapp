import { z } from 'zod'

/**
 * Field rules for the PDD wizard.
 *
 * Each step gets two schemas from one definition. `submit` is the real thing —
 * what the official form demands. `draft` is the same shape with everything
 * optional, because a PDD is written over weeks and autosave must never refuse
 * a half-filled step. The server validates independently at submit; this exists
 * so the user sees the problem beside the field instead of after a round trip.
 */

/** Trim, and treat an empty string as "not answered" rather than an empty answer. */
const text = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .optional()

const requiredText = (message: string) => z.string().trim().min(1, message)

/** Optional numeric, already coerced by NumberField's `setValueAs`. */
const optionalNumber = z.number().nonnegative('ต้องไม่ติดลบ').optional()

/** Every step's schema pair, so the wizard can pick by mode. */
export type StepSchemas = { submit: z.ZodTypeAny; draft: z.ZodTypeAny }

// Each draft schema calls `.partial()` on its own object rather than going
// through a generic helper — a helper constrained to `ZodObject<ZodRawShape>`
// widens every field to `unknown`, which then propagates into the form types.

// ── Step 1 — project cover sheet (stored on `projects`) ─────────────────────

export const step1Submit = z.object({
  projectCode: requiredText('กรุณากรอกรหัสโครงการ'),
  nameTh: requiredText('กรุณากรอกชื่อโครงการภาษาไทย'),
  nameEn: requiredText('กรุณากรอกชื่อโครงการภาษาอังกฤษ'),
  implementationMode: z.enum(['standalone', 'bundled'], {
    message: 'กรุณาเลือกรูปแบบการดำเนินโครงการ',
  }),
  creditingPeriodYears: z
    .number({ message: 'กรุณาเลือกระยะเวลาคิดเครดิต' })
    .refine((v) => v === 7 || v === 10, 'ระยะเวลาคิดเครดิตต้องเป็น 7 หรือ 10 ปี'),
  creditingStartDate: requiredText('กรุณาระบุวันเริ่มคิดเครดิต'),
  creditingEndDate: requiredText('กรุณาระบุวันสิ้นสุดคิดเครดิต'),
  totalInvestmentMillionThb: z.number({ message: 'กรุณากรอกเงินลงทุน' }).nonnegative('ต้องไม่ติดลบ'),
  expectedReductionTco2eYr: z
    .number({ message: 'กรุณากรอกปริมาณก๊าซที่คาดว่าจะลด' })
    .nonnegative('ต้องไม่ติดลบ'),
})

export const step1Draft = step1Submit.partial()
export type Step1Values = z.input<typeof step1Draft>

// ── Step 2 — parties and document preparer ──────────────────────────────────

export const step2Submit = z.object({
  developerMain: requiredText('กรุณาระบุผู้พัฒนาโครงการหลัก'),
  developerCo: z.array(z.object({ name: text })).optional(),
  projectOwner: requiredText('กรุณาระบุเจ้าของโครงการ'),
  projectLocationText: requiredText('กรุณาระบุที่ตั้งโครงการ'),
  coordsUtmX: text,
  coordsUtmY: text,

  // §2C — document preparation
  preparerName: requiredText('กรุณาระบุชื่อผู้จัดทำ'),
  preparerPosition: requiredText('กรุณาระบุตำแหน่งผู้จัดทำ'),
  preparerOrg: requiredText('กรุณาระบุหน่วยงานผู้จัดทำ'),
  preparerPhone: requiredText('กรุณาระบุเบอร์ติดต่อ'),
})

export const step2Draft = step2Submit.partial()
export type Step2Values = z.input<typeof step2Draft>

// ── Step 3 — activities and scope ───────────────────────────────────────────

export const step3Submit = z.object({
  objective: requiredText('กรุณากรอกวัตถุประสงค์ของโครงการ'),
  orgBackground: requiredText('กรุณากรอกรายละเอียดหน่วยงาน/ชุมชน'),
  preProjectCondition: requiredText('กรุณาอธิบายสภาพก่อนมีโครงการ (baseline)'),
  projectActivities: requiredText('กรุณาอธิบายกิจกรรมของโครงการ'),
  materialsSource: text,
  expectedReductionNarrative: requiredText('กรุณาอธิบายปริมาณก๊าซที่คาดว่าจะลด'),
  technologyDesc: text,
  operationScope: requiredText('กรุณาอธิบายขอบเขตการดำเนินงาน'),
})

export const step3Draft = step3Submit.partial()
export type Step3Values = z.input<typeof step3Draft>

// ── Step 4 — registration conditions ────────────────────────────────────────

export const step4Submit = z
  .object({
    doubleCounting: z.enum(['none', 'yes'], { message: 'กรุณาระบุการนับซ้ำ' }),
    dcProjectName: text,
    dcMechanism: text,
    dcCreditPeriod: text,

    additionalityRequirement: z.enum(['not_required', 'required'], {
      message: 'กรุณาระบุภาระการพิสูจน์ Additionality',
    }),
    additionalityReasonNotReq: text,
    additionalityResult: z.enum(['has', 'none']).optional(),
    additionalityReason: text,

    projectStartDate: requiredText('กรุณาระบุวันเริ่มดำเนินโครงการ'),
    startDateReason: requiredText('กรุณาระบุเหตุผลของวันเริ่มโครงการ'),
  })
  // The conditional fields are only required once their trigger is chosen, so
  // they are checked here rather than being marked required outright.
  .superRefine((v, ctx) => {
    if (v.doubleCounting === 'yes') {
      if (!v.dcProjectName)
        ctx.addIssue({ code: 'custom', path: ['dcProjectName'], message: 'กรุณาระบุชื่อโครงการที่ขึ้นทะเบียนไว้' })
      if (!v.dcMechanism)
        ctx.addIssue({ code: 'custom', path: ['dcMechanism'], message: 'กรุณาระบุชื่อกลไก/มาตรฐาน' })
    }
    if (v.additionalityRequirement === 'required') {
      if (!v.additionalityResult)
        ctx.addIssue({ code: 'custom', path: ['additionalityResult'], message: 'กรุณาระบุผลการพิสูจน์' })
      if (!v.additionalityReason)
        ctx.addIssue({ code: 'custom', path: ['additionalityReason'], message: 'กรุณาระบุเหตุผลประกอบ' })
    } else if (v.additionalityRequirement === 'not_required' && !v.additionalityReasonNotReq) {
      ctx.addIssue({
        code: 'custom',
        path: ['additionalityReasonNotReq'],
        message: 'กรุณาระบุเหตุผลที่ไม่ต้องพิสูจน์',
      })
    }
  })

// `.superRefine` wraps the object, so the draft variant is built from the
// unwrapped shape — a half-filled step must not trip the cross-field rules.
export const step4Draft = z
  .object({
    doubleCounting: z.enum(['none', 'yes']),
    dcProjectName: text,
    dcMechanism: text,
    dcCreditPeriod: text,
    additionalityRequirement: z.enum(['not_required', 'required']),
    additionalityReasonNotReq: text,
    additionalityResult: z.enum(['has', 'none']),
    additionalityReason: text,
    projectStartDate: z.string(),
    startDateReason: z.string(),
  })
  .partial()
export type Step4Values = z.input<typeof step4Draft>

// ── Step 5 — land ───────────────────────────────────────────────────────────

export const LAND_TENURE_OPTIONS = [
  { value: 'chanote', label: 'โฉนด' },
  { value: 'nor_sor_3', label: 'น.ส.3 / น.ส.3ก' },
  { value: 'spk', label: 'ส.ป.ก.' },
  { value: 'community_forest', label: 'ป่าชุมชน' },
  { value: 'lease', label: 'เช่า' },
  { value: 'other', label: 'อื่น ๆ' },
] as const

export const step5Submit = z.object({
  landTenureType: z.enum(
    LAND_TENURE_OPTIONS.map((o) => o.value) as [string, ...string[]],
    { message: 'กรุณาเลือกสิทธิการใช้ประโยชน์ที่ดิน' },
  ),
  landTenureNote: text,
  hasPowerOfAttorney: z.boolean().optional(),
})

export const step5Draft = step5Submit.partial()
export type Step5Values = z.input<typeof step5Draft>

// ── Registry ────────────────────────────────────────────────────────────────

export const STEP_SCHEMAS: Record<string, StepSchemas> = {
  step1: { submit: step1Submit, draft: step1Draft },
  step2: { submit: step2Submit, draft: step2Draft },
  step3: { submit: step3Submit, draft: step3Draft },
  step4: { submit: step4Submit, draft: step4Draft },
  step5: { submit: step5Submit, draft: step5Draft },
}

export const optionalNumberSchema = optionalNumber
