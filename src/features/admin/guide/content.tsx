import {
  Bell,
  Compass,
  Users,
  Sprout,
  Map,
  Megaphone,
  ShieldCheck,
  Keyboard,
} from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'
import { P, Steps, Note, Topic, Key, KeyGroup } from '@/components/ui/guide-parts'
import type { GuideSection } from '@/components/ui/guide-book'

export type AdminGuideSectionId =
  | 'overview'
  | 'farmers'
  | 'farms'
  | 'gis'
  | 'content'
  | 'notifications'
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
            ['การแจ้งเตือน', 'งานค้าง สัญญาณเสี่ยง และคำตัดสินของทีม'],
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
        <Topic title="ค้นหาและเรียงลำดับ">
          <P>
            ช่องค้นหารับ<span className="font-medium text-ink">ชื่อเกษตรกร และ Farmer ID</span>{' '}
            กด <Kbd>/</Kbd> เพื่อกระโดดเข้าช่องค้นหาจากที่ไหนก็ได้ในหน้า ·
            เรียงตามวันที่ลงทะเบียน ชื่อ หรือจำนวนแปลงได้จากปุ่มเรียงลำดับ
          </P>
          <P>
            ค้นด้วยเบอร์โทรไม่ได้แล้ว เพราะระบบปิดบังเบอร์ไว้ (ดูหัวข้อถัดไป) —
            การค้นด้วยเบอร์จะเจอแค่ 4 ตัวท้าย ซึ่งให้ผลที่ไว้ใจไม่ได้
          </P>
        </Topic>
        <Topic title="ข้อมูลติดต่อถูกปิดบังไว้">
          <P>
            เบอร์โทรและอีเมลแสดงเป็น <span className="font-mono text-ink">08x-xxx-5678</span>{' '}
            ทุกที่ที่เป็นรายการ กดไอคอนรูปตาเพื่อดูของจริง —
            <span className="font-medium text-ink">การกดดูจะถูกบันทึกใน Audit Log</span>{' '}
            พร้อมชื่อผู้ดูแลที่กด และต้องมีสิทธิ์ <Kbd>farmers:read_contact</Kbd>
          </P>
        </Topic>
        <Topic title="เปิดโปรไฟล์">
          <P>
            คลิกที่แถวไหนก็ได้เพื่อเปิดโปรไฟล์เกษตรกร — ในนั้นมีฟาร์มทั้งหมดในสังกัด
            พร้อมพื้นที่และคาร์บอนสะสมรายแปลง
          </P>
        </Topic>
        <Topic title="ระงับบัญชี (ต้องระบุเหตุผล)">
          <P>
            การระงับทำให้เกษตรกร<span className="font-medium text-ink">เข้าใช้งานแอปไม่ได้</span>ทันที
            และ<span className="font-medium text-ink">แปลงทั้งหมดของเขาจะออกเครดิตไม่ได้</span>{' '}
            จนกว่าจะกดเปิดใช้งานอีกครั้ง — ข้อมูลและฟาร์มเดิมไม่ถูกลบ
          </P>
          <P>
            ระบบ<span className="font-medium text-ink">บังคับให้ระบุเหตุผล</span> และส่งข้อความนั้น
            ถึงเกษตรกรตรง ๆ — เขียนให้เขาอ่านรู้เรื่องว่าต้องทำอะไรต่อ ไม่ใช่โน้ตภายใน ·
            การปลดระงับไม่ต้องระบุเหตุผล
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
    id: 'farms',
    title: 'อนุมัติแปลงเกษตร',
    summary: 'คิวอนุมัติ และผลของการไม่อนุมัติ',
    icon: Sprout,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          แปลงที่เกษตรกรสร้างจากแอปจะเข้าคิวรอตรวจ —{' '}
          <span className="font-medium text-ink">ยังไม่มีสิทธิ์ออกคาร์บอนเครดิต</span>{' '}
          จนกว่าจะถูกอนุมัติ
        </P>
        <Topic title="ดูอะไรก่อนอนุมัติ">
          <P>
            เทียบ<span className="font-medium text-ink">พื้นที่แจ้ง</span>กับ
            <span className="font-medium text-ink">พื้นที่คำนวณ</span> — ต่างกันเกิน 15%
            ระบบจะติดธงไว้ให้ · เช็คด้วยว่าแปลงไม่ทับซ้อนกับใคร (ดูหน้า GIS)
            และเจ้าของบัญชีไม่ได้ถูกระงับอยู่
          </P>
        </Topic>
        <Topic title="ไม่อนุมัติ / ระงับ ต้องระบุเหตุผล">
          <P>
            เหตุผลจะถูกส่งถึงเกษตรกรตรง ๆ — เขียนให้เขารู้ว่าต้องแก้อะไร ·
            แปลงที่ถูกไม่อนุมัติหรือระงับจะ<span className="font-medium text-ink">ถูกถอนออกจากโครงการ</span>{' '}
            โดยอัตโนมัติ เพื่อไม่ให้สะสมเครดิตต่อในโครงการที่ไม่มีสิทธิ์อยู่แล้ว
          </P>
        </Topic>
        <Note>
          บัญชีเจ้าของถูกระงับ = แปลงของเขาอนุมัติไม่ได้ ต้องปลดระงับบัญชีก่อน ·
          ทุกการเปลี่ยนสถานะเก็บประวัติไว้ในหน้าแปลง พร้อมเหตุผลและชื่อคนกด
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
            ซึ่งเป็นความเสี่ยงที่ผู้ซื้อเครดิตตรวจเข้มที่สุด
          </P>
        </Topic>
        <Topic title="รายการพื้นที่ทับซ้อน">
          <P>
            แผงด้านขวาไล่จุดทับซ้อน<span className="font-medium text-ink">เรียงจากหนักไปเบา</span>{' '}
            คลิกรายการเพื่อให้แผนที่บินไปที่จุดนั้น และกดอนุมัติ/ระงับแปลงได้จากในแผงเลย
          </P>
          <P>
            ตัวเลข % วัดเทียบกับ<span className="font-medium text-ink">แปลงที่เล็กกว่า</span> —
            แปลง 1 ไร่ที่จมอยู่ในแปลง 100 ไร่ อ่านได้ 100% ไม่ใช่ 1%
            เพราะกรณีแบบนี้คือกรณีที่ต้องรีบดูที่สุด
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
          <span className="font-medium text-success">เผยแพร่</span> = ขึ้นจริงตามปลายทางที่เลือก ·
          <span className="font-medium text-ink"> ฉบับร่าง</span> = เก็บไว้แก้ต่อโดยยังไม่มีใครเห็น
        </P>
        <Topic title="เลือกปลายทาง">
          <P>
            ติ๊กได้ว่าจะขึ้นที่แดชบอร์ดไหน และขึ้นแบบไหน —{' '}
            <span className="font-medium text-ink">แบนเนอร์</span> คาอยู่บนหน้าจอ
            (เรื่องที่ต้องเห็นเดี๋ยวนี้) ส่วน<span className="font-medium text-ink">กระดิ่ง</span>{' '}
            อยู่ในรายการแจ้งเตือน (เรื่องที่ย้อนดูได้) · ประกาศเดียวส่งหลายปลายทางพร้อมกันได้
          </P>
          <P>
            ประกาศที่เผยแพร่แต่ไม่เลือกปลายทางเลยจะไม่ขึ้นที่ไหนทั้งนั้น —
            ระบบจึงไม่ยอมให้บันทึก
          </P>
        </Topic>
        <Topic title="ตั้งเวลา">
          <P>
            เว้น<span className="font-medium text-ink">เริ่มแสดง</span>ว่าง = ขึ้นทันทีที่เผยแพร่ ·
            เว้น<span className="font-medium text-ink">สิ้นสุด</span>ว่าง = ขึ้นจนกว่าจะปิดเอง ·
            ตั้งล่วงหน้าไว้ได้ ระบบจะขึ้นให้เองเมื่อถึงเวลา ไม่ต้องมาคอยกด
          </P>
        </Topic>
        <Note>
          เขียนเสร็จแล้วยังไม่แน่ใจ ให้บันทึกเป็นฉบับร่างก่อนเสมอ — การเผยแพร่ไม่มีขั้นอนุมัติซ้ำ
          ข้อความจะถึงปลายทางทันทีที่กด (หรือทันทีที่ถึงเวลาที่ตั้งไว้)
        </Note>
      </div>
    ),
  },
  {
    id: 'notifications',
    title: 'กระดิ่งแจ้งเตือน',
    summary: 'ระบบบอกเองว่ามีอะไรรอคุณอยู่',
    icon: Bell,
    body: (
      <div className="flex flex-col gap-4">
        <P>
          กระดิ่งบนหัวจอรวมสองอย่างไว้ที่เดียว —{' '}
          <span className="font-medium text-ink">ประกาศ</span>ที่ผู้ดูแลเขียนเอง และ
          <span className="font-medium text-ink">แจ้งเตือนที่ระบบสร้างขึ้น</span>{' '}
          จากสิ่งที่เกิดจริงในงาน
        </P>
        <Topic title="สี่ประเภท">
          <P>
            <span className="font-medium text-warning">งานค้าง</span> = มีของรอคุณลงมือ เช่น
            แปลงใหม่ที่ยังไม่อนุมัติ ·{' '}
            <span className="font-medium text-error">สัญญาณเสี่ยง</span> = ข้อมูลดูไม่ปกติ
            ควรตรวจก่อนออกเครดิต ·{' '}
            <span className="font-medium text-success">คำตัดสิน</span> = คนอื่นในทีมตัดสินอะไรไปแล้ว ·{' '}
            <span className="font-medium text-ink">ระบบ</span> = แดชบอร์ดปิดปรับปรุง สิทธิ์เปลี่ยน
          </P>
        </Topic>
        <Topic title="ใครเห็นอะไร">
          <P>
            แจ้งเตือนส่งถึง<span className="font-medium text-ink">หน้าที่</span> ไม่ใช่ตัวบุคคล —
            “แปลงรออนุมัติ” ไปถึงทุกคนที่มีสิทธิ์อนุมัติแปลง รวมถึงคนที่เพิ่งเข้าทีมวันนี้
            และเลิกเป็นภาระของคนที่ลาออกไปแล้ว · สถานะอ่านแยกรายคน
            คุณกดอ่านไม่ได้ทำให้ของคนอื่นหายไปด้วย
          </P>
        </Topic>
        <Note>
          กระดิ่งเก็บ 8 รายการล่าสุด · กด{' '}
          <span className="font-medium text-ink">ดูการแจ้งเตือนทั้งหมด</span> หรือ{' '}
          <Kbd>G</Kbd> <Kbd>N</Kbd> เพื่อดูย้อนหลังทั้งหมดพร้อมตัวกรอง ·
          ตัวเลขบนกระดิ่งอัปเดตเองทุกนาที ไม่ต้องรีเฟรชหน้า
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
        <Topic title="พิมพ์เอกสาร PDD">
          <P>
            หน้า “พิมพ์เอกสาร” จัดหน้า A4 พร้อมหัวและท้ายกระดาษทุกแผ่นให้แล้ว —
            กดพิมพ์แล้วเลือก <span className="font-medium text-ink">Save as PDF</span> ในกล่องพิมพ์ของเบราว์เซอร์
          </P>
          <P>
            <span className="font-medium text-ink">เลขหน้าอัตโนมัติทำไม่ได้</span> —
            เอนจินพิมพ์ของเบราว์เซอร์ไม่รองรับ ถ้าเอกสารต้องมีเลขหน้า ให้เปิด
            “Headers and footers” ในกล่องพิมพ์ เบราว์เซอร์จะเติมเลขหน้าให้เอง
          </P>
        </Topic>
        <Topic title="ปิดปรับปรุงแดชบอร์ด">
          <P>
            ปิดได้ทีละแดชบอร์ด — ผู้ใช้ของแดชบอร์ดนั้นจะเห็นหน้าปิดปรับปรุงพร้อม
            <span className="font-medium text-ink">เหตุผลที่คุณพิมพ์</span>{' '}
            และเวลาที่คาดว่าจะกลับมา (ถ้าระบุ) · เขียนให้เขาตัดสินใจได้ว่าจะรอหรือกลับมาพรุ่งนี้
          </P>
          <P>
            แดชบอร์ดผู้ดูแล<span className="font-medium text-ink">ปิดไม่ได้</span> —
            เพราะสวิตช์อยู่ในนั้น ปิดแล้วจะเปิดกลับไม่ได้
          </P>
        </Topic>
        <Topic title="Admin Users">
          <P>
            สร้างบัญชีผู้ดูแลใหม่ ระบบจะ<span className="font-medium text-ink">เติมคำนำหน้าตามบทบาท</span>{' '}
            ให้เอง (somchai + Verifier → <span className="font-mono text-ink">verify.somchai</span>) ·
            บัญชีผู้ตรวจรับรองต้องระบุ<span className="font-medium text-ink">สังกัด</span>{' '}
            เพราะสังกัดจะไปปรากฏบน PDF รายงานการตรวจรับรองคู่กับชื่อผู้ตรวจ
          </P>
          <P>
            เว้นช่องรหัสผ่านไว้ ระบบจะสุ่มให้และ
            <span className="font-medium text-ink">แสดงครั้งเดียว</span> — คัดลอกส่งให้เจ้าตัวก่อนปิดหน้าต่าง
            ปิดไปแล้วดูซ้ำไม่ได้ ต้องตั้งใหม่ · ทุกกรณีเจ้าตัวจะถูกบังคับให้เปลี่ยนรหัสตอนเข้าระบบครั้งแรก
          </P>
        </Topic>
        <Topic title="Audit Log">
          <P>
            บันทึกทุกการกระทำที่เปลี่ยนแปลงข้อมูล — ใคร ทำอะไร กับใคร เมื่อไร
            ใช้ตอบคำถามตรวจสอบย้อนหลังและเป็นหลักฐานประกอบมาตรฐานคาร์บอนเครดิต
          </P>
          <P>
            กรองตาม<span className="font-medium text-ink">ผู้ทำรายการ ประเภทการกระทำ และช่วงวันที่</span>{' '}
            ได้ · ตัวกรองทั้งหมดอยู่ใน URL จึงคัดลอกลิงก์แปะในตั๋วงานให้คนอื่นเปิดดูมุมเดียวกันได้เลย
          </P>
          <P>
            การเปิดดูเบอร์โทรของเกษตรกรก็ถูกบันทึกที่นี่ ในชื่อ{' '}
            <span className="font-mono text-ink">READ_PII</span>
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
