# FarmFlow Entity Relationship Diagram (ERD)

เอกสารนี้แสดงโครงสร้างฐานข้อมูล (Database Schema) และความสัมพันธ์ระหว่างตาราง (Relations) สำหรับแอปพลิเคชัน และ Web App FarmFlow ซึ่งครอบคลุมตั้งแต่ระบบผู้ใช้งาน, การยืนยันตัวตน (KYC), การจัดการฟาร์ม, ไปจนถึงการคำนวณคาร์บอนเครดิต

```mermaid
erDiagram
  USERS {
    uuid      user_id                 PK  "Primary Key"
    string    sso_provider                "google / line"
    string    sso_user_id                 "ID from provider"
    string    primary_email               "บังคับ unique"
    string    phone_number                "OTP-verified"
    string    secondary_email             "optional"
    string    secondary_phone             "optional"
    string    name_th                     "ชื่อ-นามสกุล TH"
    string    name_en                     "ชื่อ-นามสกุล EN"
    date      date_of_birth               "วันเกิด"
    string    nationality                 "สัญชาติ"
    string    gender                      "เพศตามกฎหมาย"
    string    occupation                  "อาชีพ"
    text      current_address             "ที่อยู่ปัจจุบัน"
    string    profile_picture_url         "optional"
    string    referral_code               "optional"
    string    account_status              "Pending_KYC / Active / Suspended"
    timestamp created_at                  "เวลาสมัคร"
    timestamp updated_at                  "แก้ไขล่าสุด"
    timestamp last_login                  "login ล่าสุด"
    string    registration_device_id      "Anti-Fraud"
    string    registration_ip             "Anti-Fraud"
  }

  USER_KYC {
    uuid      kyc_id                  PK  "Primary Key"
    uuid      user_id                 FK  "ref USERS"
    string    national_id                 "เลข 13 หลัก"
    string    id_card_front_url           "รูปบัตรด้านหน้า"
    string    face_photo_url              "selfie KYC"
    string    kyc_status                  "Pending / Approved / Rejected"
    string    kyc_reviewer_id             "admin ผู้ตรวจ"
    text      kyc_rejection_reason        "เหตุผลปฏิเสธ"
    timestamp kyc_submitted_at            "ยื่นเมื่อ"
    timestamp kyc_reviewed_at             "ตรวจเมื่อ"
  }

  USER_BANK_ACCOUNTS {
    uuid      bank_account_id         PK  "Primary Key"
    uuid      user_id                 FK  "ref USERS"
    string    bank_name                   "ชื่อธนาคาร"
    string    account_name               "ชื่อบัญชี"
    string    account_number             "เลขบัญชี"
    boolean   is_verified                "ตรวจสอบแล้ว"
    boolean   is_active                  "บัญชีหลักปัจจุบัน"
    timestamp created_at                 ""
  }

  USER_CONSENTS {
    uuid      consent_id              PK  "Primary Key"
    uuid      user_id                 FK  "ref USERS"
    string    consent_type                "PDPA / TnC / Accuracy"
    boolean   consented                   "true=ยอมรับ"
    string    consent_version             "version ของ T&C"
    timestamp consented_at                "เวลากดยืนยัน"
    string    ip_address                  "IP ขณะยืนยัน"
  }

  FARMS {
    uuid      farm_id                 PK  "Primary Key"
    uuid      owner_user_id           FK  "ref USERS"
    string    farm_name                   "ชื่อฟาร์ม"
    text      farm_address                "ที่ตั้งฟาร์ม"
    string    farm_cover_photo_url        "optional"
    float     checkin_lat                 "GPS lat ตอนลงทะเบียน"
    float     checkin_lng                 "GPS lng ตอนลงทะเบียน"
    json      farm_polygon_geojson        "GeoJSON boundary"
    float     declared_area_rai           "ไร่ ตามที่กรอก"
    float     calculated_area_rai         "ไร่ คำนวณจาก polygon"
    boolean   area_discrepancy_flag       "เกินเกณฑ์ 15%"
    string    farm_status                 "Draft/Pending/Active/Rejected"
    boolean   overlap_validation_flag     "ทับซ้อนฟาร์มอื่น"
    json      gee_verification_result     "ผล NDVI"
    timestamp created_at                  ""
    timestamp updated_at                  ""
  }

  FARM_AGRICULTURAL_DATA {
    uuid      agri_id                 PK  "Primary Key"
    uuid      farm_id                 FK  "ref FARMS"
    uuid      species_code            FK  "ref SPECIES_EQUATIONS"
    int       planting_year               "ปีที่เริ่มปลูก"
    float     tree_density_per_rai        "จำนวนต้น/ไร่"
    timestamp updated_at                  ""
  }

  FARM_LAND_DOCUMENTS {
    uuid      doc_id                  PK  "Primary Key"
    uuid      farm_id                 FK  "ref FARMS"
    string    document_type               "โฉนด / นส.4 / ฯลฯ"
    string    document_number             "เลขที่เอกสาร"
    string    ownership_proof_url         "รูปเอกสารสิทธิ์"
    string    doc_status                  "Pending / Verified / Rejected"
    timestamp uploaded_at                 ""
  }

  SUBPLOTS {
    uuid      subplot_id              PK  "Primary Key"
    uuid      farm_id                 FK  "ref FARMS"
    uuid      species_code            FK  "ref SPECIES_EQUATIONS"
    string    subplot_name                "ชื่อแปลงย่อย"
    json      subplot_polygon_geojson     "boundary แปลงย่อย"
    float     subplot_area_rai            "ขนาดแปลงย่อย"
    timestamp created_at                  ""
  }

  TVER_CONSTANTS {
    uuid      constant_id             PK  "Primary Key"
    float     co2_multiplier              "44/12 = 3.6667 แปลง C to CO2e"
    float     mai_kg_per_tree_per_year    "9.5 kgCO2/ต้น/ปี Option 1"
    string    tver_version                "T-VER-S-TOOL-01-01 v02"
    string    issued_by                   "อบก. TGO"
    date      effective_date              "26 มีนาคม 2568"
    timestamp created_at                  ""
  }

  SPECIES_EQUATIONS {
    uuid      species_code            PK  "Primary Key"
    uuid      constant_id             FK  "ref TVER_CONSTANTS"
    string    species_name_th             "ชื่อชนิดไม้ภาษาไทย"
    string    species_name_en             "ชื่อชนิดไม้ภาษาอังกฤษ"
    string    equation_group              "OGW/DUR/MNG/PLM/BAM/VIN ฯลฯ"
    string    equation_formula            "D2H_OGW / D0_DUR / H_PLM ฯลฯ"
    string    measurement_point           "1.30m DBH / ระดับดิน D0 / H เท่านั้น"
    string    default_circumference_unit  "นิ้ว หรือ cm ตามชนิดไม้"
    float     r_value                     "Root:Shoot Ratio 0.27/0.48/0.41"
    float     cf_value                    "Carbon Fraction 0.47/0.4715"
    string    forest_category             "ไม้เศรษฐกิจ/ป่าไม้/ปาล์ม/ไผ่"
    string    tver_reference              "Ogawa 1965 / ลดาวัลย์ 2561 ฯลฯ"
    boolean   requires_height             "ต้องวัดความสูง H หรือไม่"
    boolean   use_d0_not_dbh              "true = ทุเรียน วัดระดับดิน"
    boolean   use_remote_sensing          "true = ป่าเต็งรัง/ชายเลน ใช้ RS"
    timestamp created_at                  ""
    timestamp updated_at                  ""
  }

  ASSESSMENT_SESSIONS {
    uuid      session_id              PK  "Primary Key"
    uuid      farm_id                 FK  "ref FARMS"
    uuid      user_id                 FK  "ref USERS"
    uuid      subplot_id              FK  "nullable ref SUBPLOTS"
    string    sync_status                 "Pending_Local/Uploading/Synced/Failed"
    string    ai_batch_status             "Waiting/Processing/Completed/Rejected"
    int       total_snaps                 "จำนวนรูปทั้งหมด"
    int       passed_snaps                "รูปที่ผ่าน AI"
    float     session_pass_rate           "อัตราผ่าน %"
    float     total_carbon_kgco2e         "คาร์บอนรวมใน session"
    timestamp first_snap_at               "รูปแรก (Offline limit)"
    timestamp synced_at                   "เวลา sync"
    timestamp completed_at                "AI ประมวลผลเสร็จ"
    timestamp created_at                  ""
  }

  TREE_SNAPSHOTS {
    uuid      snapshot_id             PK  "Primary Key (SNAP-001)"
    uuid      session_id              FK  "ref ASSESSMENT_SESSIONS"
    string    tree_tag_id                 "optional QR tag"
    string    photo_url                   "รูปถ่ายต้นไม้"
    float     tree_circumference_cm       "CBH ที่เกษตรกรวัดมา"
    string    circumference_unit          "นิ้ว หรือ cm ที่วัดมาจริง"
    float     dbh_cm                      "DBH หลังแปลง circ/pi"
    float     tree_height_m               "H ความสูง เมตร"
    float     d2h                         "D2H = DBH x DBH x H"
    float     ws_kg                       "WS มวลชีวภาพลำต้น kg"
    float     wb_kg                       "WB มวลชีวภาพกิ่ง kg"
    float     wl_kg                       "WL มวลชีวภาพใบ kg"
    float     wt_abg_kg                   "WT_ABG รวมเหนือดิน kg"
    float     b_abg_t                     "bABG ตัน"
    float     b_blg_t                     "bBLG ใต้ดิน ตัน"
    float     b_tree_t                    "bTREE รวมทั้งต้น ตัน"
    float     c_tree_tc                   "cTREE คาร์บอน tC"
    float     capture_lat                 "GPS lat ขณะถ่าย"
    float     capture_lng                 "GPS lng ขณะถ่าย"
    boolean   within_farm_boundary        "อยู่ในขอบเขต?"
    timestamp secure_timestamp            "GPS time / OS time"
    boolean   timestamp_encrypted         "encrypt flag"
    string    device_id                   "Device identifier"
    string    device_model                "รุ่นมือถือ"
    string    os_version                  "iOS/Android version"
    string    weather_condition           "แดด/เมฆ/ฝน"
    string    ai_assessment_status        "Waiting/Completed/Rejected"
    float     ai_confidence_score         "0.00-1.00"
    float     estimated_carbon_kgco2e     "kgCO2e ผลลัพธ์สุดท้าย"
    text      ai_rejection_reason         "เหตุผล reject"
    timestamp created_at                  ""
  }

  CARBON_MARKET_CONFIG {
    uuid      config_id               PK  "Primary Key"
    float     market_price_thb            "ราคา THB/tCO2e"
    string    price_source                "manual / API"
    string    updated_by                  "admin user_id"
    timestamp effective_from              "มีผลตั้งแต่"
    timestamp created_at                  ""
  }

  SURVEY_STREAKS {
    uuid      streak_id               PK  "Primary Key"
    uuid      user_id                 FK  "ref USERS"
    uuid      farm_id                 FK  "ref FARMS"
    int       year                        "ปี"
    int       month                       "เดือน 1-12"
    boolean   streak_achieved             "ผ่านเกณฑ์เดือนนี้"
    float     min_snap_threshold_pct      "เกณฑ์ขั้นต่ำ 35%"
    int       total_fire_count            "ไฟสะสมปีนี้"
    timestamp achieved_at                 "เวลาที่ผ่านเกณฑ์"
  }

  NOTIFICATIONS {
    uuid      notification_id         PK  "Primary Key"
    uuid      user_id                 FK  "ref USERS"
    string    notification_type           "Gamification/Operational/Market"
    string    title                       "หัวข้อ"
    text      body                        "เนื้อหา"
    boolean   is_read                     "อ่านแล้ว"
    string    related_entity_type         "session / farm / streak"
    uuid      related_entity_id           "FK แบบ polymorphic"
    timestamp sent_at                     ""
    timestamp read_at                     ""
  }

  USERS                 ||--o{ USER_KYC                : "ยืนยันตัวตน"
  USERS                 ||--o{ USER_BANK_ACCOUNTS      : "บัญชีธนาคาร"
  USERS                 ||--o{ USER_CONSENTS           : "ให้ความยินยอม"
  USERS                 ||--o{ FARMS                   : "เป็นเจ้าของ"
  USERS                 ||--o{ ASSESSMENT_SESSIONS     : "ทำการประเมิน"
  USERS                 ||--o{ SURVEY_STREAKS          : "สะสมไฟ"
  USERS                 ||--o{ NOTIFICATIONS           : "รับแจ้งเตือน"
  FARMS                 ||--o{ FARM_AGRICULTURAL_DATA  : "ข้อมูลเกษตร"
  FARMS                 ||--o{ FARM_LAND_DOCUMENTS     : "เอกสารสิทธิ์"
  FARMS                 ||--o{ SUBPLOTS                : "แบ่งแปลงย่อย"
  FARMS                 ||--o{ ASSESSMENT_SESSIONS     : "ถูกประเมิน"
  FARMS                 ||--o{ SURVEY_STREAKS          : "ต่อฟาร์ม"
  SUBPLOTS              |o--o{ ASSESSMENT_SESSIONS     : "optional"
  ASSESSMENT_SESSIONS   ||--o{ TREE_SNAPSHOTS          : "มีรูปถ่าย"
  TVER_CONSTANTS        ||--o{ SPECIES_EQUATIONS       : "กำหนดค่าคงที่"
  SPECIES_EQUATIONS     ||--o{ FARM_AGRICULTURAL_DATA  : "กำหนดสมการฟาร์ม"
  SPECIES_EQUATIONS     ||--o{ SUBPLOTS                : "กำหนดสมการแปลงย่อย"