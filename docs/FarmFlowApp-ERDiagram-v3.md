# FarmFlow — ERDiagram-v3.md
# Database Schema Reference สำหรับ Claude Code

<!--
  METADATA
  ─────────────────────────────────────────────────────
  Project       : FarmFlow Carbon FinTech Platform
  Version       : v3.0 — Prototype Final (Zero-PII)
  Author        : นาย วัยวัฒน์ อภิรักษ์ทานนท์
  Tables        : 21 tables / 8 groups
  Notation      : Crow's Foot (Mermaid erDiagram)
  Stack hint    : PostgreSQL + PostGIS | S3 file storage | JWT auth
  Last updated  : 2025

  DESIGN DECISIONS (อ่านก่อนเขียน Code)
  ─────────────────────────────────────────────────────
  1. Zero-PII Prototype
     - ไม่มี USER_KYC, USER_CONSENTS, USER_BANK_ACCOUNTS
     - ไม่มี PII fields ใน USERS (ไม่มี email, phone, name_th, address ฯลฯ)
     - account_status = "Active" | "Suspended" เท่านั้น (ไม่มี Pending_KYC)

  2. Auth Strategy
     - Prototype: Username + password_hash (bcrypt)
     - Future-ready: sso_provider + sso_user_id fields เตรียมไว้แล้ว
     - Session: JWT Access Token (short-lived) + REFRESH_TOKENS table

  3. File Storage
     - ไฟล์ทุกประเภทผ่าน FILES table เดียว (Centralized)
     - FK ชื่อ *_file_id ชี้ไปยัง FILES.file_id เสมอ
     - ไม่มี *_url fields โดยตรงในตารางอื่น (ยกเว้นผ่าน FILES)

  4. Species PK
     - SPECIES_EQUATIONS ใช้ species_id (uuid) เป็น PK
     - species_code เป็น string field แยก (human-readable code เช่น OGW-TEAK)
     - FK ทุกตารางที่ชี้ไปใช้ชื่อ species_id เสมอ

  5. Calculation Separation
     - Intermediate values (D2H, WS, WB...) อยู่ใน CARBON_CALCULATION_LOGS
     - TREE_SNAPSHOTS เก็บแค่ input + estimated_carbon_kgco2e (final result)
     - ASSESSMENT_SESSIONS.total_carbon_kgco2e = Denormalized aggregate สำหรับ Dashboard perf

  6. Soft Delete
     - ตารางที่มี deleted_at: USERS, ADMINS, FARMS, SUBPLOTS, FILES
     - Query ทุก SELECT ควร WHERE deleted_at IS NULL เสมอ

  7. Offline Mode
     - SYNC_JOBS จัดการ Queue สำหรับ Snapshot/Session ที่ถ่ายออฟไลน์
     - ASSESSMENT_SESSIONS.first_snap_at ใช้นับ 10-hour deadline
     - เกิน 10 ชั่วโมง: set sync_status = "Failed" และ reject session

  8. Carbon Flow (สำคัญมาก)
     TREE_SNAPSHOTS → CARBON_CALCULATION_LOGS → estimated_carbon_kgco2e
     ASSESSMENT_SESSIONS (aggregate) → ASSESSMENT_RESULTS (Admin approve)
     → CARBON_CREDIT_BATCHES → CREDIT_TRANSACTIONS
-->

---

## Key Business Rules (Claude Code ต้องรู้)

| Rule | Field / Logic |
|------|---------------|
| GPS-only check-in | `FARMS.checkin_lat/lng` — ห้าม manual input |
| Live Camera only | `TREE_SNAPSHOTS.photo_file_id` — ห้าม Gallery |
| 27m boundary | `within_farm_boundary` = false → reject snap |
| 10h offline limit | `first_snap_at` + 10h → auto reject session |
| 10% false tolerance | `session_pass_rate` >= 90% = session pass |
| Area variance | `declared` vs `calculated` > 15% → `area_discrepancy_flag` = true |
| Overlap check | PostGIS ST_Intersects → `overlap_validation_flag` = true |
| AI chunking | 20 snaps/chunk → JSON Array → Gemini Flash 3 API |
| Streak threshold | passed snaps >= 35% of `tree_density_per_rai` × farm area |
| Soft delete | Always filter `WHERE deleted_at IS NULL` |
| Carbon formula | DBH = circ ÷ π → D2H → Allometric → bTREE → cTREE → CO2e |
| Price disclaimer | Estimated value = carbon × market_price (คาดการณ์เท่านั้น) |

---

## Enum Reference

```
USERS.account_status          : "Active" | "Suspended"
FARMS.farm_status             : "Draft" | "Pending" | "Active" | "Rejected" | "Suspended"
ASSESSMENT_SESSIONS.sync_status    : "Pending_Local" | "Uploading" | "Synced" | "Failed"
ASSESSMENT_SESSIONS.ai_batch_status: "Waiting" | "Processing" | "Completed" | "Rejected"
TREE_SNAPSHOTS.ai_assessment_status: "Waiting" | "Completed" | "Rejected"
CARBON_CREDIT_BATCHES.status  : "Pending" | "Issued" | "Sold" | "Retired"
SYNC_JOBS.sync_status         : "Pending" | "Synced" | "Failed"
FILES.uploader_type           : "USER" | "ADMIN" | "SYSTEM"
FILES.access_level            : "PUBLIC" | "PRIVATE"
AUDIT_LOGS.actor_type         : "USER" | "ADMIN" | "SYSTEM"
AUDIT_LOGS.action             : "CREATE" | "UPDATE" | "DELETE" | "APPROVE"
STATUS_HISTORIES.entity_type  : "FARM" | "SESSION"
STATUS_HISTORIES.changed_by_type : "USER" | "ADMIN" | "SYSTEM"
NOTIFICATIONS.notification_type  : "Gamification" | "Operational" | "Market"
NOTIFICATIONS.related_entity_type: "session" | "farm" | "streak" | "batch"
ROLES.role_name               : "SuperAdmin" | "Auditor" | "Verifier"
ADMINS.admin_status           : "Active" | "Inactive"
AI_MODELS.model_type          : "Tree Detection" | "Measurement" | "Validation"
```

---

## ERD (Mermaid — Crow's Foot Notation)

```mermaid
erDiagram

  %% ══════════════════════════════════════════
  %% GROUP 1: CORE USERS & AUTH (4 tables)
  %% ══════════════════════════════════════════

  USERS {
    uuid      user_id                 PK  "Primary Key"
    string    sso_provider                "google | line — future SSO"
    string    sso_user_id                 "ID from SSO Provider — future"
    string    username                    "Display name on Dashboard"
    string    password_hash               "bcrypt — Prototype auth"
    uuid      profile_avatar_file_id  FK  "→ FILES.file_id"
    string    account_status              "Active | Suspended"
    string    referral_code               "nullable — campaign use"
    timestamp created_at                  "account created"
    timestamp updated_at                  "profile last modified"
    timestamp last_login                  "last login timestamp"
    timestamp deleted_at                  "nullable — Soft Delete"
  }

  REFRESH_TOKENS {
    uuid      token_id                PK  "Primary Key"
    uuid      user_id                 FK  "→ USERS.user_id"
    string    token_hash                  "hashed JWT refresh token"
    timestamp expires_at                  "token expiry"
    boolean   is_revoked                  "true after logout or rotation"
    timestamp created_at                  ""
  }

  DEVICES {
    uuid      device_id               PK  "Primary Key"
    uuid      user_id                 FK  "→ USERS.user_id"
    string    hardware_id_hash            "hashed device fingerprint — Anti-Fraud"
    string    device_model                "e.g. iPhone 15, Samsung S24"
    string    os_version                  "iOS 17.x | Android 14"
    string    app_version                 "FarmFlow semver e.g. 1.0.0"
    timestamp last_sync_at                "last successful sync"
    timestamp created_at                  ""
  }

  PUSH_TOKENS {
    uuid      token_id                PK  "Primary Key"
    uuid      user_id                 FK  "→ USERS.user_id"
    uuid      device_id               FK  "→ DEVICES.device_id"
    string    fcm_apns_token              "FCM (Android) or APNS (iOS) token"
    string    platform                    "ios | android"
    timestamp updated_at                  "refresh on app reopen"
  }

  %% ══════════════════════════════════════════
  %% GROUP 2: ADMINS & RBAC (2 tables)
  %% ══════════════════════════════════════════

  ROLES {
    uuid      role_id                 PK  "Primary Key"
    string    role_name                   "SuperAdmin | Auditor | Verifier"
    json      permissions                 "array of permitted action strings"
    timestamp created_at                  ""
    timestamp updated_at                  ""
  }

  ADMINS {
    uuid      admin_id                PK  "Primary Key"
    string    username                    "admin login username"
    string    password_hash               "bcrypt"
    uuid      role_id                 FK  "→ ROLES.role_id"
    string    admin_status                "Active | Inactive"
    timestamp created_at                  ""
    timestamp updated_at                  ""
    timestamp last_login                  ""
    timestamp deleted_at                  "nullable — Soft Delete"
  }

  %% ══════════════════════════════════════════
  %% GROUP 3: SYSTEM INFRASTRUCTURE (4 tables)
  %% ══════════════════════════════════════════

  FILES {
    uuid      file_id                 PK  "Primary Key"
    string    uploader_id                 "user_id or admin_id string"
    string    uploader_type               "USER | ADMIN | SYSTEM"
    string    file_path                   "S3 object key / storage path"
    string    file_type                   "MIME type e.g. image/jpeg"
    string    access_level                "PUBLIC | PRIVATE"
    string    checksum_hash               "MD5 or SHA256 for integrity check"
    timestamp created_at                  ""
    timestamp deleted_at                  "nullable — Soft Delete"
  }

  AUDIT_LOGS {
    uuid      log_id                  PK  "Primary Key — append-only"
    string    actor_id                    "user_id or admin_id"
    string    actor_type                  "USER | ADMIN | SYSTEM"
    string    action                      "CREATE | UPDATE | DELETE | APPROVE"
    string    table_name                  "affected table name"
    string    record_id                   "affected record PK"
    json      old_data                    "snapshot before change — nullable"
    json      new_data                    "snapshot after change"
    timestamp created_at                  "immutable event time"
  }

  STATUS_HISTORIES {
    uuid      history_id              PK  "Primary Key — append-only"
    string    entity_type                 "FARM | SESSION"
    uuid      entity_id                   "polymorphic FK to entity PK"
    string    old_status                  "previous status value"
    string    new_status                  "new status value"
    string    changed_by                  "admin_id or user_id string"
    string    changed_by_type             "USER | ADMIN | SYSTEM"
    text      reason                      "nullable — reason for change"
    timestamp created_at                  ""
  }

  SYNC_JOBS {
    uuid      job_id                  PK  "Primary Key"
    uuid      device_id               FK  "→ DEVICES.device_id"
    uuid      user_id                 FK  "→ USERS.user_id"
    string    mutation_type               "CREATE | UPDATE"
    string    entity_type                 "SNAPSHOT | SESSION"
    uuid      entity_id                   "ID of entity to sync"
    json      payload                     "full entity data for sync"
    string    sync_status                 "Pending | Synced | Failed"
    int       retry_count                 "max 3 before marking Failed"
    timestamp created_at                  "offline capture time"
    timestamp synced_at                   "nullable — success time"
  }

  %% ══════════════════════════════════════════
  %% GROUP 4: FARMS & SUBPLOTS (3 tables)
  %% ══════════════════════════════════════════

  FARMS {
    uuid      farm_id                 PK  "Primary Key"
    uuid      owner_user_id           FK  "→ USERS.user_id"
    uuid      cover_photo_file_id     FK  "→ FILES.file_id — nullable"
    string    farm_name                   "display name"
    text      farm_address                "full address — separate from user address"
    float     checkin_lat                 "GPS latitude — system-set only, no manual input"
    float     checkin_lng                 "GPS longitude — system-set only, no manual input"
    json      farm_polygon_geojson        "GeoJSON Polygon — PostGIS GEOMETRY(Polygon,4326)"
    float     declared_area_rai           "farmer-declared area in rai"
    float     calculated_area_rai         "system-calculated from polygon — auto"
    boolean   area_discrepancy_flag       "true if |declared-calculated| > 15%"
    boolean   overlap_validation_flag     "true if polygon overlaps another farm"
    json      gee_verification_result     "Google Earth Engine NDVI result JSON"
    string    farm_status                 "Draft | Pending | Active | Rejected | Suspended"
    timestamp created_at                  ""
    timestamp updated_at                  ""
    timestamp deleted_at                  "nullable — Soft Delete"
  }

  FARM_AGRICULTURAL_DATA {
    uuid      agri_id                 PK  "Primary Key"
    uuid      farm_id                 FK  "→ FARMS.farm_id"
    uuid      species_id              FK  "→ SPECIES_EQUATIONS.species_id"
    int       planting_year               "YYYY — used to calculate tree age"
    float     tree_density_per_rai        "trees per rai — used for Streak threshold (35%)"
    timestamp updated_at                  ""
  }

  SUBPLOTS {
    uuid      subplot_id              PK  "Primary Key"
    uuid      farm_id                 FK  "→ FARMS.farm_id"
    uuid      species_id              FK  "→ SPECIES_EQUATIONS.species_id"
    string    subplot_name                "e.g. โซนต้นสัก, โซนต้นยาง"
    json      subplot_polygon_geojson     "nullable — GeoJSON for sub-area"
    float     subplot_area_rai            "nullable — sub-area size in rai"
    timestamp created_at                  ""
    timestamp updated_at                  ""
    timestamp deleted_at                  "nullable — Soft Delete"
  }

  %% ══════════════════════════════════════════
  %% GROUP 5: SPECIES & T-VER CONSTANTS (2 tables)
  %% ══════════════════════════════════════════

  TVER_CONSTANTS {
    uuid      constant_id             PK  "Primary Key"
    float     co2_multiplier              "44/12 = 3.6667 — convert tC to tCO2e"
    float     mai_kg_per_tree_per_year    "9.5 — used in Option 1 simple count"
    string    tver_version                "T-VER-S-TOOL-01-01 v02"
    string    issued_by                   "TGO (Thailand Greenhouse Gas Organization)"
    date      effective_date              "2025-03-26"
    timestamp created_at                  ""
  }

  SPECIES_EQUATIONS {
    uuid      species_id              PK  "Primary Key — uuid"
    uuid      constant_id             FK  "→ TVER_CONSTANTS.constant_id"
    string    species_code                "human-readable code e.g. OGW-TEAK, DUR-DURIAN"
    string    species_name_th             "Thai species name"
    string    species_name_en             "English species name"
    string    equation_group              "OGW | DUR | MNG | PLM | BAM | VIN | ..."
    string    equation_formula            "D2H_OGW | D0_DUR | H_PLM | ..."
    string    measurement_point           "1.30m DBH | ground D0 | height H only"
    string    default_circumference_unit  "cm | inch — default for this species"
    float     r_value                     "Root-to-Shoot ratio e.g. 0.27 | 0.48"
    float     cf_value                    "Carbon Fraction e.g. 0.47 | 0.4715"
    string    forest_category             "ไม้เศรษฐกิจ | ป่าไม้ | ปาล์ม | ไผ่"
    string    tver_reference              "e.g. Ogawa 1965 | ลดาวัลย์ 2561"
    boolean   requires_height             "true — must collect tree_height_m"
    boolean   use_d0_not_dbh              "true — measure at ground (durian etc.)"
    boolean   use_remote_sensing          "true — mixed forest, mangrove (no field measure)"
    timestamp created_at                  ""
    timestamp updated_at                  ""
  }

  %% ══════════════════════════════════════════
  %% GROUP 6: ASSESSMENT FLOW (5 tables)
  %% Data flow: SNAP → SYNC → AI → CALC → RESULT
  %% ══════════════════════════════════════════

  ASSESSMENT_SESSIONS {
    uuid      session_id              PK  "Primary Key"
    uuid      farm_id                 FK  "→ FARMS.farm_id"
    uuid      user_id                 FK  "→ USERS.user_id"
    uuid      subplot_id              FK  "→ SUBPLOTS.subplot_id — nullable"
    string    sync_status                 "Pending_Local | Uploading | Synced | Failed"
    string    ai_batch_status             "Waiting | Processing | Completed | Rejected"
    int       total_snaps                 "total photos in session"
    int       passed_snaps                "photos passed AI evaluation"
    float     session_pass_rate           "passed/total × 100 — must >= 90% to pass"
    float     total_carbon_kgco2e         "SUM of snapshot results — denormalized for perf"
    timestamp first_snap_at               "first photo time — start of 10hr offline window"
    timestamp synced_at                   "nullable — cloud upload complete"
    timestamp completed_at                "nullable — AI batch processing complete"
    timestamp created_at                  ""
  }

  TREE_SNAPSHOTS {
    uuid      snapshot_id             PK  "Primary Key — format: SNAP-{uuid}"
    uuid      session_id              FK  "→ ASSESSMENT_SESSIONS.session_id"
    uuid      photo_file_id           FK  "→ FILES.file_id — Live Camera only, no Gallery"
    uuid      device_id               FK  "→ DEVICES.device_id"
    uuid      ai_model_id             FK  "→ AI_MODELS.model_id"
    string    tree_tag_id                 "nullable — QR code or paint tag for annual tracking"
    float     tree_circumference_cm       "CBH measured at 1.3m breast height"
    string    circumference_unit          "cm | inch — actual unit used by farmer"
    float     dbh_cm                      "system-computed: circumference_cm / π"
    float     tree_height_m               "nullable — required if species.requires_height = true"
    float     capture_lat                 "GPS latitude at shutter press"
    float     capture_lng                 "GPS longitude at shutter press"
    boolean   within_farm_boundary        "system-set: false if > 27m outside farm polygon"
    timestamp secure_timestamp            "GPS time (primary) | OS time (fallback, encrypted)"
    boolean   timestamp_encrypted         "true when OS time used — prevents time spoofing"
    string    weather_condition           "sunny | cloudy | rainy — fetched after sync"
    string    ai_assessment_status        "Waiting | Completed | Rejected"
    float     ai_confidence_score         "0.0000 – 1.0000 — from AI model"
    float     estimated_carbon_kgco2e     "final result in kgCO2e — from CARBON_CALCULATION_LOGS"
    text      ai_rejection_reason         "nullable — e.g. blurry image, no tree detected"
    timestamp created_at                  ""
  }

  AI_MODELS {
    uuid      model_id                PK  "Primary Key"
    string    version_tag                 "e.g. gemini-flash-3-v1"
    string    model_type                  "Tree Detection | Measurement | Validation"
    boolean   is_active                   "only one active model per type at a time"
    timestamp deployed_at                 ""
    timestamp retired_at                  "nullable"
  }

  CARBON_CALCULATION_LOGS {
    uuid      calc_log_id             PK  "Primary Key — one per snapshot"
    uuid      snapshot_id             FK  "→ TREE_SNAPSHOTS.snapshot_id"
    uuid      species_id              FK  "→ SPECIES_EQUATIONS.species_id"
    uuid      constant_id             FK  "→ TVER_CONSTANTS.constant_id"
    float     d2h                         "DBH² × H"
    float     ws_kg                       "stem biomass kg"
    float     wb_kg                       "branch biomass kg"
    float     wl_kg                       "leaf biomass kg"
    float     wt_abg_kg                   "WS + WB + WL — above-ground total kg"
    float     b_abg_t                     "above-ground biomass tonnes"
    float     b_blg_t                     "below-ground biomass tonnes (× r_value)"
    float     b_tree_t                    "b_abg + b_blg — total tree biomass tonnes"
    float     c_tree_tc                   "b_tree × cf_value — carbon in tC"
    float     carbon_tco2e                "c_tree × co2_multiplier — final tCO2e"
    json      formula_snapshot            "immutable copy of equation params used at calc time"
    timestamp calculated_at               ""
  }

  ASSESSMENT_RESULTS {
    uuid      result_id               PK  "Primary Key"
    uuid      session_id              FK  "→ ASSESSMENT_SESSIONS.session_id"
    float     total_approved_tco2e        "total carbon approved for credit issuance"
    int       total_passed_trees          ""
    int       total_rejected_trees        ""
    uuid      approved_by_admin_id    FK  "→ ADMINS.admin_id — required before batch creation"
    timestamp approved_at                 "nullable — set when admin approves"
    timestamp created_at                  ""
  }

  %% ══════════════════════════════════════════
  %% GROUP 7: CARBON MARKET & CREDIT (3 tables)
  %% ══════════════════════════════════════════

  CARBON_MARKET_CONFIG {
    uuid      config_id               PK  "Primary Key"
    float     market_price_thb            "THB per tCO2e — global variable"
    string    price_source                "manual | api_t-ver | api_verra"
    uuid      updated_by_admin_id     FK  "→ ADMINS.admin_id"
    timestamp effective_from              "price takes effect at this time"
    timestamp created_at                  ""
  }

  CARBON_CREDIT_BATCHES {
    uuid      batch_id                PK  "Primary Key"
    uuid      farm_id                 FK  "→ FARMS.farm_id"
    uuid      result_id               FK  "→ ASSESSMENT_RESULTS.result_id"
    int       vintage_year                "year carbon was sequestered"
    float     total_tco2e                 "total credits in this batch"
    string    verification_standard       "T-VER | Verra VCS"
    string    status                      "Pending | Issued | Sold | Retired"
    timestamp issued_at                   "nullable — set when status = Issued"
    timestamp created_at                  ""
  }

  CREDIT_TRANSACTIONS {
    uuid      tx_id                   PK  "Primary Key"
    uuid      batch_id                FK  "→ CARBON_CREDIT_BATCHES.batch_id"
    string    buyer_id                    "platform or 3rd-party buyer identifier"
    float     amount_tco2e               "tCO2e purchased in this tx"
    float     price_per_unit_thb          "locked price at transaction time"
    float     total_amount_thb            "amount_tco2e × price_per_unit_thb"
    timestamp tx_date                     ""
    timestamp created_at                  ""
  }

  %% ══════════════════════════════════════════
  %% GROUP 8: GAMIFICATION & NOTIFICATIONS (2 tables)
  %% ══════════════════════════════════════════

  SURVEY_STREAKS {
    uuid      streak_id               PK  "Primary Key"
    uuid      user_id                 FK  "→ USERS.user_id"
    uuid      farm_id                 FK  "→ FARMS.farm_id — streak tracked per farm"
    int       year                        "YYYY"
    int       month                       "1–12"
    boolean   streak_achieved             "true if snapped >= 35% of trees this month"
    float     min_snap_threshold_pct      "default 0.35 — configurable"
    int       total_fire_count            "sum of achieved months in year (0–12)"
    timestamp achieved_at                 "nullable — when streak was achieved this month"
  }

  NOTIFICATIONS {
    uuid      notification_id         PK  "Primary Key"
    uuid      user_id                 FK  "→ USERS.user_id"
    string    notification_type           "Gamification | Operational | Market"
    string    title                       "push notification title"
    text      body                        "push notification body"
    boolean   is_read                     "false by default"
    string    related_entity_type         "session | farm | streak | batch — polymorphic"
    uuid      related_entity_id           "FK to related entity — polymorphic"
    timestamp sent_at                     ""
    timestamp read_at                     "nullable — set when user reads"
  }

  %% ══════════════════════════════════════════
  %% RELATIONSHIPS
  %% ══════════════════════════════════════════

  %% -- Group 1: Users & Auth
  USERS             ||--o{ REFRESH_TOKENS       : "has tokens"
  USERS             ||--o{ DEVICES              : "uses devices"
  USERS             ||--o{ PUSH_TOKENS          : "receives push"
  USERS             ||--o{ SYNC_JOBS            : "has sync queue"
  USERS             ||--o{ FARMS                : "owns"
  USERS             ||--o{ ASSESSMENT_SESSIONS  : "performs"
  USERS             ||--o{ SURVEY_STREAKS       : "earns streaks"
  USERS             ||--o{ NOTIFICATIONS        : "receives"
  DEVICES           ||--o{ PUSH_TOKENS          : "linked token"
  DEVICES           ||--o{ SYNC_JOBS            : "creates jobs"
  DEVICES           ||--o{ TREE_SNAPSHOTS       : "captures"

  %% -- Group 2: Admins & RBAC
  ROLES             ||--o{ ADMINS               : "assigned to"
  ADMINS            ||--o{ ASSESSMENT_RESULTS   : "approves"
  ADMINS            ||--o{ CARBON_MARKET_CONFIG : "updates price"

  %% -- Group 3: Files (centralized)
  FILES             ||--o{ USERS                : "avatar"
  FILES             ||--o{ FARMS                : "cover photo"
  FILES             ||--o{ TREE_SNAPSHOTS       : "photo"

  %% -- Group 4: Farms
  FARMS             ||--o{ FARM_AGRICULTURAL_DATA : "has agri data"
  FARMS             ||--o{ SUBPLOTS               : "has subplots"
  FARMS             ||--o{ ASSESSMENT_SESSIONS    : "assessed in"
  FARMS             ||--o{ SURVEY_STREAKS         : "tracked per farm"
  FARMS             ||--o{ CARBON_CREDIT_BATCHES  : "issues credits"
  SUBPLOTS          |o--o{ ASSESSMENT_SESSIONS    : "optional scope"

  %% -- Group 5: Species & T-VER
  TVER_CONSTANTS    ||--o{ SPECIES_EQUATIONS      : "defines constants"
  TVER_CONSTANTS    ||--o{ CARBON_CALCULATION_LOGS: "referenced in calc"
  SPECIES_EQUATIONS ||--o{ FARM_AGRICULTURAL_DATA : "main species"
  SPECIES_EQUATIONS ||--o{ SUBPLOTS               : "subplot species"
  SPECIES_EQUATIONS ||--o{ CARBON_CALCULATION_LOGS: "formula used"

  %% -- Group 6: Assessment flow
  ASSESSMENT_SESSIONS   ||--o{ TREE_SNAPSHOTS          : "contains"
  ASSESSMENT_SESSIONS   ||--o{ ASSESSMENT_RESULTS      : "summarized in"
  ASSESSMENT_SESSIONS   ||--o{ NOTIFICATIONS           : "triggers"
  TREE_SNAPSHOTS        ||--o{ CARBON_CALCULATION_LOGS : "calculated from"
  AI_MODELS             ||--o{ TREE_SNAPSHOTS          : "evaluates"
  ASSESSMENT_RESULTS    ||--o{ CARBON_CREDIT_BATCHES   : "enables"

  %% -- Group 7: Carbon market
  CARBON_CREDIT_BATCHES ||--o{ CREDIT_TRANSACTIONS     : "sold via"
  CARBON_CREDIT_BATCHES ||--o{ NOTIFICATIONS           : "triggers"

  %% -- Group 8: Gamification
  SURVEY_STREAKS        ||--o{ NOTIFICATIONS           : "triggers"
```

---

## Index Hints (สำหรับ Migration)

```sql
-- Hot query paths (Dashboard)
CREATE INDEX idx_tree_snapshots_session     ON tree_snapshots(session_id);
CREATE INDEX idx_tree_snapshots_ai_status   ON tree_snapshots(ai_assessment_status);
CREATE INDEX idx_sessions_farm_status       ON assessment_sessions(farm_id, ai_batch_status);
CREATE INDEX idx_sessions_first_snap        ON assessment_sessions(first_snap_at);
CREATE INDEX idx_streaks_user_farm_year     ON survey_streaks(user_id, farm_id, year);
CREATE INDEX idx_notifications_user_unread  ON notifications(user_id, is_read);
CREATE INDEX idx_sync_jobs_status           ON sync_jobs(sync_status, created_at);

-- Spatial (PostGIS)
CREATE INDEX idx_farms_polygon              ON farms USING GIST(farm_polygon_geojson);

-- Soft delete (always filter)
CREATE INDEX idx_users_deleted    ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_farms_deleted    ON farms(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_subplots_deleted ON subplots(deleted_at) WHERE deleted_at IS NULL;
```

---

## Common Query Patterns

```sql
-- Dashboard: Total carbon for active farm
SELECT SUM(ts.estimated_carbon_kgco2e)
FROM tree_snapshots ts
JOIN assessment_sessions s ON ts.session_id = s.session_id
WHERE s.farm_id = :farm_id
  AND ts.ai_assessment_status = 'Completed';

-- Estimated value (multiply by latest market price)
SELECT cmc.market_price_thb
FROM carbon_market_config cmc
WHERE cmc.effective_from <= NOW()
ORDER BY cmc.effective_from DESC
LIMIT 1;

-- Pending sync alert: sessions past 10h deadline
SELECT * FROM assessment_sessions
WHERE sync_status = 'Pending_Local'
  AND first_snap_at < NOW() - INTERVAL '10 hours';

-- Streak check: did user meet 35% threshold this month?
SELECT
  (COUNT(*) FILTER (WHERE ts.ai_assessment_status = 'Completed'))::float
    / NULLIF(fad.tree_density_per_rai * f.calculated_area_rai, 0) AS snap_rate
FROM assessment_sessions s
JOIN tree_snapshots ts ON ts.session_id = s.session_id
JOIN farms f ON f.farm_id = s.farm_id
JOIN farm_agricultural_data fad ON fad.farm_id = f.farm_id
WHERE s.farm_id = :farm_id
  AND DATE_TRUNC('month', ts.created_at) = DATE_TRUNC('month', NOW());
```
