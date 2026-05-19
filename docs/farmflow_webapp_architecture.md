# FarmFlow Webapp — Architecture Guide
> **Version:** 1.0 | **Platform:** Next.js 16 App Router + Feature-Based Architecture
> **Scope:** Admin Dashboard (`dashboard.farmflow.[domain]`) + Verifier Portal (`verifier.farmflow.[domain]`)

---

## Part 1 — Folder Structure

```
src/
│
├── middleware.ts                        # Subdomain → internal path rewrite
│                                        # dashboard.farmflow.* → /admin/*
│                                        # verifier.farmflow.* → /verifier/*
│
├── app/
│   ├── layout.tsx                       # Root layout (font, CSS variables, Toast provider)
│   ├── globals.css                      # Design tokens, IBM Plex Sans/Mono, Tailwind base
│   │
│   ├── admin/                           # ─── ADMIN DASHBOARD subdomain ───
│   │   ├── login/
│   │   │   └── page.tsx                 # A-01 · /login (unauthenticated)
│   │   │
│   │   └── (protected)/                 # Route group — AdminShell layout (auth guard)
│   │       ├── layout.tsx               # Topbar 64px + Sidebar 240px (green #004C22) + RBAC guard
│   │       ├── page.tsx                 # A-02 · / → Dashboard Home (KPI cards)
│   │       │
│   │       ├── farmers/
│   │       │   ├── page.tsx             # A-03 · /farmers → Farmer List
│   │       │   └── [id]/
│   │       │       └── page.tsx         # A-04 · /farmers/:id → Farmer Detail (role-filtered)
│   │       │
│   │       ├── kyc/
│   │       │   └── page.tsx             # A-05 · /kyc → KYC Queue (prototype: placeholder)
│   │       │
│   │       ├── gis/
│   │       │   └── page.tsx             # A-06 · /gis → Global Farm Map (full-bleed)
│   │       │
│   │       ├── payouts/
│   │       │   ├── page.tsx             # A-07 · /payouts → Payout Queue
│   │       │   └── [requestId]/
│   │       │       └── page.tsx         # A-08 · /payouts/:id → Payout Detail + Slip Upload
│   │       │
│   │       ├── announcements/
│   │       │   └── page.tsx             # A-09 · /announcements → Announcement Manager
│   │       │
│   │       ├── settings/
│   │       │   └── page.tsx             # A-10 · /settings → System Settings (MASTER only)
│   │       │
│   │       ├── audit-log/
│   │       │   └── page.tsx             # A-11 · /audit-log → Admin Audit Log (MASTER only)
│   │       │
│   │       ├── admin-users/
│   │       │   └── page.tsx             # A-12 · /admin-users → Admin User Management
│   │       │
│   │       └── support/
│   │           └── page.tsx             # A-13 · /support → Support (LINE OA hub)
│   │
│   ├── verifier/                        # ─── VERIFIER PORTAL subdomain ───
│   │   ├── login/
│   │   │   └── page.tsx                 # V-01 · /login (unauthenticated)
│   │   │
│   │   └── (protected)/                 # Route group — VerifierShell layout (auth guard)
│   │       ├── layout.tsx               # Topbar + Sidebar (lighter green accent) + VERIFIER guard
│   │       ├── page.tsx                 # V-02 · / → Verifier Dashboard (summary + anomaly alerts)
│   │       │
│   │       └── batches/
│   │           ├── page.tsx             # V-03 · /batches → Farm Batch Queue (smart-sorted)
│   │           └── [batchId]/
│   │               ├── page.tsx         # V-04 · /batches/:id → Batch Detail + Approve/Reject
│   │               └── tree/
│   │                   └── [treeId]/
│   │                       └── page.tsx # V-05 · /batches/:id/tree/:id → Tree Deep Inspect
│   │
│   └── verify/
│       └── qr-check/
│           └── page.tsx                 # V-06 · /verify/qr-check?session_id= (PUBLIC, no auth)
│
├── features/                            # ─── FEATURE-BASED BUSINESS LOGIC ───
│   │
│   ├── auth/                            # Authentication (Admin + Verifier)
│   │   ├── components/                  # LoginForm, ErrorBanner
│   │   ├── actions/                     # loginAdmin.ts, loginVerifier.ts, logout.ts
│   │   ├── hooks/                       # useSession.ts, useAuthGuard.ts
│   │   ├── services/                    # POST /auth/admin/login · POST /auth/verifier/login
│   │   └── types/                       # AdminSession, VerifierSession, AdminRole
│   │
│   ├── dashboard/                       # KPI Overview (A-02)
│   │   ├── components/                  # KpiCard, KpiAlertCard, QuickLinkCard
│   │   ├── actions/                     # fetchDashboardSummary.ts
│   │   ├── hooks/                       # useDashboardSummary.ts
│   │   ├── services/                    # GET /dashboard/summary
│   │   └── types/                       # DashboardSummary, KpiData
│   │
│   ├── farmers/                         # Farmer Management (A-03, A-04)
│   │   ├── components/                  # FarmerTable, FarmerDetailCard,
│   │   │                                # KycDocumentViewer, BankAccountSection,
│   │   │                                # CarbonHistorySection, PayoutHistorySection
│   │   ├── actions/                     # fetchFarmers.ts, fetchFarmerById.ts
│   │   ├── hooks/                       # useFarmerList.ts, useFarmerDetail.ts
│   │   ├── services/                    # GET /farmers · GET /farmers/:id
│   │   └── types/                       # Farmer, FarmerDetail, FarmerRoleView
│   │
│   ├── kyc/                             # KYC Verification (A-05 · prototype placeholder)
│   │   ├── components/                  # KycQueueTable, KycDocComparison (Coming Soon)
│   │   ├── actions/                     # approveKyc.ts, rejectKyc.ts (future)
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/                       # KycRecord, KycStatus
│   │
│   ├── gis/                             # Farm Map & Overlap Validation (A-06)
│   │   ├── components/                  # FarmMap, FarmPolygonLayer, MapSidebarPanel,
│   │   │                                # OverlapAlertBadge, FarmFilterToggle
│   │   ├── actions/                     # fetchFarmGeoJson.ts
│   │   ├── hooks/                       # useFarmMap.ts, useOverlapFilter.ts
│   │   ├── services/                    # GET /farms/geojson
│   │   └── types/                       # FarmGeoJson, FarmPolygon, OverlapFlag
│   │
│   ├── payouts/                         # Payout & Withdrawal (A-07, A-08)
│   │   ├── components/                  # PayoutTable, PayoutDetailCard,
│   │   │                                # SlipUploadZone, StatusTimeline,
│   │   │                                # PayoutValueDisplay, RejectReasonForm
│   │   ├── actions/                     # approvePayout.ts, rejectPayout.ts, uploadSlip.ts
│   │   ├── hooks/                       # usePayoutList.ts, usePayoutDetail.ts
│   │   ├── services/                    # GET /payouts · GET /payouts/:id
│   │   │                                # PATCH /payouts/:id/status · POST /payouts/:id/slip
│   │   └── types/                       # PayoutRequest, PayoutDetail, PayoutStatus
│   │
│   ├── announcements/                   # Announcement Manager (A-09)
│   │   ├── components/                  # AnnouncementList, AnnouncementForm, PublishToggle
│   │   ├── actions/                     # createAnnouncement.ts, updateAnnouncement.ts,
│   │   │                                # deleteAnnouncement.ts
│   │   ├── hooks/                       # useAnnouncements.ts
│   │   ├── services/                    # GET/POST/PATCH /announcements
│   │   └── types/                       # Announcement, AnnouncementStatus
│   │
│   ├── settings/                        # System Settings (A-10)
│   │   ├── components/                  # MarketPriceForm, PriceConfirmDialog
│   │   ├── actions/                     # updateMarketPrice.ts
│   │   ├── hooks/                       # useSystemSettings.ts
│   │   ├── services/                    # GET/PATCH /system/settings
│   │   └── types/                       # SystemSettings, CarbonMarketConfig
│   │
│   ├── audit-log/                       # Admin Audit Log (A-11)
│   │   ├── components/                  # AuditLogTable, AuditLogFilters
│   │   ├── actions/                     # fetchAuditLog.ts
│   │   ├── hooks/                       # useAuditLog.ts
│   │   ├── services/                    # GET /audit-log
│   │   └── types/                       # AuditLogEntry, AuditAction
│   │
│   ├── admin-users/                     # Admin User Management (A-12)
│   │   ├── components/                  # AdminUserTable, InviteAdminModal, RoleSelector
│   │   ├── actions/                     # inviteAdmin.ts, updateAdminRole.ts,
│   │   │                                # suspendAdmin.ts, deleteAdmin.ts
│   │   ├── hooks/                       # useAdminUsers.ts
│   │   ├── services/                    # GET/POST/PATCH/DELETE /admin-users
│   │   └── types/                       # AdminUser, AdminRole, InvitePayload
│   │
│   ├── support/                         # Support Hub (A-13)
│   │   ├── components/                  # LineOaPanel, EscalationTable, EscalateDropdown
│   │   ├── actions/                     # escalateTicket.ts
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/                       # EscalationRecord
│   │
│   ├── verifier/                        # Verifier Portal — Batch & MRV Review (V-02..V-05)
│   │   ├── components/                  # VerifierDashboardSummary, AnomalyAlertPanel,
│   │   │                                # BatchTable, BatchDetailCard, MrvDataSummary,
│   │   │                                # TreeSnapshotGrid, TreeSnapshotTile,
│   │   │                                # TreeInspectPanel, CrossCheckWarning,
│   │   │                                # BatchActionBar, RejectReasonForm, PdfDownloadButton
│   │   ├── actions/                     # approveBatch.ts, rejectBatch.ts,
│   │   │                                # bulkApproveBatch.ts, generateBatchPdf.ts
│   │   ├── hooks/                       # useVerifierDashboard.ts, useBatchList.ts,
│   │   │                                # useBatchDetail.ts, useTreeInspect.ts
│   │   ├── services/                    # GET /verifier/dashboard/summary
│   │   │                                # GET /verifier/batches · GET /verifier/batches/:id
│   │   │                                # POST /verifier/batches/:id/approve
│   │   │                                # POST /verifier/batches/:id/reject
│   │   │                                # GET /verifier/batches/:id/pdf
│   │   │                                # GET /verifier/batches/:batchId/tree/:treeId
│   │   └── types/                       # Batch, BatchDetail, TreeSnapshot,
│   │                                    # AnomalyFlag, VerifierSummary
│   │
│   └── qr-verify/                       # Public QR Document Verification (V-06)
│       ├── components/                  # VerifyResultCard (Valid / Invalid state)
│       ├── actions/                     # verifySessionId.ts
│       ├── hooks/                       # useQrVerify.ts
│       ├── services/                    # GET /verify/session/:session_id
│       └── types/                       # SessionVerifyResult
│
├── components/
│   └── ui/                              # ─── SHARED DESIGN SYSTEM ───
│       ├── button.tsx                   # Primary (Red), Secondary (Green), Tertiary, Danger
│       ├── input.tsx                    # Text, Password (44px, #004C22 focus ring)
│       ├── textarea.tsx                 # min-height 120px, resize-vertical
│       ├── card.tsx                     # Base card + KpiCard variant
│       ├── badge.tsx                    # verified, pending, rejected, info, neutral
│       ├── data-table.tsx               # Full table system (thead, sort, pagination)
│       ├── modal.tsx                    # 360/480/640px variants + focus trap
│       ├── confirm-dialog.tsx           # Destructive confirmation pattern
│       ├── alert-banner.tsx             # Inline page feedback (success/error/warning/info)
│       ├── toast.tsx                    # Bottom-right toast, auto-dismiss 4s
│       ├── skeleton.tsx                 # Shimmer loading (table rows, KPI cards)
│       ├── file-upload.tsx              # Drag-and-drop slip upload zone
│       ├── empty-state.tsx              # Centered icon + heading + description
│       ├── pagination.tsx               # Showing X-Y of Z + prev/next
│       ├── sidebar-nav.tsx              # AdminSidebar + VerifierSidebar (green #004C22)
│       ├── topbar.tsx                   # 64px topbar + role badge + avatar dropdown
│       └── index.ts                     # Barrel export
│
├── hooks/                               # ─── GLOBAL HOOKS ───
│   ├── use-debounce.ts                  # Search input debounce
│   ├── use-pagination.ts                # Page/offset state
│   └── use-media-query.ts               # Responsive breakpoints (1280/1024/768px)
│
└── lib/                                 # ─── UTILITIES & CONFIG ───
    ├── api/
    │   ├── client.ts                    # Base fetch wrapper (error handling, headers, auth token)
    │   ├── admin-client.ts              # Admin API base URL + token injection
    │   └── verifier-client.ts           # Verifier API base URL + token injection
    ├── auth/
    │   └── session.ts                   # Cookie-based session read/write, role extraction
    ├── utils/
    │   ├── format.ts                    # formatTHB(), formatKgCO2e(), formatDate(), maskAccountNumber()
    │   ├── carbon.ts                    # calculatePayoutValue(kgCO2e, marketPrice) helper
    │   └── rbac.ts                      # canAccess(role, permission), getVisibleFields(role)
    └── constants/
        ├── roles.ts                     # MASTER | VERIFY | FINANCE | GENERAL | VERIFIER
        └── routes.ts                    # ADMIN_ROUTES, VERIFIER_ROUTES constants
```

---

## Part 2 — Route × Feature Navigation Guide

> ใช้ตารางนี้เพื่อระบุว่า URL ไหนอยู่โฟลเดอร์ใด และ logic ดึงมาจาก feature ไหน

### สถาปัตยกรรมภาพรวม

`middleware.ts` รับ Request และ Rewrite URL ตาม subdomain ก่อนถึง App Router:

```
dashboard.farmflow.[domain]/*  →  /admin/*
verifier.farmflow.[domain]/*   →  /verifier/*
```

Session & RBAC ถูก enforce ที่ `app/admin/(protected)/layout.tsx`
และ `app/verifier/(protected)/layout.tsx` ผ่าน `lib/auth/session.ts` + `lib/utils/rbac.ts`

---

### Admin Dashboard (`dashboard.farmflow.[domain]`)

| Page ID | URL ที่ User เห็น | โฟลเดอร์ใน `app/` | Feature ที่ดึง Logic มา | Roles ที่เข้าได้ |
|---------|-----------------|---|---|---|
| A-01 | `/login` | `admin/login/` | `features/auth/` | Public |
| A-02 | `/` | `admin/(protected)/` | `features/dashboard/` | ALL |
| A-03 | `/farmers` | `admin/(protected)/farmers/` | `features/farmers/` | ALL |
| A-04 | `/farmers/:id` | `admin/(protected)/farmers/[id]/` | `features/farmers/` | ALL (field visibility varies by role) |
| A-05 | `/kyc` | `admin/(protected)/kyc/` | `features/kyc/` | VERIFY, MASTER *(prototype: placeholder)* |
| A-06 | `/gis` | `admin/(protected)/gis/` | `features/gis/` | VERIFY, MASTER |
| A-07 | `/payouts` | `admin/(protected)/payouts/` | `features/payouts/` | FINANCE, MASTER |
| A-08 | `/payouts/:id` | `admin/(protected)/payouts/[requestId]/` | `features/payouts/` | FINANCE, MASTER |
| A-09 | `/announcements` | `admin/(protected)/announcements/` | `features/announcements/` | MASTER, GENERAL |
| A-10 | `/settings` | `admin/(protected)/settings/` | `features/settings/` | MASTER only |
| A-11 | `/audit-log` | `admin/(protected)/audit-log/` | `features/audit-log/` | MASTER only |
| A-12 | `/admin-users` | `admin/(protected)/admin-users/` | `features/admin-users/` | MASTER only |
| A-13 | `/support` | `admin/(protected)/support/` | `features/support/` | GENERAL, MASTER |

---

### Verifier Portal (`verifier.farmflow.[domain]`)

| Page ID | URL ที่ User เห็น | โฟลเดอร์ใน `app/` | Feature ที่ดึง Logic มา | Roles |
|---------|---|---|---|---|
| V-01 | `/login` | `verifier/login/` | `features/auth/` | Public |
| V-02 | `/` | `verifier/(protected)/` | `features/verifier/` | VERIFIER |
| V-03 | `/batches` | `verifier/(protected)/batches/` | `features/verifier/` | VERIFIER |
| V-04 | `/batches/:batchId` | `verifier/(protected)/batches/[batchId]/` | `features/verifier/` | VERIFIER |
| V-05 | `/batches/:batchId/tree/:treeId` | `verifier/(protected)/batches/[batchId]/tree/[treeId]/` | `features/verifier/` | VERIFIER |
| V-06 | `/verify/qr-check?session_id=` | `verify/qr-check/` | `features/qr-verify/` | **PUBLIC** (no auth) |

---

### Feature → ความรับผิดชอบและ API Endpoints

| Feature | ความรับผิดชอบหลัก | API Endpoint หลัก |
|---|---|---|
| `features/auth/` | Login form, session management, role token | `POST /auth/admin/login` · `POST /auth/verifier/login` |
| `features/dashboard/` | KPI summary cards, role-filtered widget rendering | `GET /dashboard/summary` |
| `features/farmers/` | Farmer list + detail, role-based field visibility, document preview | `GET /farmers` · `GET /farmers/:id` |
| `features/kyc/` | KYC queue *(prototype placeholder — auto-bypass to Active)* | — |
| `features/gis/` | GeoJSON map render, overlap flag display, PostGIS polygon styling | `GET /farms/geojson` |
| `features/payouts/` | Payout queue, THB calc (`kgCO2e × market_price`), slip upload | `GET/PATCH /payouts` · `POST /payouts/:id/slip` |
| `features/announcements/` | CRUD announcement, publish toggle, rich text body | `GET/POST/PATCH /announcements` |
| `features/settings/` | `market_price_thb` edit + confirmation dialog (MASTER only) | `GET/PATCH /system/settings` |
| `features/audit-log/` | Read-only log table, date/role/action filter (append-only) | `GET /audit-log` |
| `features/admin-users/` | Invite, role edit, suspend, delete admin (cannot self-action) | `GET/POST/PATCH/DELETE /admin-users` |
| `features/support/` | LINE OA embed, manual escalation log | — |
| `features/verifier/` | Batch queue, MRV review, tree inspect, approve/reject, PDF export | `GET /verifier/batches` · `/approve` · `/reject` · `/pdf` |
| `features/qr-verify/` | `session_id` lookup → Valid/Invalid — **no PII exposed** | `GET /verify/session/:session_id` |

---

### Shared Infrastructure

| โฟลเดอร์ | ใช้ทำอะไร |
|---|---|
| `components/ui/` | Design System ทั้งหมด — Button, Badge, DataTable, Modal, Skeleton ฯลฯ |
| `lib/api/client.ts` | Base fetch wrapper — attach token, handle 401/403 globally |
| `lib/auth/session.ts` | อ่าน/เขียน session cookie, extract role สำหรับ RBAC check |
| `lib/utils/format.ts` | `formatTHB()`, `formatKgCO2e()`, `maskAccountNumber()` สำหรับ UI |
| `lib/utils/rbac.ts` | `canAccess(role, permission)` ใช้ใน `layout.tsx` ทุก protected route |
| `lib/utils/carbon.ts` | `calculatePayoutValue(kgCO2e, marketPrice)` สำหรับหน้า Payout |
| `lib/constants/roles.ts` | `MASTER \| VERIFY \| FINANCE \| GENERAL \| VERIFIER` enum |
| `middleware.ts` | Subdomain rewrite: `dashboard.*` → `/admin/*` · `verifier.*` → `/verifier/*` |

---

### Access Control Matrix

| Page | MASTER | VERIFY | FINANCE | GENERAL | VERIFIER |
|---|:---:|:---:|:---:|:---:|:---:|
| A-01 Login | ✅ | ✅ | ✅ | ✅ | — |
| A-02 Dashboard | ✅ | ✅ | ✅ | ✅ | — |
| A-03 Farmer List | ✅ | ✅ | ✅ | ✅ | — |
| A-04 Farmer Detail | ✅ | ✅ (KYC) | ✅ (bank) | ✅ (basic) | — |
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
| V-06 QR Verify | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |

---

> **หมายเหตุ:** โปรเจกต์ใช้ Next.js **16.2.6** ซึ่งอาจมี API ที่เปลี่ยนจาก version ที่คุ้นเคย
> ให้ตรวจสอบ `node_modules/next/dist/docs/` ก่อนเริ่มเขียนโค้ดทุกครั้ง ตามที่ระบุใน `AGENTS.md`
