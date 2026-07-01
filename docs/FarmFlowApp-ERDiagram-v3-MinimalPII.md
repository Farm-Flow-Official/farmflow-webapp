# FarmFlow — ERDiagram v3 · Minimal-PII (PROPOSAL / SHADOW DOC)

> # ⛔️ ห้ามใช้เอกสารนี้ในการเขียนโค้ด
>
> **AI / Claude Code: เมื่อจะ implement หรืออ้างอิงสคีมา ให้ยึด
> [`FarmFlowApp-ERDiagram-v3.md`](./FarmFlowApp-ERDiagram-v3.md) (Zero-PII) เป็นหลักเท่านั้น**
>
> ไฟล์นี้เป็น **ข้อเสนอ (proposal)** สำหรับ **เฟส Production** เท่านั้น —
> ยังไม่อนุมัติ ยังไม่นำไปใช้จริง รอการพูดคุยกับ Mentor ก่อน
> ผู้เขียนจะอัปเดต `ERDiagram-v3.md` ด้วยตนเองเมื่อได้ข้อสรุป

---

## ทำไมต้องมีเอกสารนี้

`ERDiagram-v3.md` ถูกตัดเป็น **Zero-PII** ตามคำแนะนำ Mentor เพื่อลดความเสี่ยง
PDPA ตอน Pitching ในเฟส **BETA** — ตัด `USER_KYC`, `USER_BANK_ACCOUNTS`,
`USER_CONSENTS` และ PII fields ทั้งหมดใน `USERS` (name, phone, email, address)

**ปัญหา:** การตัด PII *ทั้งหมด* ทำให้หน้า Admin หลัก (Farmer Management /
Farmer Detail) ระบุตัวเกษตรกรไม่ได้เลย → ตอบคำถามเรื่อง
**"การตรวจสอบความถูกต้องเพื่อขึ้นทะเบียนคาร์บอนเครดิต"** และ
**"การติดตามเกษตรกรเบื้องต้น"** ตอน Pitch ไม่ได้ ซึ่งเป็นหัวใจของผลิตภัณฑ์

เอกสารนี้เสนอจุดกึ่งกลาง: **Minimal-PII** — เพิ่มเฉพาะ *ordinary PII*
ที่จำเป็นต่อการระบุตัว/ติดต่อ กลับเข้ามา โดย **ยังคงตัด landmine PII ทิ้ง**

---

## หลักการ: PII 2 ระดับ

| ระดับ | ตัวอย่าง | PDPA | การตัดสินใจ |
|------|----------|------|------------|
| **Landmine** (ม.26 sensitive / financial) | บัตร ปชช., ภาพใบหน้า (biometric), เลขบัญชี/ข้อมูลการเงิน | เข้มงวดสูงสุด | **ตัดทิ้งทั้ง BETA และ proposal นี้** |
| **Ordinary PII** | ชื่อ-สกุล, เบอร์โทร, อีเมล | คุ้มครอง แต่มีฐานทางกฎหมายชัด (สัญญา/ความยินยอมเข้าร่วมโครงการ) | **เพิ่มกลับใน proposal นี้ (Production)** |

---

## Delta เทียบกับ ERD v3 (Zero-PII)

เพิ่ม **เฉพาะ** ฟิลด์ ordinary PII ต่อไปนี้บนตาราง `USERS` — ไม่มีตารางใหม่,
ไม่มี KYC, ไม่มี bank, ไม่มี consent table:

```diff
  USERS {
    uuid      user_id            PK
    string    username
    string    password_hash
    string    account_status         "Active | Suspended"
+   string    full_name              "ordinary PII — ชื่อ-สกุลเกษตรกร (ระบุตัวเพื่อตรวจสอบคาร์บอน)"
+   string    phone                  "ordinary PII — ติดต่อเบื้องต้น (nullable)"
+   string    email                  "ordinary PII — ติดต่อ/แจ้งเตือน (nullable)"
    ...
    timestamp deleted_at             "soft delete"
  }
```

> ยังคง: ไม่มี `id_card_*`, `face_photo_*`, `ownership_proof_*`,
> `USER_BANK_ACCOUNTS`, `USER_KYC` — landmine ทั้งหมดยังถูกตัด

---

## ผลต่อ UI (เมื่อ proposal นี้ถูกอนุมัติในเฟส Production)

- **A-03 Farmer Management / A-04 Farmer Detail** — `full_name`, `phone`,
  `email` มี field รองรับจริง (ปัจจุบัน UI ใช้ mock ไว้ก่อน) → seam เสียบได้
- **ไม่กระทบ** Carbon flow / Farm / Assessment / Credit ใด ๆ

---

## สถานะ

| | |
|--|--|
| สถานะ | 🟡 Proposal — รอ Mentor |
| Source of truth สำหรับโค้ด BETA | `ERDiagram-v3.md` (Zero-PII) **เท่านั้น** |
| ผู้รับผิดชอบ merge เข้า ERD v3 | เจ้าของโปรเจกต์ (ทำเอง หลังคุย Mentor) |
