import { Compass, Users, Map, Megaphone, ShieldCheck, Keyboard } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'
import { P, Steps, Note, Topic, Key, KeyGroup } from '@/components/ui/guide-parts'
import type { GuideSection } from '@/components/ui/guide-book'

export type AdminGuideSectionId =
  | 'overview'
  | 'farmers'
  | 'gis'
  | 'content'
  | 'system'
  | 'shortcuts'

export const ADMIN_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'overview',
    title: 'ภาพรวมระบบหลังบ้าน',
    summary: 'แต่ละเมนูดูแลอะไร และเริ่มจากตรงไหน',
    icon: Compass,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          Admin Dashboard คือศูนย์กลางดูแล<span className="font-medium text-ink">ข้อมูลตั้งต้นของทั้งระบบ</span> —
          บัญชีเกษตรกร ขอบเขตแปลง ประกาศ และการตั้งค่า ส่วนการตรวจรับรองคาร์บอนเป็นงานของ Verifier Portal
          แยกออกไปอีกระบบ
        </P>
        <Steps
          items={[
            ['Dashboard', 'ตัวเลขรวมของระบบ — จำนวนเกษตรกร คาร์บอน ยอดเงิน และรายการที่ต้องดูแล'],
            ['Farmer Management', 'ค้นหาบัญชีเกษตรกร ดูฟาร์มในสังกัด ระงับหรือเปิดใช้งานบัญชี'],
            ['GIS Map', 'ดูขอบเขตแปลงทั้งหมดบนแผนที่ และหาแปลงที่ทับซ้อนกัน'],
            ['Announcements', 'เขียนประกาศที่ขึ้นในแอปของเกษตรกร'],
            ['System', 'ตั้งค่าระบบ ผู้ดูแล และตรวจ Audit Log ย้อนหลัง'],
          ]}
        />
        <Note>
          ทุกเมนูกดไปได้ด้วยคีย์ลัด <Kbd>G</Kbd> แล้วตามด้วยตัวอักษร — ดูหัวข้อ “คีย์ลัด”
        </Note>
      </div>
    ),
  },
  {
    id: 'farmers',
    title: 'จัดการบัญชีเกษตรกร',
    summary: 'ค้นหา ดูโปรไฟล์ และระงับ/เปิดใช้งานบัญชี',
    icon: Users,
    body: (
      <div className="flex flex-col gap-4">
        <Topic title="ค้นหา">
          <P>
            ช่องค้นหารับได้ทั้ง<span className="font-medium text-ink">ชื่อ เบอร์โทร และ Farmer ID</span> —
            เบอร์โทรพิมพ์ติดกันหรือมีขีดก็ได้ ระบบเทียบเฉพาะตัวเลข กด <Kbd>/</Kbd>{' '}
            เพื่อกระโดดเข้าช่องค้นหาจากที่ไหนก็ได้ในหน้า
          </P>
        </Topic>
        <Topic title="เปิดโปรไฟล์">
          <P>
            คลิกที่แถวไหนก็ได้เพื่อเปิดโปรไฟล์เกษตรกร — ในนั้นมีฟาร์มทั้งหมดในสังกัด
            พร้อมพื้นที่และคาร์บอนสะสมรายแปลง
          </P>
        </Topic>
        <Topic title="ระงับบัญชี">
          <P>
            การระงับทำให้เกษตรกร<span className="font-medium text-ink">เข้าใช้งานแอปไม่ได้</span>ทันที
            จนกว่าจะกดเปิดใช้งานอีกครั้ง — ข้อมูลและฟาร์มเดิมไม่ถูกลบ
            ใช้กับกรณีทุจริตหรือข้อมูลน่าสงสัยที่ยังตรวจไม่จบ
          </P>
        </Topic>
        <Note>
          การระงับ/เปิดใช้งานถูกบันทึกใน Audit Log ทุกครั้ง พร้อมชื่อผู้ดูแลที่กด —
          ตรวจย้อนหลังได้เสมอว่าใครทำอะไรเมื่อไร
        </Note>
      </div>
    ),
  },
  {
    id: 'gis',
    title: 'แผนที่แปลง (GIS)',
    summary: 'อ่านสีบนแผนที่ และจัดการแปลงทับซ้อน',
    icon: Map,
    body: (
      <div className="flex flex-col gap-4">
        <P>แต่ละแปลงระบายสีตามสถานะการตรวจสอบ</P>
        <ul className="flex flex-col gap-1.5 text-[13px]">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gis-verified" />
            <span className="text-ink-secondary">ผ่านการตรวจแล้ว</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gis-pending" />
            <span className="text-ink-secondary">รอตรวจสอบ</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gis-flagged" />
            <span className="text-ink-secondary">ทับซ้อนกับแปลงอื่น</span>
          </li>
        </ul>
        <Topic title="แปลงทับซ้อนสำคัญอย่างไร">
          <P>
            ขอบเขตที่ทับกันหมายถึงพื้นที่เดียวถูกนับคาร์บอนซ้ำสองครั้ง (double counting)
            ซึ่งเป็นความเสี่ยงที่ผู้ซื้อเครดิตตรวจเข้มที่สุด — ใช้ตัวกรอง
            “เฉพาะที่ทับซ้อน” เพื่อไล่เคลียร์ทีละแปลง
          </P>
        </Topic>
        <Note>
          กรองตามจังหวัดและค้นหาชื่อแปลงได้จากแถบด้านบนของแผนที่ · กด <Kbd>/</Kbd> เข้าช่องค้นหา
        </Note>
      </div>
    ),
  },
  {
    id: 'content',
    title: 'ประกาศถึงเกษตรกร',
    summary: 'ฉบับร่างกับเผยแพร่ต่างกันอย่างไร',
    icon: Megaphone,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          ประกาศที่ตั้งเป็น<span className="font-medium text-success">เผยแพร่</span>
          จะขึ้นในแอปของเกษตรกร<span className="font-medium text-ink">ทุกคนทันที</span> ส่วน
          <span className="font-medium text-ink"> ฉบับร่าง</span> เก็บไว้แก้ต่อได้โดยยังไม่มีใครเห็น
        </P>
        <Note>
          เขียนเสร็จแล้วยังไม่แน่ใจ ให้บันทึกเป็นฉบับร่างก่อนเสมอ — การเผยแพร่ไม่มีขั้นอนุมัติซ้ำ
          ข้อความจะถึงเกษตรกรทันทีที่กด
        </Note>
      </div>
    ),
  },
  {
    id: 'system',
    title: 'ตั้งค่าระบบและร่องรอยการใช้งาน',
    summary: 'ราคาตลาด สิทธิ์ผู้ดูแล และ Audit Log',
    icon: ShieldCheck,
    body: (
      <div className="flex flex-col gap-4">
        <Topic title="System Settings">
          <P>
            ตั้งค่าตัวแปรระดับระบบ เช่น<span className="font-medium text-ink">ราคาคาร์บอนต่อหน่วย</span>{' '}
            ที่ใช้คำนวณรายได้ให้เกษตรกรทั้งระบบ — เปลี่ยนแล้วมีผลกับทุกบัญชี
            จึงสงวนไว้ให้ Super Admin เท่านั้น
          </P>
        </Topic>
        <Topic title="Admin Users">
          <P>จัดการบัญชีผู้ดูแลและสิทธิ์การเข้าถึงแต่ละส่วนของระบบหลังบ้าน</P>
        </Topic>
        <Topic title="Audit Log">
          <P>
            บันทึกทุกการกระทำที่เปลี่ยนแปลงข้อมูล — ใคร ทำอะไร กับใคร เมื่อไร
            ใช้ตอบคำถามตรวจสอบย้อนหลังและเป็นหลักฐานประกอบมาตรฐานคาร์บอนเครดิต
          </P>
        </Topic>
      </div>
    ),
  },
  {
    id: 'shortcuts',
    title: 'คีย์ลัด',
    summary: 'กด G ตามด้วยตัวอักษรเพื่อกระโดดข้ามเมนู',
    icon: Keyboard,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          งานหลังบ้านคือการสลับหน้าไปมาทั้งวัน คีย์ลัดชุดนี้จึงเน้น
          <span className="font-medium text-ink">การกระโดดข้ามเมนู</span> — กด <Kbd>G</Kbd>{' '}
          ค้างไว้ไม่ต้อง แค่กดแล้วปล่อย จากนั้นกดตัวอักษรปลายทาง
          (มีป้ายเล็ก ๆ ขึ้นมุมจอบอกว่ากำลังรอปุ่มที่สอง)
        </P>

        <KeyGroup title="ไปยังหน้า (กด G ก่อน)">
          <Key keys={['G', 'D']}>Dashboard</Key>
          <Key keys={['G', 'F']}>Farmer Management</Key>
          <Key keys={['G', 'M']}>GIS Map</Key>
          <Key keys={['G', 'A']}>Announcements</Key>
          <Key keys={['G', 'S']}>System Settings</Key>
          <Key keys={['G', 'L']}>Audit Log</Key>
          <Key keys={['G', 'U']}>Admin Users</Key>
          <Key keys={['G', 'T']}>Support Tickets</Key>
        </KeyGroup>

        <KeyGroup title="ในหน้าที่มีตาราง">
          <Key keys={['/']}>กระโดดเข้าช่องค้นหา</Key>
          <Key keys={['Esc']}>ออกจากช่องค้นหา (ข้อความที่พิมพ์ยังอยู่)</Key>
        </KeyGroup>

        <KeyGroup title="ทั่วไป">
          <Key keys={['?']}>เปิดคู่มือที่หน้าคีย์ลัด</Key>
          <Key keys={['Esc']}>ปิดคู่มือหรือกล่องยืนยัน</Key>
          <Key keys={['Tab']}>เลื่อนโฟกัสตามลำดับ</Key>
        </KeyGroup>

        <Note>
          คีย์ลัดใช้ได้ทั้งผังแป้นพิมพ์ไทยและอังกฤษ และจะหยุดทำงานอัตโนมัติขณะพิมพ์ในช่องกรอกข้อความ —
          กด <Kbd>Esc</Kbd> ออกจากช่องค้นหาก่อน แล้วคีย์ลัดจะกลับมาใช้ได้
        </Note>
      </div>
    ),
  },
]
