# FarmFlow — Dashboard & Verifier Portal
## Page Map · User Flows · User Journeys
> Spec version 1 · Business Dashboard (Part 2) · For Claude Code

---

## 0. Quick Reference

| Subdomain | Target User | Auth |
|-----------|-------------|------|
| `dashboard.farmflow.[domain]` | Internal Admins (4 roles) | Internal SSO / Username+Password |
| `verifier.farmflow.[domain]` | External Verifiers (e.g., VGREEN) | Separate credential |
| `portal.farmflow.[domain]` | Routing/Landing | Redirect to correct subdomain |

### Role Lookup

| Role | Code | Can Access |
|------|------|------------|
| Master Admin | `MASTER` | Everything except verifier approval |
| Verify Admin | `VERIFY` | KYC queue, GIS map, overlap disputes |
| Financial Admin | `FINANCE` | Payout/withdrawal queue |
| General Admin | `GENERAL` | Support tickets, announcements |
| External Verifier | `VERIFIER` | Verifier portal only |

---

## 1. Subdomain: `portal.farmflow.[domain]`

### P-01 · Landing / Role Router
**Purpose:** Entry point — routes users to the right subdomain based on identity.

**Elements:**
- FarmFlow logo + tagline
- Two CTA buttons: "Admin Login" → `dashboard.farmflow.[domain]/login` | "Verifier Login" → `verifier.farmflow.[domain]/login`

**Logic:** No session needed. Purely static routing page.

---

## 2. Subdomain: `dashboard.farmflow.[domain]` — Admin

### Page List

| ID | Route | Page Name | Roles |
|----|-------|-----------|-------|
| A-01 | `/login` | Admin Login | All |
| A-02 | `/` | Dashboard Home (Overview) | ALL roles |
| A-03 | `/farmers` | Farmer Management | MASTER, VERIFY, FINANCE, GENERAL |
| A-04 | `/farmers/:id` | Farmer Detail | MASTER, VERIFY, FINANCE, GENERAL |
| A-05 | `/kyc` | KYC Verification Queue | VERIFY *(skipped in prototype)* |
| A-06 | `/gis` | Global Farm Map & GIS Validation | VERIFY, MASTER |
| A-07 | `/payouts` | Payout / Withdrawal Queue | FINANCE, MASTER |
| A-08 | `/payouts/:requestId` | Payout Detail | FINANCE, MASTER |
| A-09 | `/announcements` | Announcement Manager | MASTER, GENERAL |
| A-10 | `/settings` | System Settings (market price) | MASTER only |
| A-11 | `/audit-log` | Admin Audit Log | MASTER only |
| A-12 | `/admin-users` | Admin User Management | MASTER only |
| A-13 | `/support` | Support Tickets (LINE OA link) | GENERAL, MASTER |

---

### A-01 · Admin Login

**Route:** `/login`
**Access:** Public (unauthenticated)

**Elements:**
- Email + Password fields
- "Login" button → calls `POST /auth/admin/login`
- Error state: invalid credentials banner

**On Success:** Redirect to `/` (Dashboard Home)

---

### A-02 · Dashboard Home

**Route:** `/`
**Access:** All admin roles (content varies by role)

**Elements — KPI Cards (role-filtered):**
- Total active farmers
- Pending KYC count *(VERIFY, MASTER)*
- Pending payout requests count *(FINANCE, MASTER)*
- Total carbon credits issued (kgCO₂e) *(MASTER)*
- Farms with `overlap_validation_flag = true` *(VERIFY, MASTER)*
- Current `market_price_thb` *(MASTER)*

**Elements — Quick Links:**
- Role-specific shortcuts to primary workflow pages

---

### A-03 · Farmer Management

**Route:** `/farmers`
**Access:** MASTER, VERIFY, FINANCE, GENERAL

**Elements:**
- Data grid / table of all farmer accounts
- Columns: `farmer_id`, Full name, Phone, `account_status`, Registration date, KYC status
- Search bar (by name, phone, ID)
- Filter: `account_status` (Pending_KYC / Active)
- Row click → navigate to `/farmers/:id`

---

### A-04 · Farmer Detail

**Route:** `/farmers/:id`
**Access:** MASTER, VERIFY, FINANCE, GENERAL (field visibility varies by role)

**Sections:**

| Section | Visible to |
|---------|-----------|
| Basic Info (name, phone, email) | All |
| KYC Documents (id_card_front_url, face_photo_url, ownership_proof_url) | VERIFY, MASTER |
| Bank Account (USER_BANK_ACCOUNTS) | FINANCE, MASTER |
| Farm List + polygon summary | VERIFY, MASTER |
| Carbon History (total_carbon_kgco2e, timestamps) | MASTER, FINANCE |
| Payout History | FINANCE, MASTER |

---

### A-05 · KYC Verification Queue *(Prototype: SKIPPED)*

**Route:** `/kyc`
**Access:** VERIFY, MASTER
**Prototype note:** Auto-bypassed — `account_status` is set to `Active` on registration. Build screen but mark as "Coming Soon" or skip entirely in prototype.

**Elements (for future build):**
- Data grid: farmers with `account_status = Pending_KYC`
- Per row: view ID card photo vs. selfie side-by-side, view `ownership_proof_url`
- Actions: **Approve** → sets `Active` + push notification | **Reject** → required `kyc_rejection_reason` textarea + push notification

---

### A-06 · Global Farm Map & GIS Validation

**Route:** `/gis`
**Access:** VERIFY, MASTER

**Elements:**
- Full-screen interactive map (Mapbox GL / Leaflet + PostGIS layer)
- All `farm_polygon_geojson` rendered as polygons
- Color coding:
  - 🟢 Green — verified, no overlap
  - 🔴 Red — `overlap_validation_flag = true` (overlap > 15%)
  - 🟡 Yellow — pending review
- Sidebar panel on polygon click: farmer name, farm ID, area (rai), overlap %, link to `/farmers/:id`
- Filter toggle: "Show flagged only"
- Alert badge: count of farms with `overlap_validation_flag = true`

**Overlap Logic (display only — computed server-side):**
- Server auto-calculates polygon overlap on farm submission
- If overlap > 15% threshold → sets `overlap_validation_flag = true`
- Map reads and displays this flag; VERIFY Admin reviews land title docs and resolves manually

---

### A-07 · Payout / Withdrawal Queue

**Route:** `/payouts`
**Access:** FINANCE, MASTER

**Elements:**
- Data grid: all pending withdrawal requests
- Columns: Farmer name, `total_carbon_kgco2e`, Estimated value (THB = `total_carbon_kgco2e × market_price_thb`), Bank name, Account number (masked), Request date, Status
- Filter: Status (Pending / Approved / Rejected / Paid)
- Row click → `/payouts/:requestId`

---

### A-08 · Payout Detail

**Route:** `/payouts/:requestId`
**Access:** FINANCE, MASTER

**Elements:**
- Farmer basic info
- Bank account detail (from `USER_BANK_ACCOUNTS`): account name, account number, bank name
- Carbon summary: `total_carbon_kgco2e`, calculated THB value
- Action panel:

| Action | Steps | Outcome |
|--------|-------|---------|
| **Approve & Mark Paid** | Admin transfers via external banking app → uploads slip image (file upload) → clicks "Confirm Payment" | Status → `Paid`; push notification to farmer |
| **Reject** | Required rejection reason text (e.g., "Account number incorrect") → submit | Status → `Rejected`; push notification with reason |

- Slip image upload: `POST /payouts/:requestId/slip` (multipart form)
- Status history timeline at bottom

---

### A-09 · Announcement Manager

**Route:** `/announcements`
**Access:** MASTER, GENERAL

**Elements:**
- List of existing announcements / news banners (title, status: Active/Draft, created date)
- "New Announcement" button
- Create / Edit form: Title, Body (rich text), Publish toggle
- Delete action (MASTER only)

---

### A-10 · System Settings

**Route:** `/settings`
**Access:** MASTER only

**Elements:**
- `market_price_thb` field — numeric input, current value displayed
- "Save" button → `PATCH /system/settings`
- Confirmation dialog before save: "Are you sure you want to update the carbon price to ฿{value}?"
- Change reflected in all payout estimated value calculations immediately

---

### A-11 · Admin Audit Log

**Route:** `/audit-log`
**Access:** MASTER only

**Elements:**
- Read-only data grid
- Columns: Timestamp, Admin name, Role, Action, Target (entity type + ID), IP address
- Filter: by date range, by admin, by action type
- No delete / edit capability (append-only)

---

### A-12 · Admin User Management

**Route:** `/admin-users`
**Access:** MASTER only

**Elements:**
- List of all admin accounts (excluding self)
- Columns: Name, Email, Role, Status (Active/Suspended), Created date
- Actions: **Edit Role**, **Suspend**, **Delete**
- "Invite Admin" button → modal with email + role selector

**Constraint:** Master Admin cannot suspend or delete their own account.

---

### A-13 · Support Tickets

**Route:** `/support`
**Access:** GENERAL, MASTER

**Prototype note:** Primary channel is LINE OA — this page is a lightweight hub.

**Elements:**
- Embedded LINE OA link / QR code
- Log table for manually tracked escalations (optional in prototype)
- "Escalate to team" dropdown (route to VERIFY / FINANCE admin)

---

## 3. Subdomain: `verifier.farmflow.[domain]` — External Verifier

### Page List

| ID | Route | Page Name |
|----|-------|-----------|
| V-01 | `/login` | Verifier Login |
| V-02 | `/` | Verifier Dashboard (batch overview) |
| V-03 | `/batches` | Farm Batch Queue |
| V-04 | `/batches/:batchId` | Batch Detail & Review |
| V-05 | `/batches/:batchId/tree/:treeId` | Tree Snapshot Deep Inspect |
| V-06 | `/verify/qr-check` | Public Document Verification (QR scan endpoint) |

---

### V-01 · Verifier Login

**Route:** `/login`
**Access:** Public

Same pattern as A-01 but hits `POST /auth/verifier/login`.

---

### V-02 · Verifier Dashboard

**Route:** `/`
**Access:** VERIFIER role

**Elements — Summary Cards:**
- Total batches pending review
- Batches with anomaly alerts (low `ai_confidence_score`)
- Batches approved (this month)
- Batches rejected (this month)

**Smart Alert Panel:**
- List of farms/trees flagged by anomaly detection (abnormal `ai_confidence_score`)
- Quick-link to relevant batch

---

### V-03 · Farm Batch Queue

**Route:** `/batches`
**Access:** VERIFIER

**Elements:**
- Data grid: all submitted farm batches awaiting verification
- Columns: Farm ID, Farmer name, Submission date, Tree count, Avg `ai_confidence_score`, Anomaly flag, Status
- Smart sort: batches with low confidence score or anomaly flag surfaced to top automatically
- Filter: Status (Pending / Approved / Rejected), Anomaly flag toggle
- Row click → `/batches/:batchId`

---

### V-04 · Batch Detail & Review

**Route:** `/batches/:batchId`
**Access:** VERIFIER

**Sections:**

**Farm Overview:**
- Farmer name, phone (read-only, no edit)
- Farm location: address, coordinates, satellite thumbnail
- Farm polygon on mini-map

**MRV Data Summary:**
- `total_carbon_kgco2e`
- `ai_confidence_score` (average + per-tree breakdown)
- Tree count in batch

**Tree Snapshot Grid:**
- Thumbnail grid of all tree photos in batch
- Each tile: thumbnail, GPS coords (`capture_lat`, `capture_lng`), `ai_confidence_score` badge, weather condition
- Anomaly highlighted in red (low confidence or metadata inconsistency)
- Click tile → `/batches/:batchId/tree/:treeId`

**Actions:**
| Action | Constraint | Outcome |
|--------|-----------|---------|
| **Approve Batch** | No constraint | Batch status → `Approved`; PDF report generated with verifier signature |
| **Batch Approve All** (bulk) | All items in queue meeting criteria | Bulk status update + bulk PDF generation |
| **Reject Batch** | `ai_rejection_reason` field **required** (blocked if empty) | Batch status → `Rejected`; reason sent to farmer; farmer can re-survey flagged area only |

**Export:**
- "Download PDF Report" button → generates PDF per farm (see PDF spec below)

---

### V-05 · Tree Snapshot Deep Inspect

**Route:** `/batches/:batchId/tree/:treeId`
**Access:** VERIFIER

**Elements:**
- Full-size tree photo
- Metadata panel: `capture_lat`, `capture_lng`, timestamp, `weather_condition`, `ai_confidence_score`
- Cross-check warning: highlight inconsistencies (e.g., GPS coordinates vs. timestamp vs. weather mismatch)
- Mini-map: pinpoint of capture location
- Navigation: Previous tree / Next tree

---

### V-06 · Public QR Document Verification

**Route:** `/verify/qr-check?session_id=:id`
**Access:** Public (no login required)

**Purpose:** External users scan QR from PDF → verify document authenticity.

**Logic:**
- Query `session_id` against database
- **Valid:** display "✅ Document verified — Session ID {id} exists in the FarmFlow system. Issued: {date}"
- **Invalid:** display "❌ Document not found or may have been revoked"

**Constraint:** No PII exposed. Only session validity + issue date.

---

## 4. PDF Export Specification

Generated per batch approval. Triggered from V-04.

| Field | Source |
|-------|--------|
| Farmer full name | `users.full_name` |
| Phone number | `users.phone` |
| Farm address | `farms.address` |
| Satellite imagery | Static map tile (farm centroid) |
| Coordinates | `farms.lat`, `farms.lng` |
| Carbon sequestration history | `carbon_records` with timestamps |
| `ai_confidence_score` | `TREE_SNAPSHOTS.ai_confidence_score` |
| `total_carbon_kgco2e` | `farms.total_carbon_kgco2e` |
| Verifier signature | Verifier full name (E-Document) + approval timestamp |
| QR Code | Encodes URL: `verifier.farmflow.[domain]/verify/qr-check?session_id={session_id}` |

---

## 5. User Journeys

### Journey 1: Verify Admin — Resolve Farm Overlap Dispute

```
Login (A-01)
  └─► Dashboard Home (A-02) — sees alert: "3 farms flagged for overlap"
        └─► GIS Map (A-06) — red polygons highlighted
              └─► Click flagged polygon — sidebar shows farm A & farm B overlap %
                    └─► Open Farm Detail (A-04) for Farm A — review ownership_proof_url
                          └─► Open Farm Detail (A-04) for Farm B — compare documents
                                └─► Decision: clear one flag manually / escalate
```

---

### Journey 2: Financial Admin — Process Payout

```
Login (A-01)
  └─► Dashboard Home (A-02) — sees "5 pending payout requests"
        └─► Payout Queue (A-07) — sorted by request date
              └─► Click request → Payout Detail (A-08)
                    ├─► Review: farmer name, bank account, carbon amount, THB value
                    ├─► [APPROVE PATH]
                    │     └─► Transfer via external banking app
                    │           └─► Upload slip image in A-08
                    │                 └─► Confirm → status = Paid → farmer notified
                    └─► [REJECT PATH]
                          └─► Enter rejection reason → Submit → farmer notified
```

---

### Journey 3: External Verifier — Review & Approve Batch

```
Login (V-01)
  └─► Verifier Dashboard (V-02) — sees anomaly alert count
        └─► Batch Queue (V-03) — sorted: anomaly batches at top
              └─► Click batch → Batch Detail (V-04)
                    ├─► Scan tree snapshot grid — look for red-flagged tiles
                    │     └─► Click anomaly tile → Deep Inspect (V-05)
                    │           └─► Verify GPS / timestamp / weather cross-check
                    │                 └─► Back to V-04
                    ├─► [APPROVE PATH]
                    │     └─► Click "Approve Batch" → PDF generated with signature
                    │           └─► Download PDF (contains QR code)
                    └─► [REJECT PATH]
                          └─► Must fill ai_rejection_reason (blocked if empty)
                                └─► Submit → farmer notified with specific reason
                                      └─► Farmer re-surveys flagged area only (no full restart)
```

---

### Journey 4: Master Admin — Update Carbon Market Price

```
Login (A-01)
  └─► Dashboard Home (A-02)
        └─► Settings (A-10)
              └─► Edit market_price_thb field
                    └─► Click Save → confirmation dialog
                          └─► Confirm → price updated → all payout estimates recalculate
                                └─► Action logged in Audit Log (A-11)
```

---

### Journey 5: Public User — Verify PDF Authenticity via QR

```
Receive physical/digital PDF from farmer or verifier
  └─► Scan QR Code embedded in PDF
        └─► Browser opens: verifier.farmflow.[domain]/verify/qr-check?session_id=XXX
              ├─► Valid → "✅ Document verified — issued {date}"
              └─► Invalid → "❌ Document not found"
        (No login required · No PII displayed)
```

---

## 6. Access Control Matrix

| Page | MASTER | VERIFY | FINANCE | GENERAL | VERIFIER |
|------|--------|--------|---------|---------|----------|
| A-01 Login | ✅ | ✅ | ✅ | ✅ | — |
| A-02 Dashboard Home | ✅ | ✅ | ✅ | ✅ | — |
| A-03 Farmer List | ✅ | ✅ | ✅ | ✅ | — |
| A-04 Farmer Detail | ✅ | ✅ (KYC fields) | ✅ (bank fields) | ✅ (basic only) | — |
| A-05 KYC Queue | ✅ | ✅ | — | — | — |
| A-06 GIS Map | ✅ | ✅ | — | — | — |
| A-07 Payout Queue | ✅ | — | ✅ | — | — |
| A-08 Payout Detail | ✅ | — | ✅ | — | — |
| A-09 Announcements | ✅ | — | — | ✅ | — |
| A-10 Settings | ✅ | — | — | — | — |
| A-11 Audit Log | ✅ | — | — | — | — |
| A-12 Admin Users | ✅ | — | — | — | — |
| A-13 Support | ✅ | — | — | ✅ | — |
| V-01 Verifier Login | — | — | — | — | ✅ |
| V-02 Verifier Dashboard | — | — | — | — | ✅ |
| V-03 Batch Queue | — | — | — | — | ✅ |
| V-04 Batch Detail | — | — | — | — | ✅ |
| V-05 Tree Inspect | — | — | — | — | ✅ |
| V-06 QR Verify | Public | Public | Public | Public | Public |

---

## 7. Prototype Scope Flags

| Feature | Prototype Behavior | Impact on Pages |
|---------|-------------------|----------------|
| KYC / E-KYC | **Bypassed** — auto `Active` on register | A-05 can be skipped / marked "Coming Soon" |
| `SPECIES_EQUATIONS` | **Hardcoded in DB** | No settings UI needed |
| Payout processing | **Manual** bank transfer + slip upload | A-08: file upload only, no bank API |
| Complaint ticketing | **LINE OA** only | A-13: show LINE QR / link, no ticket system |
| KYC workflow screen | **Skipped** in UI | A-05 not required for prototype |
| Public QR verification | `session_id` existence check only — no PII | V-06: minimal response, no data exposure |

---

## 8. Key API Endpoints Summary

> For Claude Code: implement these endpoints to support all pages above.

| Method | Endpoint | Used by |
|--------|----------|---------|
| `POST` | `/auth/admin/login` | A-01 |
| `POST` | `/auth/verifier/login` | V-01 |
| `GET` | `/dashboard/summary` | A-02 |
| `GET` | `/farmers` | A-03 |
| `GET` | `/farmers/:id` | A-04 |
| `GET` | `/farms/geojson` | A-06 |
| `GET` | `/payouts` | A-07 |
| `GET` | `/payouts/:id` | A-08 |
| `PATCH` | `/payouts/:id/status` | A-08 |
| `POST` | `/payouts/:id/slip` | A-08 (file upload) |
| `GET/POST/PATCH` | `/announcements` | A-09 |
| `GET/PATCH` | `/system/settings` | A-10 |
| `GET` | `/audit-log` | A-11 |
| `GET/POST/PATCH/DELETE` | `/admin-users` | A-12 |
| `GET` | `/verifier/dashboard/summary` | V-02 |
| `GET` | `/verifier/batches` | V-03 |
| `GET` | `/verifier/batches/:id` | V-04 |
| `POST` | `/verifier/batches/:id/approve` | V-04 |
| `POST` | `/verifier/batches/:id/reject` | V-04 (requires `ai_rejection_reason`) |
| `GET` | `/verifier/batches/:id/pdf` | V-04 (PDF download) |
| `GET` | `/verifier/batches/:batchId/tree/:treeId` | V-05 |
| `GET` | `/verify/session/:session_id` | V-06 (public) |
