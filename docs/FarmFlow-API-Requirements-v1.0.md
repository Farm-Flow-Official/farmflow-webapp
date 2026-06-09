# FarmFlow — API Requirements (Admin + Verifier)

| | |
|---|---|
| **Version** | v1.0 |
| **Date** | 2026-06-09 |
| **Status** | Draft — for the API team / Claude Code |
| **Scope** | BETA — endpoints the Admin Dashboard (`dashboard.farmflow`) and Verifier Portal (`verifier.farmflow`) web app needs |
| **Source of truth** | `FarmFlowApp-ERDiagram-v3.md` (Zero-PII). ⚠️ See §2.8 — the UI needs a few ordinary-PII fields that ERD v3 does not have yet. |
| **Machine-readable contract** | **`FarmFlow-API-v1.0.openapi.yaml`** (OpenAPI 3.0.3) — same endpoints/shapes as this doc. Use for Swagger UI, mock server (Prism), and client/type codegen. Keep the two in sync. |

> **How to use this doc:** every endpoint below is already consumed by the web app
> through a single "seam" function (`fetchX()` / a mock action). The frontend is
> **done and mocked**; building these endpoints to the shapes below makes the app
> work with zero frontend rewrites. Each endpoint lists: method · path · auth ·
> params · request body · response · **DB status** (what already exists vs. must be
> built) · notes. Casing/wrapping conventions are in §2 — follow them exactly.

---

## 1. Current backend reality (verified 2026-06-09)

The API (`apps/farmflow-api`, Bun + Elysia + Drizzle + Postgres) today has:

- ✅ **Admin auth** (`/admin/auth/*`) — used by the dashboard already.
- ✅ **Farmer-app modules**: `auth` (user SSO/login), `assessment-sessions`, `files`, `farms`, `species`, `dashboard`, `health`.
- ❌ **No admin-facing data endpoints** (farmers list, announcements, settings, audit-log, admin-users, gis) — **must be built**.
- ❌ **No verifier endpoints at all** (no "verifier" in the codebase) — **must be built**, incl. verifier auth.

DB row counts (seeded dev data): `users` 6, `farms` 6, `assessment_sessions` 56, `tree_snapshots` 19, `files` 19, **`assessment_results` 0, `carbon_credit_batches` 0**, `roles` = **only `MASTER`**, `admins` 1.

→ So the verifier-review layer (batches/results) has **no data yet**, and there is **no `Verifier` role/account**. See §7.

---

## 2. Conventions (apply to every endpoint)

### 2.1 Base path
All endpoints are under **`/api/v1`** (e.g. `GET /api/v1/admin/farmers`). Paths below omit the `/api/v1` prefix for brevity.

### 2.2 Response envelope
Success and error use the existing envelope (seen in current API responses):

```jsonc
// success
{ "success": true,  "data": <payload>, "meta": { "requestId": "uuid", "timestamp": "ISO-8601" } }
// error
{ "success": false, "error": { "code": "STRING_CODE", "message": "human msg", "details": null },
  "meta": { "requestId": "uuid", "timestamp": "ISO-8601" } }
```

The frontend unwraps `.data`. **List endpoints return `data` as an array** (see §2.6).

### 2.3 Auth
- **Admin endpoints** (`/admin/*`): require the admin session cookie (issued by `/admin/auth/sign-in`). The web app forwards cookies server-side. Enforce per-role where noted.
- **Verifier endpoints** (`/verifier/*`): require a verifier session — **to be built** (§3.2).
- **Public**: `/verify/qr-check` only.

### 2.4 Casing — **DB is snake_case, API responses are camelCase**
The DB/ERD uses `snake_case` (`total_carbon_kgco2e`); **the web app consumes `camelCase`** (`totalCarbonKgCo2e`). The API layer must map snake → camel on the way out (and camel → snake for request bodies). Every field table below shows **`apiField` ← `db_column`**.

### 2.5 Dates
All timestamps are **ISO-8601 UTC strings** (e.g. `2026-06-08T07:45:00Z`). The frontend formats to Asia/Bangkok.

### 2.6 Pagination
The web app currently does **client-side** pagination/search/filter — so **list endpoints should return the full (non-deleted) collection** as an array for now. (Recommended later: add `?page=&limit=` or cursor; the frontend can adopt it when ready.) Always filter `WHERE deleted_at IS NULL`.

### 2.7 Errors
Use the envelope. Common: `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 ROUTE_NOT_FOUND` / `NOT_FOUND`, `422 VALIDATION_ERROR`. Write actions that require a reason/field must `422` when missing.

### 2.8 ⚠️ Minimal-PII flag (read before building farmer/owner responses)
Several responses include **`fullName` / `phone` / `email` / `ownerName`** for farmers. **ERD v3 (Zero-PII) does NOT have these columns on `USERS`.** The product needs them (verifier traceability, contacting farmers). Two paths:
- **(a)** add ordinary-PII columns to `USERS` (`full_name`, `phone`, `email`) — the proposed "Minimal-PII" delta (`FarmFlowApp-ERDiagram-v3-MinimalPII.md`), **pending mentor approval**, or
- **(b)** until then, return a non-PII fallback (e.g. `fullName = "เกษตรกร #" + short_id`).

Mark every PII field below with 🟡 **(Minimal-PII)**. The API team must decide (a) vs (b) before these endpoints are "done".

---

## 3. Authentication

### 3.1 Admin auth — ✅ EXISTS (no work, documented for reference)
- `POST /admin/auth/sign-in` — body `{ "username", "password" }` → sets HttpOnly session cookies (no token in body). `401` on bad creds.
- `GET  /admin/auth/me` → `data`: `AdminProfile { id, username, roleId, permissions: string[] }`.
- `POST /admin/auth/refresh` — rotates session from refresh cookie.
- `POST /admin/auth/sign-out` — revokes session.

### 3.2 Verifier auth — ❌ TO BUILD
Per ERD a verifier is an **ADMIN with `role = Verifier`**, but that role isn't seeded and there's no verifier login. Build mirroring admin auth:
- `POST /verifier/auth/sign-in` — body `{ "username", "password" }` → verifier session cookies. Only accounts whose role is `Verifier` may sign in here.
- `GET  /verifier/auth/me` → `data`: `{ id, username, org, role: "Verifier" }` (`org` = external verifier organisation, e.g. "VGREEN" — needs a column or a related table).
- `POST /verifier/auth/sign-out`.
- **Prereq:** seed the `Verifier` role into `ROLES` and create ≥1 verifier account.

---

## 4. Admin API

### 4.1 Farmers

#### `GET /admin/farmers` — list — role: MASTER, VERIFY, FINANCE, GENERAL
DB status: ❌ build. Source: `USERS` (+ count of `FARMS`).

Response `data`: **`Farmer[]`**
```jsonc
{
  "id": "FRM-1001",                 // ← users.user_id
  "fullName": "สมชาย ใจดี",          // 🟡 (Minimal-PII) ← users.full_name
  "phone": "0812345678",            // 🟡 (Minimal-PII) ← users.phone
  "email": "somchai@example.com",   // 🟡 (Minimal-PII, nullable) ← users.email
  "accountStatus": "Active",        // ← users.account_status  ("Active" | "Suspended")
  "farmsCount": 3,                  // ← COUNT(farms WHERE owner_user_id = user_id AND deleted_at IS NULL)
  "registeredAt": "2025-01-12T08:30:00Z" // ← users.created_at
}
```

#### `GET /admin/farmers/:id` — detail — role: MASTER, VERIFY, FINANCE, GENERAL
DB status: ❌ build. Source: `USERS` + its `FARMS` (+ each farm's carbon).
`404 NOT_FOUND` if missing. Response `data`: **`FarmerDetail`** = `Farmer` plus:
```jsonc
{
  "farms": [{
    "id": "FARM-100101",            // ← farms.farm_id
    "name": "สวนรุ่งเรือง",          // ← farms.farm_name
    "province": "เชียงใหม่",         // ← derive from farms.farm_address (no province column)
    "areaRai": 18.4,                // ← farms.calculated_area_rai
    "cropType": "กาแฟ",             // ← FARM_AGRICULTURAL_DATA / SPECIES (enum: ข้าว|อ้อย|มันสำปะหลัง|ยางพารา|กาแฟ|ผัก|ผลไม้)
    "carbonKgCo2e": 14720,          // ← SUM tree carbon for the farm, in kg
    "registeredAt": "2025-01-20T03:15:00Z"
  }],
  "totalCarbonKgCo2e": 41200,       // ← SUM over farms (kg)
  "estimatedValueThb": 8240         // ← round(totalCarbonKgCo2e / 1000 * market_price_thb)  (see §4.3)
}
```

#### `PATCH /admin/farmers/:id/status` — suspend / activate — role: MASTER
DB status: ❌ build (the UI action exists; ERD prototype auto-Actives, so this is the "beyond-spec" toggle — optional for BETA).
Request: `{ "status": "Suspended" }` (`"Active" | "Suspended"`). Response: updated `Farmer`. Writes an `AUDIT_LOGS` row.

---

### 4.2 Announcements
DB status: ❌ build. **No `ANNOUNCEMENTS` table in ERD yet** — needs a table: `(announcement_id, title, body, status, created_at, updated_at)`.

#### `GET /admin/announcements` — list — role: MASTER, GENERAL
Response `data`: **`Announcement[]`** (sort newest-first)
```jsonc
{
  "id": "ANN-2026-006",
  "title": "อัปเดตราคาคาร์บอนเครดิต",
  "body": "ราคารับซื้อ...",           // plain text (rich text is a future upgrade)
  "status": "Active",                // "Active" (published) | "Draft"
  "createdAt": "2026-06-01T03:00:00Z",
  "updatedAt": "2026-06-01T03:00:00Z"
}
```

#### `POST /admin/announcements` — create — role: MASTER, GENERAL
Request: `AnnouncementInput { "title", "body", "status": "Active"|"Draft" }`. `422` if `title` empty. Response: created `Announcement`.

#### `PATCH /admin/announcements/:id` — update — role: MASTER, GENERAL
Request: `AnnouncementInput` (full). Response: updated `Announcement`.

#### `DELETE /admin/announcements/:id` — delete — role: **MASTER only**
Response: `{ "id": "ANN-..." }` or `204`.

---

### 4.3 System Settings (carbon market price)
DB status: ❌ build. Source: ERD **`CARBON_MARKET_CONFIG`**.

> **Unit:** `market_price_thb` is **THB per tCO₂e (per tonne)** per ERD. Estimated value formula everywhere = `round(total_carbon_kgco2e / 1000 * market_price_thb)`. Current mock value = **200**.

#### `GET /admin/system/settings` — role: MASTER only
Response `data`: **`SystemConfig`**
```jsonc
{
  "configId": "CFG-PRICE",            // ← config_id
  "marketPriceThb": 200,              // ← market_price_thb (per tCO₂e)
  "priceSource": "manual",            // ← price_source ("manual" | "api_t-ver" | "api_verra")
  "effectiveFrom": "2026-06-09T01:20:00Z", // ← effective_from
  "updatedByAdminId": "ADM-0001",     // ← updated_by_admin_id
  "updatedByLabel": "master.admin",   // ← JOIN ADMINS.username (nullable)
  "updatedAt": "2026-06-09T01:20:00Z" // ← created_at of the latest config row
}
```

#### `PATCH /admin/system/settings` — role: MASTER only
Request: `{ "marketPriceThb": 220 }` (number > 0; UI guards 1–10000). Inserts a new `CARBON_MARKET_CONFIG` row (append-only history) with `effective_from = now`, `updated_by_admin_id = caller`. Response: updated `SystemConfig`. Writes `AUDIT_LOGS` (`UPDATE`, `CARBON_MARKET_CONFIG`, old/new `market_price_thb`).

---

### 4.4 Audit Log
DB status: ❌ build (read endpoint). Source: ERD **`AUDIT_LOGS`** (append-only).

#### `GET /admin/audit-logs` — role: MASTER only
Response `data`: **`AuditLog[]`** (sort newest-first)
```jsonc
{
  "id": "LOG-...",                    // ← log_id
  "actorId": "ADM-0001",              // ← actor_id
  "actorLabel": "master.admin",       // ← JOIN ADMINS.username when actor_type=ADMIN (nullable)
  "actorType": "ADMIN",               // ← actor_type ("USER" | "ADMIN" | "SYSTEM")
  "action": "UPDATE",                 // ← action ("CREATE" | "UPDATE" | "DELETE" | "APPROVE")
  "tableName": "CARBON_MARKET_CONFIG",// ← table_name
  "recordId": "CFG-PRICE",            // ← record_id
  "oldData": { "market_price_thb": 250 }, // ← old_data (json, nullable — null for CREATE)
  "newData": { "market_price_thb": 200 }, // ← new_data (json, nullable — null for DELETE)
  "createdAt": "2026-06-09T01:20:00Z" // ← created_at
}
```
Note: `oldData`/`newData` are passed through as-is (the UI renders a before/after diff). No IP / no role column needed (the UI dropped both).

---

### 4.5 Admin Users
DB status: ❌ build. Source: ERD **`ADMINS`** JOIN **`ROLES`**.

#### `GET /admin/admins` — list — role: MASTER only
Exclude the caller's own account (`WHERE admin_id != caller`). Response `data`: **`AdminUser[]`**
```jsonc
{
  "id": "ADM-0002",                   // ← admin_id
  "username": "verify.somchai",       // ← username
  "role": "Verifier",                 // ← JOIN roles.role_name ("SuperAdmin" | "Auditor" | "Verifier")
  "status": "Active",                 // ← admin_status ("Active" | "Inactive")
  "lastLoginAt": "2026-06-08T07:45:00Z", // ← last_login (nullable)
  "createdAt": "2025-02-12T04:30:00Z" // ← created_at
}
```

#### `POST /admin/admins` — invite — role: MASTER only
Request: `AdminInvite { "username", "role": "SuperAdmin"|"Auditor"|"Verifier" }`. `422` if username taken / < 3 chars. Creates an `ADMINS` row (status `Active`, `last_login` null). Response: created `AdminUser`. (Real invite likely also sets a temp password / sends a link — out of scope for the shape.)

#### `PATCH /admin/admins/:id/role` — role: MASTER only
Request: `{ "role": "Auditor" }`. Response: updated `AdminUser`.

#### `PATCH /admin/admins/:id/status` — suspend / activate — role: MASTER only
Request: `{ "status": "Inactive" }` (`"Active" | "Inactive"`). Constraint: cannot target self. Response: updated `AdminUser`.

#### `DELETE /admin/admins/:id` — role: MASTER only
Constraint: cannot delete self. Soft-delete (`deleted_at`). Response: `{ "id": "ADM-..." }` or `204`.

---

### 4.6 GIS Farms (map)
DB status: ⚠️ partial — `FARMS` exists (polygons), but **overlap %** is not stored (only the flag) and **GEE/NDVI** comes from `gee_verification_result`.

#### `GET /admin/gis/farms` — role: VERIFY, MASTER
Response `data`: **`FarmGeo[]`**
```jsonc
{
  "id": "FARM-GIS-09",                // ← farm_id
  "farmName": "แปลงสีเขียว",          // ← farm_name
  "ownerUserId": "FRM-1004",          // ← owner_user_id
  "ownerName": "วันเพ็ญ สวนเขียว",     // 🟡 (Minimal-PII) ← JOIN users.full_name
  "province": "เชียงใหม่",            // ← derive from farm_address
  "checkinLat": 18.7956,              // ← checkin_lat
  "checkinLng": 98.9752,              // ← checkin_lng
  "calculatedAreaRai": 18.4,          // ← calculated_area_rai
  "declaredAreaRai": 18.0,            // ← declared_area_rai
  "areaDiscrepancyFlag": false,       // ← area_discrepancy_flag
  "overlapFlag": true,                // ← overlap_validation_flag
  "overlapPercent": 22,               // ← server-computed % (ERD stores only the boolean; compute at query time or add a column; nullable)
  "farmStatus": "Active",             // ← farm_status ("Draft"|"Pending"|"Active"|"Rejected"|"Suspended")
  "gee": { "status": "verified", "ndvi": 0.58 }, // ← derive from gee_verification_result (status: "verified" ndvi≥0.4 | "review" ≥0.2 | "failed" <0.2)
  "polygon": [[98.9736,18.7943],[98.9768,18.7943],[98.9768,18.7969],[98.9739,18.7969],[98.9736,18.7943]]
  // ← farm_polygon_geojson outer ring as [lng, lat] pairs (GeoJSON order)
}
```

---

## 5. Verifier API  (all ❌ TO BUILD — no verifier layer exists; needs auth §3.2)

> **Data gap:** `carbon_credit_batches` and `assessment_results` are **empty**. A "batch" = a unit of carbon work awaiting verification (built from `ASSESSMENT_SESSIONS` / `TREE_SNAPSHOTS`). The backend must define how a batch is formed and how approve/reject writes `ASSESSMENT_RESULTS` / `CARBON_CREDIT_BATCHES`.

### 5.1 `GET /verifier/overview` — role: VERIFIER
Response `data`: **`VerifierOverviewData`**
```jsonc
{
  "summary": {
    "pendingReview": 7,        // count batches status=Pending
    "anomalyAlerts": 3,        // = alerts.length
    "approvedThisMonth": 18,
    "rejectedThisMonth": 4
  },
  "alerts": [{                 // AnomalyAlert[] — batches AI flagged
    "id": "AL-01",
    "batchId": "BATCH-2026-0042",
    "farmName": "ไร่หัวใจ",       // 🟡 (Minimal-PII)
    "ownerName": "วิชัย ไร่กาแฟ", // 🟡 (Minimal-PII)
    "treeCount": 38,
    "aiConfidenceScore": 0.43,  // 0..1 avg
    "kind": "low_confidence",   // "low_confidence" | "metadata_mismatch"
    "detail": "คะแนนความเชื่อมั่น AI เฉลี่ยต่ำมาก (< 0.50)",
    "submittedAt": "2026-06-08T07:45:00Z"
  }]
}
```

### 5.2 `GET /verifier/batches` — queue — role: VERIFIER
Response `data`: **`VerificationBatch[]`** (frontend smart-sorts client-side; any order OK)
```jsonc
{
  "id": "BATCH-2026-0042",      // ← batch / session id
  "farmId": "FARM-GIS-10",
  "farmName": "ไร่หัวใจ",         // 🟡 (Minimal-PII)
  "ownerName": "วิชัย ไร่กาแฟ",   // 🟡 (Minimal-PII)
  "submittedAt": "2026-06-08T07:45:00Z",
  "treeCount": 38,             // ← COUNT tree_snapshots
  "avgConfidence": 0.43,       // ← AVG tree_snapshots.ai_confidence_score (0..1)
  "anomalyFlag": true,         // server rule: avg low OR any metadata mismatch
  "status": "Pending",         // "Pending" | "Approved" | "Rejected" (verifier review status)
  "totalCarbonKgCo2e": 15600   // ← SUM tree carbon (kg)
}
```

### 5.3 `GET /verifier/batches/:id` — detail — role: VERIFIER
`404` if missing. Response `data`: **`BatchDetail`** = `VerificationBatch` plus:
```jsonc
{
  "phone": "081-234-5678",        // 🟡 (Minimal-PII) ← users.phone
  "farmAddress": "อ.เมือง จ.เชียงใหม่", // ← farms.farm_address
  "checkinLat": 18.7949,          // ← checkin_lat
  "checkinLng": 98.9762,          // ← checkin_lng
  "polygon": [[lng,lat], ...],    // ← farm_polygon_geojson outer ring [lng,lat]
  "trees": [{                     // TreeSnapshot[] (ERD: TREE_SNAPSHOTS)
    "id": "BATCH-2026-0042-T001", // ← snapshot_id
    "captureLat": 18.7951,        // ← capture_lat
    "captureLng": 98.9760,        // ← capture_lng
    "capturedAt": "2026-06-08T07:00:00Z", // ← created_at / capture time
    "weather": "sunny",           // ← weather_condition ("sunny" | "cloudy" | "rainy")
    "aiConfidenceScore": 0.41,    // ← ai_confidence_score (0..1)
    "anomaly": true               // server rule (e.g. confidence < 0.6)
  }]
}
```
**Photos:** the UI uses placeholders. To show real photos, expose the snapshot image — either widen `GET /files/:id/content` to allow verifier/admin access (currently **private to the farmer uploader**), or add a tree-snapshot image URL field. (See §7.)

### 5.4 Approve / Reject — role: VERIFIER
- `POST /verifier/batches/:id/approve` — sets batch `Approved`; creates `ASSESSMENT_RESULTS` / issues `CARBON_CREDIT_BATCHES`; records verifier signature + timestamp; makes a `session_id` "issued" (for §5.6). Response: updated `VerificationBatch`. Writes `AUDIT_LOGS` (`APPROVE`).
- `POST /verifier/batches/:id/reject` — body `{ "reason": "..." }` (**required → `422` if empty**, mirrors ERD "rejection blocked unless reason filled"). Sets `Rejected`; stores reason; notifies farmer. Response: updated `VerificationBatch`.

### 5.5 `GET /verifier/batches/:id/report` — PDF (optional / future)
The web app currently renders the report **client-side** (print-to-PDF) from `GET /verifier/batches/:id`, so **no endpoint is required for BETA**. If a server-rendered PDF is wanted later, this returns `application/pdf`. The report embeds a QR → §5.6 with the batch's `session_id`.

### 5.6 `GET /verify/qr-check` — **PUBLIC** (no auth)
Query: `?session_id=SES-2026-0034`. Checks the id exists among **issued** documents. **No PII** — return only validity + issue date.
Response `data`: **`SessionVerification`**
```jsonc
{ "sessionId": "SES-2026-0034", "valid": true, "issuedAt": "2026-06-03T08:00:00Z" }
// invalid → { "sessionId": "...", "valid": false, "issuedAt": null }
```
Source: `ASSESSMENT_SESSIONS` / issued-document registry. Constraint: never expose farmer/farm data here.

---

## 6. Write-action endpoints — quick index
(All write `AUDIT_LOGS` where relevant.)

| Action (frontend) | Endpoint |
|---|---|
| Suspend/activate farmer | `PATCH /admin/farmers/:id/status` |
| Create / update / delete announcement | `POST` / `PATCH /:id` / `DELETE /:id` `/admin/announcements` |
| Update market price | `PATCH /admin/system/settings` |
| Invite admin | `POST /admin/admins` |
| Edit admin role | `PATCH /admin/admins/:id/role` |
| Suspend/activate admin | `PATCH /admin/admins/:id/status` |
| Delete admin | `DELETE /admin/admins/:id` |
| Approve / reject batch | `POST /verifier/batches/:id/approve` · `/reject` |

---

## 7. Backend gaps & prerequisites (the "must-decide / must-build" list)

1. **Minimal-PII decision (§2.8)** — `USERS.full_name / phone / email`. Blocks: farmers, farmer detail, gis owner, all verifier farm/owner names. **Highest-leverage decision.**
2. **Verifier auth + role** — seed `ROLES.Verifier`, create verifier accounts (with `org`), build `/verifier/auth/*`. Blocks the entire verifier portal.
3. **Verifier-review data model** — `carbon_credit_batches` / `assessment_results` are empty. Define batch formation + approve/reject writes.
4. **`ANNOUNCEMENTS` table** — not in ERD; add it.
5. **Snapshot photo access** — `/files/:id/content` is private to the farmer uploader; verifiers can't read. Add admin/verifier access or a snapshot image URL.
6. **Derived/enriched fields** — `province` (from `farm_address`), `overlapPercent` (compute or store), `gee.status` (from `gee_verification_result`), `estimatedValueThb` (kg/1000 × price), `actorLabel`/`updatedByLabel`/`ownerName` (JOINs).
7. **snake_case → camelCase mapper** — one shared response serializer (and the reverse for request bodies).

---

## 8. Suggested build order (unblock the most frontend per step)

1. **Decide Minimal-PII (a/b).** Without it, half the screens show placeholder names.
2. **Admin read endpoints** (no new tables, mostly straight reads): `farmers`, `farmers/:id`, `gis/farms`, `audit-logs`, `admins`, `system/settings`. → Admin dashboard goes live.
3. **Admin write endpoints**: announcements CRUD (+ table), settings PATCH, admin-users actions, farmer status.
4. **Verifier auth + role seed.** → Verifier portal can log in.
5. **Verifier read**: `overview`, `batches`, `batches/:id` (define batch model). → Verifier review works (placeholder photos).
6. **Verifier write**: approve/reject (+ results/batches writes), public `qr-check`.
7. **Later**: snapshot photo access, server-rendered PDF, real pagination, weather×timestamp cross-check data.

---

*Generated from the web app's data seams (`features/*/services/*` + mock write-actions). Every shape above is exactly what the frontend already consumes — match it and the app works unchanged.*
