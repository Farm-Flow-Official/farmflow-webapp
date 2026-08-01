import {
  Compass,
  ScanSearch,
  Sparkles,
  Gavel,
  Sprout,
  Keyboard,
  Wrench,
} from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'
import { P, Steps, Note, Topic, Key, KeyGroup } from '@/components/ui/guide-parts'
import type { GuideSection } from '@/components/ui/guide-book'
import { CONFIDENCE_MIN } from '@/features/verifier/lib/confidence'
import { AI_FLAG_LABELS } from '@/features/verifier/lib/aiFlags'

export type GuideSectionId =
  | 'workflow'
  | 'criteria'
  | 'ai'
  | 'baseline'
  | 'decision'
  | 'shortcuts'
  | 'tools'

const PASS_PCT = Math.round(CONFIDENCE_MIN * 100)

/* ── Sections ───────────────────────────────────────────────────────────── */

export const VERIFIER_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'workflow',
    title: 'ขั้นตอนการตรวจรับรอง',
    summary: 'ภาพรวมงานตั้งแต่รับคิวจนออกใบรับรอง',
    icon: Compass,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          หน้าที่ของผู้ตรวจสอบ (Verifier) คือยืนยันว่าข้อมูลที่เกษตรกรส่งมา
          <span className="font-medium text-ink"> เป็นของจริง วัดจริง ในแปลงจริง </span>
          ก่อนที่ระบบจะออกใบรับรองคาร์บอน
        </P>
        <Steps
          items={[
            ['Dashboard', 'ดูจำนวน session ที่รอตรวจ และรายการที่ AI แจ้งเตือนว่าผิดปกติ'],
            ['Session Queue', 'เลือก session จากคิว — เริ่มจากรายการที่มีธงเตือนก่อน'],
            ['ตรวจข้อมูลแปลง', 'เทียบพื้นที่ที่แจ้ง vs ที่คำนวณจากขอบเขต และจุดเช็คอินบนแผนที่'],
            ['ไล่ดูภาพรายต้น', 'เปิดภาพแรกแล้วใช้ ← → ไล่ทีละต้น ดูผลตรวจสอบและเหตุผลของ AI'],
            ['ตัดสิน', 'อนุมัติเมื่อข้อมูลสอดคล้อง หรือปฏิเสธพร้อมระบุเหตุผลถึงเกษตรกร'],
            ['ส่งมอบหลักฐาน', 'เปิดรายงาน PDF ที่มี QR สำหรับตรวจสอบย้อนกลับ'],
          ]}
        />
      </div>
    ),
  },
  {
    id: 'criteria',
    title: 'เกณฑ์การตรวจสอบ',
    summary: `ความเชื่อมั่น AI ≥ ${PASS_PCT}% และพิกัดต้องอยู่ในแปลง`,
    icon: ScanSearch,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          ทุกภาพจะถูกตรวจอัตโนมัติ 2 ข้อ แสดงในกล่อง “ผลตรวจสอบความถูกต้อง”
          ของหน้าตรวจรายต้น
        </P>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">1. ความเชื่อมั่น AI</p>
          <ul className="flex flex-col gap-1.5 text-[13px]">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
              <span className="text-ink-secondary">
                <span className="font-mono font-semibold text-success">≥ {PASS_PCT}%</span> —
                ผ่านเกณฑ์
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
              <span className="text-ink-secondary">
                <span className="font-mono font-semibold text-warning">45–{PASS_PCT}%</span> —
                ไม่ผ่าน แต่ยังก้ำกึ่ง ควรดูภาพเองก่อนตัดสิน
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-error" />
              <span className="text-ink-secondary">
                <span className="font-mono font-semibold text-error">&lt; 45%</span> — ผิดปกติชัดเจน
              </span>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">2. ตำแหน่ง GPS</p>
          <P>
            ระบบเช็คว่าพิกัดที่ถ่ายภาพตกอยู่ใน<span className="font-medium text-ink">ขอบเขตแปลงที่ขึ้นทะเบียน</span>หรือไม่
            ภาพที่ถ่ายนอกแปลงคือสัญญาณ greenwashing ที่สำคัญที่สุด — หมุดสีแดงบนแผนที่เล็กหมายถึงอยู่นอกแปลง
          </P>
        </div>

        <Note>
          การตรวจ “สภาพอากาศ × เวลาถ่าย” ยังไม่เปิดใช้งาน เพราะยังไม่มีข้อมูลอากาศย้อนหลังมาเทียบ —
          ระบบจะไม่แสดงผลตรวจข้อนี้จนกว่าจะเชื่อมต่อจริง
        </Note>
      </div>
    ),
  },
  {
    id: 'ai',
    title: 'ผลประเมินภาพด้วย AI',
    summary: 'AI ช่วยจัดลำดับความเสี่ยง ไม่ได้ตัดสินแทนคุณ',
    icon: Sparkles,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          ทุกภาพจะถูกประเมินด้วยโมเดล vision ซึ่งให้ทั้ง
          <span className="font-medium text-ink"> คะแนนความเชื่อมั่น</span>,
          <span className="font-medium text-ink"> เหตุผลประกอบ</span> และ
          <span className="font-medium text-ink"> ธงเตือน</span> —
          ใช้เพื่อชี้เป้าว่าควรเพ่งภาพไหนเป็นพิเศษ การตัดสินขั้นสุดท้ายยังเป็นของผู้ตรวจสอบเสมอ
        </P>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">ธงเตือนที่พบได้</p>
          <ul className="flex flex-col gap-1">
            {Object.values(AI_FLAG_LABELS).map((label) => (
              <li key={label} className="flex items-start gap-2 text-[13px] text-ink-secondary">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-error" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <Note>
          ป้าย <span className="font-semibold text-ink">“ตรวจด้วยมือ”</span> บนภาพ
          หมายถึง AI ประเมินภาพนั้นไม่สำเร็จ (ไม่ใช่ว่าภาพผิดปกติ) — ให้ตรวจด้วยสายตาตามปกติ
        </Note>
      </div>
    ),
  },
  {
    id: 'baseline',
    title: 'เส้นฐาน (Baseline)',
    summary: 'จุดอ้างอิงตั้งต้นของฟาร์ม และตั้งได้ครั้งเดียว',
    icon: Sprout,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          เส้นฐานคือ<span className="font-medium text-ink">ปริมาณคาร์บอนตั้งต้น (ปีที่ 0)</span>{' '}
          ของฟาร์มในโครงการหนึ่ง ๆ — รอบถัดไปจะวัดว่าเพิ่มขึ้นจากค่านี้เท่าไร
        </P>
        <Topic title="ตั้งเมื่อไร">
          <P>
            ระบบจะติ๊กช่อง “บันทึกเป็นเส้นฐาน” ให้อัตโนมัติเมื่อเห็นว่าเป็นการอนุมัติครั้งแรก
            ของฟาร์มนี้ในโครงการนี้ — แต่<span className="font-medium text-ink">คุณเป็นคนยืนยัน</span>{' '}
            ถ้ารู้ว่าฟาร์มนี้เคยวัดมาก่อนแล้ว (เช่น ย้ายมาจากโครงการอื่น) ให้ติ๊กออก
          </P>
        </Topic>
        <Topic title="ตั้งได้ครั้งเดียว">
          <P>
            ฟาร์มหนึ่งมีเส้นฐานได้<span className="font-medium text-ink">หนึ่งค่าต่อหนึ่งโครงการ</span>{' '}
            และแก้จากหน้านี้ไม่ได้ — ถ้าตั้งผิด ต้องให้ผู้ดูแลระบบแก้ให้
            ดูให้แน่ก่อนกดอนุมัติ
          </P>
        </Topic>
        <Note>
          session ที่เป็นเส้นฐานจะมีป้าย <span className="font-semibold text-success">Baseline</span>{' '}
          สีเขียวในคิวและบนหน้ารายละเอียด · คำเรียกนี้อยู่ระหว่างยืนยันกับที่ปรึกษา VGREEN
          ว่าจะใช้ “เส้นฐาน” หรือ “ปริมาณคาร์บอนเริ่มต้น (t=0)” บนเอกสารทางการ
        </Note>
      </div>
    ),
  },
  {
    id: 'decision',
    title: 'การอนุมัติและปฏิเสธ',
    summary: 'ผลของการกดปุ่ม และสิ่งที่เกษตรกรจะได้รับ',
    icon: Gavel,
    body: (
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1 text-[13px] font-semibold text-warning">
            ตัดสินรายต้น — ทำก่อนเสมอ
          </p>
          <P>
            ในหน้าต้นไม้ ใต้ภาพถ่าย มีปุ่มสองปุ่มที่มีผลกับ
            <span className="font-medium text-ink">ต้นนั้นต้นเดียว</span> —
            ต้นอื่นและ session ไม่กระทบ และ session ยังอยู่ในคิวให้ตรวจต่อได้
          </P>
          <div className="mt-2 flex flex-col gap-2">
            <div className="rounded-lg border border-success/30 bg-success-bg px-3 py-2">
              <p className="text-[13px] font-semibold text-success">ยืนยันว่าใช้ได้</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
                AI ติดธงไว้ แต่ตรวจแล้วปกติ (เงาบัง มุมภาพแปลก) · ธงแดงหาย
                ต้นนี้กลายเป็นต้นปกติ และ
                <span className="font-medium text-ink">ยังนับคาร์บอนตามเดิม</span>
              </p>
            </div>
            <div className="rounded-lg border border-error-border bg-error-bg px-3 py-2">
              <p className="text-[13px] font-semibold text-error">ปฏิเสธต้นนี้</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
                ภาพใช้ไม่ได้จริง · เกษตรกรได้รับแจ้งเฉพาะต้นนั้นให้ถ่ายใหม่ และต้นนี้
                <span className="font-medium text-ink">ไม่ถูกนับคาร์บอน</span>ตอนอนุมัติ
              </p>
            </div>
          </div>
          <P>
            ตัดสินไปแล้วยัง<span className="font-medium text-ink">เปลี่ยนใจได้</span>{' '}
            ตราบใดที่ยังไม่ตัดสินทั้ง session — กดลิงก์ “เปลี่ยนเป็น…” ในกล่องผลการตัดสิน
          </P>
          <Note>
            คำตัดสินและคะแนนของ AI ยัง<span className="font-medium text-ink">แสดงอยู่เหมือนเดิม</span>{' '}
            หลังคุณตัดสินแล้ว — เก็บไว้เป็นหลักฐานว่าคุณตัดสินโดยเห็นอะไร ·
            ในหน้ารวมภาพ ต้นที่ตัดสินแล้วจะมีไอคอนเขียว/แดงมุมซ้ายบน และถูกจัดไปท้ายแถว
            เพื่อให้ต้นที่ยังไม่ได้ตรวจอยู่ข้างหน้าเสมอ
          </Note>
        </div>
        <div>
          <p className="mb-1 text-[13px] font-semibold text-success">อนุมัติ (Approve)</p>
          <P>
            ระบบจะออกใบรับรองพร้อมลายเซ็นและสังกัดของคุณ ออกคาร์บอนเครดิตตามจำนวนที่แสดงบนหน้าจอ
            (หักต้นที่ปฏิเสธไปแล้ว) และแจ้งผลถึงเกษตรกร
          </P>
          <P>
            ถ้าเป็นการอนุมัติ<span className="font-medium text-ink">ครั้งแรกของฟาร์มในโครงการนี้</span>{' '}
            ระบบจะติ๊ก “บันทึกเป็นเส้นฐาน (Baseline)” ไว้ให้ — ดูหัวข้อ{' '}
            <span className="font-medium text-ink">เส้นฐาน</span> ก่อนกด
          </P>
        </div>
        <div>
          <p className="mb-1 text-[13px] font-semibold text-error">ปฏิเสธทั้ง session (Reject)</p>
          <P>
            ใช้เมื่อทั้งชุดใช้ไม่ได้ เช่น ถ่ายผิดแปลงทั้งหมด ·{' '}
            <span className="font-medium text-ink">ต้องระบุเหตุผลเสมอ</span> — ข้อความนี้ถูกส่งถึง
            เกษตรกรโดยตรง จึงควรเขียนให้แก้ไขต่อได้ เช่น “ภาพทั้งชุดถ่ายนอกขอบเขตแปลง
            กรุณาถ่ายใหม่ในแปลงที่ขึ้นทะเบียน”
          </P>
        </div>
        <Note>
          ทั้งสองปุ่มมีขั้นยืนยันก่อนเสมอ (คีย์ลัดก็เช่นกัน) และแต่ละ session ตัดสินได้ครั้งเดียว —
          ถ้าขึ้นว่า “ชุดนี้ถูกตรวจไปแล้ว” แปลว่ามีผู้ตรวจสอบอีกคนตัดสินไปก่อนหน้า ·
          ตัดสินไปแล้วจะปฏิเสธต้นไม้รายต้นไม่ได้อีก เพราะเครดิตออกไปแล้ว
        </Note>
      </div>
    ),
  },
  {
    id: 'shortcuts',
    title: 'คีย์ลัด',
    summary: 'ตรวจทั้ง session ได้โดยไม่ต้องแตะเมาส์',
    icon: Keyboard,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          session หนึ่งมีภาพหลายสิบต้น การเอื้อมไปคลิกเมาส์ทุกภาพคือต้นทุนหลักของงานตรวจ —
          คีย์ลัดชุดนี้ออกแบบให้มือซ้ายอยู่กับแป้นพิมพ์ได้ตลอดการตรวจ
        </P>

        <KeyGroup title="หน้าตรวจต้นไม้รายต้น">
          <Key keys={['←', 'K']}>ภาพก่อนหน้า</Key>
          <Key keys={['→', 'J']}>ภาพถัดไป</Key>
          <Key keys={['F']}>ดูภาพเต็มจอ (กดซ้ำเพื่อปิด)</Key>
          <Key keys={['B', 'Esc']}>กลับไปหน้า session</Key>
        </KeyGroup>

        <KeyGroup title="หน้า session">
          <Key keys={['A']}>อนุมัติ session</Key>
          <Key keys={['R']}>ปฏิเสธ session</Key>
          <Key keys={['P']}>เปิดรายงาน PDF</Key>
          <Key keys={['B', 'Esc']}>กลับไปคิวงาน</Key>
        </KeyGroup>

        <KeyGroup title="ทั่วไป">
          <Key keys={['?']}>เปิดคู่มือที่หน้าคีย์ลัด</Key>
          <Key keys={['Esc']}>ปิดคู่มือหรือกล่องยืนยัน</Key>
          <Key keys={['⌘', 'Enter']}>ยืนยันในช่องเหตุผลการปฏิเสธ (Ctrl บน Windows)</Key>
          <Key keys={['Tab']}>เลื่อนโฟกัสตามลำดับ</Key>
        </KeyGroup>

        <Note>
          เคล็ดลับ: กด <Kbd>F</Kbd> ให้ภาพเต็มจอค้างไว้ แล้วกด <Kbd>←</Kbd> <Kbd>→</Kbd> รัวได้เลย
          — ภาพจะเปลี่ยนโดยไม่ต้องออกจากโหมดเต็มจอ เป็นวิธีตรวจที่เร็วที่สุด
        </Note>

        <Note>
          คีย์ลัดใช้ได้ทั้งผังแป้นพิมพ์ไทยและอังกฤษ และจะหยุดทำงานอัตโนมัติขณะพิมพ์ในช่องกรอกข้อความ
        </Note>
      </div>
    ),
  },
  {
    id: 'tools',
    title: 'เครื่องมือประกอบ',
    summary: 'รายงาน PDF และการตรวจสอบด้วย QR',
    icon: Wrench,
    body: (
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1 text-[13px] font-semibold text-ink">รายงาน PDF</p>
          <P>
            ปุ่ม “ดาวน์โหลด PDF” (หรือ <Kbd>P</Kbd>) เปิดรายงานฉบับพิมพ์ของ session
            พร้อม QR สำหรับตรวจสอบย้อนกลับ — สั่งพิมพ์แล้วเลือก “Save as PDF” จากกล่องพิมพ์ของเบราว์เซอร์
          </P>
        </div>
        <div>
          <p className="mb-1 text-[13px] font-semibold text-ink">QR Verify</p>
          <P>
            หน้าสาธารณะสำหรับตรวจสอบใบรับรองจาก QR ใช้ได้ทั้งผู้ซื้อคาร์บอนเครดิตและผู้ตรวจสอบภายนอก
            เปิดในแท็บใหม่เสมอ เพื่อไม่ให้หลุดจากงานที่ค้างอยู่
          </P>
        </div>
        <div>
          <p className="mb-1 text-[13px] font-semibold text-ink">แผนที่</p>
          <P>
            แผนที่เล็กทุกจุดกดขยายเต็มจอได้ ใช้เทียบขอบเขตแปลงกับจุดถ่ายภาพเมื่อผลตรวจ GPS ไม่ผ่าน
          </P>
        </div>
      </div>
    ),
  },
]
