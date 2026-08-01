# FarmFlow — Dashboard UAT Feedback → Implementation Spec

> **แหล่งที่มา:** UAT รอบ "สวมหมวกผู้ใช้จริง" (Admin Dashboard + Verifier Dashboard)
> **จุดประสงค์:** เปลี่ยน feedback จากการทดสอบใช้งานจริงให้เป็นงานที่ Claude Code นำไป implement ได้ทันที
> **Scope รอบนี้:** `Admin Dashboard`, `Verifier Dashboard` (Business / Executive ยังไม่ทดสอบในรอบนี้)
> **อ่านคู่กับ:** ERD v3 (Zero-PII), Master User Flow v3, Wireframe, Design System (glassmorphism protocol), carbon calculator spec

---

## 0. วิธีอ่าน spec นี้ (สำหรับ Claude Code)

**Priority:**
- `[P0]` — Blocker / Bug / จำเป็นต่อความถูกต้องของ MRV หรือความปลอดภัย → ทำก่อน
- `[P1]` — ฟีเจอร์สำคัญที่กระทบการใช้งานจริง
- `[P2]` — Polish / UX เสริม (ทำได้ต่อเมื่อ P0/P1 เสร็จ)

**Task ID:** `AREA-SECTION-NN` ใช้อ้างอิงข้าม PR / commit / คู่มือ
**`[ ]`** = acceptance criteria ที่ต้องผ่านทั้งหมดก่อนถือว่า task เสร็จ
**💡 PM Note** = ข้อวิเคราะห์/ทางเลือกที่เสนอเพิ่ม (ไม่ใช่คำสั่งตายตัว — พิจารณาเหตุผล)
**⚠️ ต้องยืนยัน** = ประเด็นที่ต้องเช็คกับ VGREEN advisor / เจ้าของ requirement ก่อนลงมือ

---

## 1. GLOBAL CONVENTIONS (บังคับใช้ทุกหน้า)

กฎเหล่านี้ apply กับ **ทุก task** ด้านล่าง — ถ้าหน้าไหนขัดกฎนี้ให้ถือว่าเป็น bug

### `GLOBAL-01` [P1] Terminology: BATCHES → Session
- [ ] แทนที่คำว่า `BATCH` / `BATCHES` / `Farm Batch` ทั้งหมดในทุก Dashboard ด้วย `Session`
- [ ] `BATCH ID` → `Session ID` (ต้อง map กับ `session_id` ที่เป็น golden thread ของระบบ)
- [ ] ตรวจ label, table header, breadcrumb, tooltip, และข้อความในเอกสาร PDF ที่ export
- **เหตุผล:** ให้ตรงกับ Mobile App และ data model เดียวกัน ลดความสับสนของทีมและผู้ตรวจ

### `GLOBAL-02` [P1] หน่วยคาร์บอน: tCO2e ก่อน แล้วตามด้วย kgCO2e
- [ ] ทุกจุดที่แสดงคาร์บอนให้ขึ้น `tCO2e` (ตัน) เป็นหน่วยหลัก แล้ววงเล็บ/บรรทัดรองด้วย `kgCO2e`
- [ ] รูปแบบแนะนำ: `12.35 tCO2e (12,350 kgCO2e)`
- **เหตุผล:** ตอนซื้อขายจริงใช้หน่วยตัน; kgCO2e เก็บไว้เพราะละเอียดสุด แต่ไม่ใช่หน่วยที่คนตัดสินใจซื้อขายอ่าน

### `GLOBAL-03` [P1] เครื่องมือจัดการรายการ (Search / Filter / Sort)
- [ ] ทุกหน้าที่เป็น list หรือ table ต้องมี: `Search bar`, `Filter`, `Sort by` เป็นมาตรฐาน
- [ ] ออกแบบให้ทน scale ระดับหมื่น–แสนแถว (server-side pagination + query, ไม่ใช่ filter ฝั่ง client ล้วน)
- **เหตุผล:** ฟาร์มอาจมีเป็นแสน — ทุก view ต้องค้น/กรอง/เรียงได้

### `GLOBAL-04` [P2] การแสดงตัวเลขพื้นที่ (ไร่)
- [ ] ค่าเริ่มต้นแสดงทศนิยม 2 ตำแหน่ง (เช่น `12.35 ไร่`)
- [ ] มีปุ่มเล็ก ๆ / tooltip ให้กดดูค่าเต็มความละเอียด
- **หมายเหตุ:** ใช้กฎเดียวกันทุกที่ที่โชว์พื้นที่

### `GLOBAL-05` [P1] อัปเดตคู่มือทุกครั้ง
- [ ] ทุก PR ที่เปลี่ยน behavior ต้องอัปเดตคู่มือ (Admin / Verifier) ให้ตรงกับสถานะล่าสุด
- [ ] ถือเป็นส่วนหนึ่งของ Definition of Done

---

## 2. DASHBOARD PORTAL (หน้ารวมประตู)

### `PORTAL-01` [P2] ยกระดับ visual ให้ไม่ Plain
- [ ] คง Minimal & Clean ไว้ แต่เพิ่ม "ลูกเล่น" ที่ subtle
- [ ] ตัวเลือกที่เสนอ: Hexagon background effect ลาก/จางตามเมาส์ (opacity ต่ำ ไม่รบกวนสายตา)
- [ ] **บังคับ:** เคารพ `prefers-reduced-motion` และปิด effect บนอุปกรณ์ที่ perf ต่ำ เพื่อไม่ให้กระตุกและไม่กระทบ accessibility
- 💡 PM Note: hexagon สื่อภาพ "carbon / molecular" ได้ดีและเข้าธีมป่าไม้–คาร์บอน แนะนำทำเป็น canvas layer เบา ๆ ไม่ใช่ DOM หลายร้อย node

### `PORTAL-02` [P1] Public Document Verification — affordance ไม่ชัด
- [ ] ตอนนี้ผู้ใช้ไม่รู้ว่า "ตรวจสอบเอกสาร (สาธารณะ — ไม่ต้องเข้าสู่ระบบ)" กดได้ → ต้องทำให้ชัดว่าเป็น entry point ที่กดได้
- [ ] เสนอ redesign เป็น card/ปุ่ม CTA แยกเด่น พร้อมไอคอน + คำอธิบายสั้น ("สแกน QR หรือกรอกรหัสเพื่อตรวจสอบเครดิต")
- 💡 PM Note: นี่คือหน้า anti-greenwashing สาธารณะ (mission หลักข้อ 2 ของ FarmFlow) — คุ้มที่จะให้ prominence สูงกว่านี้ อาจแยกเป็น hero section ของ portal เลย

---

## 3. ADMIN DASHBOARD

### 3.1 Login

#### `ADMIN-LOGIN-01` [P1] Show/Hide password toggle
- [ ] เพิ่มไอคอนดวงตา (เปิด/ปิด) ในช่อง password ให้ผู้ใช้เห็นสิ่งที่พิมพ์ได้

#### `ADMIN-LOGIN-02` [P1] ช่องทางติดต่อผู้ดูแลระบบ → LINE OA
- [ ] เพิ่มลิงก์ "ติดต่อผู้ดูแลระบบ" เด้งไป LINE OA (ใช้ลิงก์เดิมที่เคยทำไว้ — ถ้าหาไม่เจอในโค้ด ให้ถาม owner)
- [ ] วางเป็น secondary link ใต้ฟอร์ม login

#### `ADMIN-LOGIN-03` [P2] ลด Plain
- [ ] เพิ่ม visual polish ให้สอดคล้องกับ Design System (glassmorphism) โดยไม่ทำให้ฟอร์มรก

### 3.2 หน้า Dashboard (ภาพรวม)

#### `ADMIN-DASH-01` [P2] Card ไม่สมดุล
- [ ] ปรับ layout ให้ card สมดุล — `OVERLAP FLAGS` ใหญ่กว่าเพื่อน (`ACTIVE FARMERS`, `TOTAL FARMS`, `PENDING SESSIONS`) มากเกินไป
- [ ] ให้ทุก stat card ขนาดสม่ำเสมอในแถวเดียวกัน (grid เท่ากัน)

#### `ADMIN-DASH-02` [P1] Sidebar ขาดเมนู Support Tickets
- [ ] หน้า Dashboard มี Support Ticket แต่ sidebar ไม่มี → เพิ่ม `Support Tickets` เข้า sidebar menu

#### `ADMIN-DASH-03` [P1] Carbon Issues แสดงหน่วยผิดลำดับ
- [ ] `CARBON ISSUES` (คาร์บอนที่ออกให้แล้ว) ให้ขึ้น `tCO2e` ก่อน แล้วเสริม `kgCO2e` (ตาม `GLOBAL-02`)

#### `ADMIN-DASH-04` [P1] Quick Access ตกหล่นเมนู
- [ ] เพิ่มใน `QUICK ACCESS`: `Projects` (เมนูใหม่), `Audit Log`, `Admin Users`
- [ ] ตรวจว่า quick access ครอบคลุมเมนูสำคัญครบ

### 3.3 หน้า Projects

#### `ADMIN-PROJ-01` [P1] Drop-down ระยะเวลาคิดเครดิต ยืดหยุ่นไม่พอ
- [ ] เปลี่ยนจาก `[7 ปี, 10 ปี]` → ตัวเลือก `1–10 ปี` + option `"กรอกเอง (custom)"`
- **เหตุผล:** ระยะเวลาไม่ตายตัว; ปัจจุบันต้องเข้าไปแก้ใน PDD Wizard ซึ่งขัดกัน (แหล่ง truth ซ้ำซ้อน)
- 💡 PM Note: ให้ค่านี้เป็น single source of truth ที่ project level แล้ว PDD Wizard อ่านค่าจากตรงนี้ (sync ทางเดียว) เพื่อไม่ให้ตั้งได้ 2 ที่แล้วขัดกัน

#### `ADMIN-PROJ-02` [P1] ตารางฟาร์มในโครงการ — คลิกเข้ารายละเอียดได้
- [ ] แต่ละแถวในตารางฟาร์มต้องกดเข้าดูรายละเอียดฟาร์มได้ (link → farm detail)

#### `ADMIN-PROJ-03` [P1] คอลัมน์เบอร์ติดต่อ + ช่องทางติดต่อ
- [ ] เพิ่มคอลัมน์: เบอร์ติดต่อ, ช่องทางการติดต่อ (นอกจากพื้นที่ไร่ในขอบเขตที่ประกาศ)
- [ ] ถ้าไม่มีใน DB ให้แสดง `-`
- ⚠️ ต้องยืนยัน: การเก็บ/แสดงเบอร์ติดต่อต้องสอดคล้อง **Minimal-PII policy** — ยืนยันว่า field นี้อยู่ในขอบเขตที่อนุญาต และแสดงเฉพาะ role ที่มีสิทธิ์

#### `ADMIN-PROJ-04` [P1] Search / Filter / Sort ในตารางฟาร์ม
- [ ] ตาม `GLOBAL-03`

### 3.4 PDD Wizard

> feedback: ออกแบบดีแล้ว Clean/Minimal และใช้งานได้จริง — ต่อไปนี้คือจุดปรับ

#### `ADMIN-PDD-01` [P1] ประเภทโครงการ — ปลดล็อกเป็น 2 ตัวเลือก
- [ ] เปลี่ยนจากค่า lock เดี่ยว → dropdown:
  1. การลด ดูดซับ และการกักเก็บฯ จากภาคป่าไม้และการเกษตร
  2. อื่น ๆ (กรอกเอง manual)

#### `ADMIN-PDD-02` [P1] ขอบเขตพื้นที่ (KMZ/KML) — Preview + Download
- [ ] หลังอัปโหลด แสดง **Maps Preview** ของ polygon เพื่อให้ผู้ใช้ยืนยันว่ายื่นไฟล์ถูก
- [ ] คลิกที่ชื่อไฟล์ที่ยื่น → download ไฟล์ต้นฉบับได้
- [ ] คงการแสดงชื่อไฟล์ที่ยื่นไว้ (ดีอยู่แล้ว)

#### `ADMIN-PDD-03` [P2] Sample Plots — ปุ่มขยาย
- [ ] เพิ่มปุ่มเล็ก ๆ / กด `F` → popup แสดง Maps ขนาดใหญ่
- [ ] คง preview ปัจจุบันไว้

#### `ADMIN-PDD-04` [P1] Export PDF ให้เป็นเอกสารจริง (ไม่ใช่ browser print)
- [ ] ย้ายจาก browser print (ที่ติดแถบ browser มาด้วย) → **PDF generator** ฝั่ง server/ไลบรารี เพื่อให้ PDD ออกมาสะอาด เป็นเอกสารทางการ
- [ ] รองรับ header/footer, เลขหน้า, โลโก้ ตามมาตรฐานเอกสาร
- 💡 PM Note: ใช้ pattern เดียวกับที่ทำเอกสาร IP suite ได้ (HTML→PDF ที่คุม layout เอง) เพื่อ consistency ทั้งระบบ
- ⚠️ requirement ค้าง: ในเอกสารต้นฉบับประโยค "ผมอยากให้มีช้อยส์คือ…" ถูกตัดจบ — **โปรดระบุเพิ่มว่าต้องการ choice อะไรตอน export** (เช่น เลือกภาษา / เลือกมี-ไม่มีภาคผนวก / เลือกรวมภาพถ่าย) แล้วจะเติมเป็น sub-task

### 3.5 Farmer Management

#### `ADMIN-FARMER-01` [P1] ดึง NAME จริงจาก DB + สลับลำดับคอลัมน์
- [ ] ตรวจ source ของ `NAME` — ดึงจาก DB ให้ระบุตัวตนได้ดีกว่าเลข `#` (ถ้าไม่มีจริงค่อยคง `#`)
- [ ] สลับลำดับ: `NAME` คอลัมน์แรก, `FARMER ID` คอลัมน์ที่สอง
- ⚠️ ต้องยืนยัน: การโชว์ชื่อจริงต้องผ่าน Minimal-PII policy — ยืนยันว่า field ชื่ออยู่ใน scope ที่อนุญาตให้ Admin เห็น

#### `ADMIN-FARMER-02` [P1] Filter / Sort
- [ ] ตาม `GLOBAL-03`

### 3.6 Farmer Detail (รายบุคคล)

#### `ADMIN-FARMERDET-01` [P2] Cover Photo + default fallback
- [ ] เพิ่ม cover photo; ถ้าไม่มีให้ใช้ cover default ของระบบ

#### `ADMIN-FARMERDET-02` [P1] ตารางแปลง — คลิกดูรายละเอียดแปลงได้
- [ ] แต่ละแปลงในตารางกดเข้าดู plot detail ได้

#### `ADMIN-FARMERDET-03` [P0] จังหวัดไม่แสดงผล (ตรวจ bug)
- [ ] จังหวัดไม่แสดง — ตรวจว่าเป็น (ก) ผู้ใช้ไม่ได้กรอก หรือ (ข) bug ในการ query/mapping
- [ ] ถ้า null ให้แสดง `-`; ถ้า mapping ผิดให้ fix
- **หมายเหตุ:** จัดเป็น P0 เพราะเป็นข้อมูลตำแหน่งที่กระทบทั้ง GIS และการจัดกลุ่มโครงการ

#### `ADMIN-FARMERDET-04` [P2] พื้นที่ไร่ — 2 ตำแหน่ง + ปุ่มดูเต็ม
- [ ] ตาม `GLOBAL-04`

#### `ADMIN-FARMERDET-05` [P1] Carbon รวม — tCO2e ก่อน
- [ ] ตาม `GLOBAL-02`

#### `ADMIN-FARMERDET-06` [P1] คอลัมน์ "ขึ้นทะเบียนกับโครงการใด"
- [ ] เพิ่มคอลัมน์แสดงว่าฟาร์มนี้ปัจจุบันขึ้นทะเบียนกับโครงการใด

#### `ADMIN-FARMERDET-07` [P1] Filter / Sort
- [ ] ตาม `GLOBAL-03`

### 3.7 GIS Farm Map

#### `ADMIN-GIS-01` [P1] จัดการพื้นที่ทับซ้อน (Overlap) ให้ทำงานจริง
- [ ] เพิ่ม **panel สรุป**: มีพื้นที่ทับซ้อนกี่จุด + **List รายการ** ทับซ้อนทั้งหมด
- [ ] คลิกรายการ → แผนที่ zoom/หา polygon ที่ทับซ้อนให้
- [ ] จากรายการ สามารถ **ระงับ / อนุมัติ / จัดการข้อพิพาท** ได้
- [ ] ปุ่ม toggle "แสดงเฉพาะพื้นที่ทับซ้อน"
- [ ] ออกแบบให้ทน scale: ฟาร์มแสนไร่ / ทับซ้อนหลักพัน ต้องหา/จัดการได้ครบ (server-side overlap detection + pagination)
- **เหตุผล:** ปัจจุบันโชว์แต่แผนที่ ยังไม่ functional สำหรับการหา/จัดการ overlap
- 💡 PM Note: overlap detection ควรทำเป็น batch job ฝั่ง PostGIS (`ST_Overlaps` / `ST_Intersects`) แล้ว cache ผลเป็นตาราง `farm_overlaps` เพื่อไม่ต้องคำนวณ realtime ตอนเปิดแผนที่

### 3.8 Announcements

#### `ADMIN-ANN-01` [P1] Search / Filter / Sort
- [ ] ตาม `GLOBAL-03`

#### `ADMIN-ANN-02` [P1] สร้างประกาศ — รูป/Banner + targeting + scheduling
- [ ] เพิ่มช่องอัปโหลดรูป / Banner
- [ ] เลือกปลายทางที่จะแสดง (multi-select): `Mobile App`, `Admin`, `Verifier`, `Executive`, `Business`
- [ ] เลือกช่วงเวลาแสดง: `Start` และ `End`
- [ ] option ให้ไปโผล่ที่ไอคอนกระดิ่ง Notification ของแต่ละ Dashboard ได้ (เลือกได้)
- 💡 PM Note: model เป็น `announcement` + `announcement_target[]` (dashboard, channel: banner|bell, start_at, end_at) เพื่อรองรับหลายปลายทาง/หลาย channel ต่อ 1 ประกาศ

### 3.9 System Settings

#### `ADMIN-SYS-01` [P1] เปิด/ปิด Dashboard อื่นแยกกัน (Maintenance mode)
- [ ] เพิ่ม toggle เปิด/ปิดแยก: `Verifier`, `Business`, `Executive`
- [ ] เมื่อปิด → dashboard นั้นขึ้นหน้า "ปิดปรับปรุง"
- [ ] ใส่รายละเอียดได้: เหตุผลที่ปิด, กำหนดเปิดเมื่อไหร่
- [ ] คงฟีเจอร์ตั้งราคาคาร์บอนเครดิตเดิมไว้

### 3.10 Audit Log

#### `ADMIN-AUDIT-01` [P1] เครื่องมือ Filter / Sort
- [ ] ตาม `GLOBAL-03` (โดยเฉพาะ filter ตาม actor, action type, ช่วงเวลา)

### 3.11 Admin Users

#### `ADMIN-USERS-01` [P0] Bug: คอลัมน์สถานะแสดงผิด
- [ ] Verifier User ที่ **เปิดใช้งานอยู่** แต่สถานะแสดงเป็นสีเทา "ปิดใช้งาน" → ตรวจ logic การ map สถานะ → สถานะจริง
- **หมายเหตุ:** P0 เพราะสถานะบัญชีผิดทำให้เข้าใจสิทธิ์ผู้ใช้ผิด

#### `ADMIN-USERS-02` [P1] ปุ่มเชิญผู้ดูแล — Username format ล็อกตาม role
- [ ] Username ต้องถูก prefix อัตโนมัติตาม role เช่น verifier `somchai` → `verify.somchai` เสมอ
- [ ] กำหนด mapping prefix ต่อ role ให้ชัด (เช่น `verify.`, `admin.`, ฯลฯ)
- [ ] จัดการ uniqueness/ชนกัน (ถ้า `verify.somchai` มีแล้ว ต้องเตือน/เสนอ suffix)

#### `ADMIN-USERS-03` [P1] เปลี่ยนปุ่ม "ส่งคำเชิญ" → "บันทึก"
- [ ] เปลี่ยน label ปุ่มเป็น `บันทึก`

#### `ADMIN-USERS-04` [P1] Verifier ต้องระบุสังกัด + สร้างรหัสผ่าน
- [ ] เพิ่มฟิลด์ **สังกัด** สำหรับ role verifier (เช่น `VGREEN`, `อิสระ`)
- [ ] เพิ่ม verifier สังกัดใหม่เข้าระบบได้ (จัดการเป็น list ที่แก้ไขได้)
- [ ] สังกัดนี้ต้องปรากฏบน **PDF รายงานการตรวจรับรองคาร์บอน** พร้อมชื่อผู้ตรวจ
- [ ] เพิ่มช่อง **สร้างรหัสผ่าน** + ปุ่ม **Generate** รหัสผ่าน (เพื่อส่งให้ role ต่าง ๆ login)
- 💡 PM Note (ความปลอดภัย): แนะนำ pattern **"force reset on first login"** หรือ **one-time set-password link** แทนการส่ง plaintext password ผ่าน LINE โดยตรง — ปลอดภัยกว่าและสอดคล้อง Minimal-PII/security posture ของ FarmFlow อยู่แล้ว ปุ่ม Generate ยังมีได้ แต่ให้ระบบส่งลิงก์ตั้งรหัส ไม่ใช่ส่งรหัสจริง (พิจารณาเหตุผล — ไม่บังคับ)

#### `ADMIN-USERS-05` [P1] RBAC — Least Privilege ตาม role
- [ ] แต่ละระดับ Admin เข้าถึงเมนูได้ต่างกันตามหน้าที่ (menu-level + action-level permission)
- [ ] `Super Admin` เห็นทุกอย่าง; role อื่นลดหลั่นตามความรับผิดชอบ
- 💡 PM Note: ทำเป็น permission matrix (role × menu × action) เก็บใน DB จะยืดหยุ่นกว่า hardcode และตรวจสอบง่ายตอน audit

### 3.12 Admin Powers (การกระทำต้องมีผลจริง)

#### `ADMIN-POWER-01` [P0] อนุมัติ/ไม่อนุมัติ ฟาร์ม — บังคับใช้จริง
- [ ] Admin เลือกอนุมัติ/ไม่อนุมัติแต่ละฟาร์มได้
- [ ] ฟาร์มที่ไม่ได้รับอนุมัติ → **ไม่มีสิทธิ์เข้าโครงการ** (บังคับที่ระดับ business logic ไม่ใช่แค่ UI)

#### `ADMIN-POWER-02` [P0] User ที่ไม่ได้รับอนุมัติ → ฟาร์มไม่ผ่าน
- [ ] ถ้า user ยังไม่ได้รับอนุมัติ ฟาร์มของ user นั้นไม่มีสิทธิ์ได้รับอนุมัติ (dependency check)

#### `ADMIN-POWER-03` [P0] ระงับ/ปลดระงับบัญชี — มีผลจริง + เหตุผล + แจ้งเตือน
- [ ] ระงับบัญชีต้องมีผลจริง (บล็อกการเข้าถึง) และ **ปลดระงับ** ได้
- [ ] บังคับกรอก **เหตุผล** ทุกครั้ง
- [ ] เหตุผลเด้งเป็น **Notification บน Mobile App** ให้ผู้ใช้ทราบ
- 💡 PM Note: บันทึกทุก action (approve/reject/suspend/unsuspend + เหตุผล + actor) ลง Audit Log อัตโนมัติ เชื่อมกับ `ADMIN-AUDIT-01`

---

## 4. VERIFIER DASHBOARD

### 4.1 หน้าเลือกโครงการ

#### `VERIFIER-PROJ-01` [P1] Project Cards สวย + สถานะ + เครื่องมือ
- [ ] เปลี่ยนจาก layout plain → **การ์ดโครงการพร้อม Cover image** เรียงกัน + แสดงสถานะโครงการ
- [ ] มี `Search bar`, `Filter`, `Sort by` (ตาม `GLOBAL-03`)
- [ ] คลิกการ์ด → เข้าดูรายละเอียดโครงการได้

### 4.2 ภายในโครงการ — Session Queue

#### `VERIFIER-SESS-01` [P1] Rename → Session Queue
- [ ] `Farm Batch Queue` → `Session Queue` (ตาม `GLOBAL-01`)

#### `VERIFIER-SESS-02` [P1] Stat Cards ชัดเจน
- [ ] แสดงการ์ดสรุปให้ชัด: รอตรวจกี่รายการ, อนุมัติแล้วกี่รายการ, ผิดปกติกี่รายการ

#### `VERIFIER-SESS-03` [P1] ตาราง Queue — สลับคอลัมน์ + เครื่องมือ
- [ ] คอลัมน์ `ฟาร์ม / เกษตรกร` ขึ้นก่อน แล้วตามด้วย `Session ID`
- [ ] เพิ่ม `Filter`, `Sort by`, tools ที่จำเป็น

### 4.3 รายละเอียดคิว (Session Detail) — ภาพต้นไม้ + ข้อมูล

#### `VERIFIER-DETAIL-01` [P1] Filter/Sort ภาพต้นไม้ + toggle "แสดงเฉพาะผิดปกติ"
- [ ] ในส่วนแสดงต้นไม้จำนวนมาก เพิ่ม `Filter`, `Sort by`
- [ ] ปุ่มติ๊ก "แสดงเฉพาะภาพที่ผิดปกติ" (เช่น 10,000 ต้น ผิดปกติ 15 ต้น ต้องหยิบมาตรวจได้ง่าย)

#### `VERIFIER-DETAIL-02` [P1] แสดงข้อมูลการขึ้นทะเบียน + รอบเก็บถัดไป
- [ ] ระบุว่าฟาร์มนี้ขึ้นทะเบียนกับโครงการใด
- [ ] ระบุ **ปีที่ต้องเก็บข้อมูลครั้งถัดไป**

#### `VERIFIER-DETAIL-03` [P1] ภาพถ่ายดาวเทียม (Esri) ใน PDF — ซ้อน Polygon ขอบเขต
- [ ] ในเอกสาร PDF ส่วนภาพถ่ายดาวเทียม (Esri) ให้ overlay polygon ขอบเขตแปลง
- [ ] ต้องไม่ทึบจนบดบังการมองเห็นภาพ (เส้นขอบ + fill โปร่งใส)

#### `VERIFIER-DETAIL-04`
- [ ] เพิ่มเติมว่า Verifier เวลากดดูต้นไม้รายต้น ต้องกดปฏิเสธ ต้นไม้รายต้นได้ และส่งกลับไปให้ User เกษตรกร แก้ไขเป็นรายต้นไป ซึ่งจะเด้งแจ้งเตือน User ใน Mobile App ให้แก้ไขต้นดังกล่าว เป็นรายต้นไป เวลากดปุ่มปฏิเสธ ก็ให้สามารถ แนบต้นไม้ที่มีปัญหา พร้อมเหตุผลการปฏิเสธได้ด้วย พอจะเข้าใจไหมครับ

### 4.4 Baseline (สำคัญที่สุด — MRV core)

#### `VERIFIER-BASELINE-01` [P0] บันทึกและแสดงผล Baseline
โมเดลตาม requirement:
> การอนุมัติครั้งแรกของฟาร์มในโครงการหนึ่งโดย Verifier = **Baseline (ปีที่ 0)**
> ครบ crediting period (เช่น 10 ปี) → ไม่ใช่ baseline แล้ว (หักลบกันไป)
> ถ้าเข้าร่วมโครงการต่อ → ตั้ง Baseline ใหม่ที่ปีที่ 10

- [ ] เมื่อ Verifier อนุมัติ session แรกของฟาร์มในโครงการ → บันทึกเป็น Baseline (ผูกกับ `session_id`, `project_id`, `farm_id`, `verifier_id`, `approved_at`, `baseline_carbon_value`, `crediting_period`)
- [ ] Baseline ต้องเป็น record ที่ **immutable + timestamped** (แก้ไม่ได้ตามอำเภอใจ มี audit trail)
- [ ] แสดง **TAG สีเขียว** "Baseline" ที่ session/แปลงนั้น
- [ ] ข้อมูลแปลงปลูกระบุด้วยว่าเป็น Baseline หรือไม่
- [ ] ตอน download PDF: เขียนชัดว่า Baseline = เท่าไหร่

**การตัดสินใจออกแบบ: auto-detect หรือให้ Verifier เลือก?**
- 💡 PM Note (คำแนะนำ): ใช้ **hybrid** — ระบบ auto-suggest ว่า "นี่คือการอนุมัติครั้งแรก → เสนอเป็น Baseline" แต่ให้ Verifier **ยืนยัน/toggle** ตอนกดอนุมัติ (checkbox: "บันทึกเป็น Baseline")
  - เหตุผลที่ไม่ auto ล้วน: มี edge case — ฟาร์มเข้า-ออก-กลับเข้าโครงการ, การแก้ baseline ที่เคยอนุมัติผิด, ฟาร์มย้ายโครงการ. ถ้า auto ล็อกทันทีอาจ lock ข้อมูลผิดโดยไม่มีทางแก้
  - ได้ทั้ง default ที่ถูกต้อง + safety ให้ผู้ตรวจ override เมื่อจำเป็น → make sense ที่สุดในเชิง MRV

**⚠️ ต้องยืนยันกับ VGREEN advisor (ก่อน finalize ป้ายกำกับบนเอกสารทางการ):**
- ในบริบท T-VER คำว่า "Baseline / เส้นฐาน" มักหมายถึง **baseline scenario (business-as-usual)** ซึ่งเป็นคนละอย่างกับ **ปริมาณคาร์บอนตั้งต้น ณ ปีเริ่มโครงการ (initial carbon stock, t=0)** ที่ใช้เป็นจุดอ้างอิงคำนวณ net removal
- สิ่งที่ requirement นี้อธิบาย = ตัวหลัง (initial stock ที่ผู้ตรวจรับรองครั้งแรก) มากกว่า baseline scenario
- **ความเสี่ยง:** ถ้าติดป้าย "Baseline" บนเอกสารตรวจรับรองทางการโดยความหมายไม่ตรงกับที่ VVB/TGO ใช้ อาจสร้างความสับสนตอน verification
- **ข้อเสนอ:** ยืนยันกับ VGREEN ว่าจะใช้คำว่า `Baseline (เส้นฐาน)` หรือ `ปริมาณคาร์บอนเริ่มต้น / Initial Carbon Stock (t=0)` บน PDF และ TAG — เป็นการ clarify ต้นทุนต่ำแต่ป้องกันปัญหา downstream สูง (สอดคล้องกับที่เคย flag เรื่อง H-D model / MAI มาก่อน)
- *(ผมไม่ฟันธงศัพท์ T-VER แทน advisor — flag ไว้ให้ตัดสินร่วมกัน)*

### 4.5 Sidebar

#### `VERIFIER-NAV-01` [P1] Help Desk → LINE OA
- [ ] เพิ่ม `Help Desk` ใน sidebar เด้งไป LINE OA เหมือน Admin Dashboard

---

## 5. สรุปตาราง Task (Quick Reference สำหรับ planning)

| ID | Priority | สรุป |
|----|----------|------|
| GLOBAL-01 | P1 | BATCHES → Session ทั้งระบบ |
| GLOBAL-02 | P1 | tCO2e ก่อน kgCO2e |
| GLOBAL-03 | P1 | Search/Filter/Sort ทุก list (scale แสนแถว) |
| GLOBAL-04 | P2 | ไร่ 2 ตำแหน่ง + ปุ่มดูเต็ม |
| GLOBAL-05 | P1 | อัปเดตคู่มือทุก PR |
| PORTAL-01 | P2 | Hexagon bg (reduced-motion safe) |
| PORTAL-02 | P1 | Public verification affordance |
| ADMIN-LOGIN-01/02/03 | P1/P1/P2 | Eye toggle / LINE OA / polish |
| ADMIN-DASH-01..04 | P2/P1/P1/P1 | Card สมดุล / Support Tickets / หน่วยคาร์บอน / Quick Access |
| ADMIN-PROJ-01..04 | P1 | ระยะเวลา 1–10+custom / row click / เบอร์ติดต่อ / เครื่องมือ |
| ADMIN-PDD-01..04 | P1/P1/P2/P1 | ประเภทโครงการ / KMZ preview+download / ขยาย sample / PDF generator |
| ADMIN-FARMER-01/02 | P1 | NAME จาก DB+สลับ / filter |
| ADMIN-FARMERDET-01..07 | P2..P1 | cover / plot click / **จังหวัด bug (P0)** / ไร่ / carbon / คอลัมน์โครงการ / filter |
| ADMIN-GIS-01 | P1 | Overlap management (PostGIS) |
| ADMIN-ANN-01/02 | P1 | เครื่องมือ / รูป+targeting+scheduling |
| ADMIN-SYS-01 | P1 | เปิด/ปิด dashboard + maintenance |
| ADMIN-AUDIT-01 | P1 | Filter/Sort |
| ADMIN-USERS-01 | **P0** | Bug สถานะแสดงผิด |
| ADMIN-USERS-02..05 | P1 | username format / ปุ่มบันทึก / สังกัด+password / RBAC |
| ADMIN-POWER-01..03 | **P0** | อนุมัติฟาร์ม / user dependency / ระงับบัญชี+แจ้งเตือน |
| VERIFIER-PROJ-01 | P1 | Project cards + เครื่องมือ |
| VERIFIER-SESS-01..03 | P1 | Rename / stat cards / คอลัมน์+เครื่องมือ |
| VERIFIER-DETAIL-01..03 | P1 | filter+anomaly toggle / ทะเบียน+รอบถัดไป / polygon บน Esri |
| VERIFIER-BASELINE-01 | **P0** | บันทึก+แสดง Baseline (+ ⚠️ ยืนยันศัพท์กับ VGREEN) |
| VERIFIER-NAV-01 | P1 | Help Desk → LINE OA |

---

## 6. ประเด็นที่ต้องตัดสินใจ/ยืนยันก่อนลงมือ (Open Questions)

1. **`ADMIN-PDD-04`** — "choice" ตอน export PDD ที่ต้องการคืออะไร? (ประโยคต้นฉบับถูกตัดจบ)
2. **`VERIFIER-BASELINE-01`** — ป้ายกำกับบนเอกสารทางการควรใช้ "Baseline (เส้นฐาน)" หรือ "Initial Carbon Stock (t=0)"? → ยืนยันกับ VGREEN advisor
3. **`ADMIN-USERS-04`** — เห็นด้วยกับ pattern "ส่งลิงก์ตั้งรหัส/force reset" แทนส่ง plaintext ผ่าน LINE ไหม? หรือยืนยันใช้ generate+ส่งตรง?
4. **PII fields** (`ADMIN-PROJ-03`, `ADMIN-FARMER-01`) — เบอร์ติดต่อ/ชื่อจริง อยู่ใน scope Minimal-PII ที่อนุญาตให้ Admin เห็นหรือไม่?

---

*หมายเหตุ: หัวข้อในเอกสารต้นฉบับระบุ "หมวก 3 ใบ" แต่เนื้อหาครอบคลุม 2 dashboard (Admin, Verifier). Business/Executive Dashboard ยังไม่ได้อยู่ใน UAT รอบนี้ — เตรียม spec รอบถัดไปแยก.*
