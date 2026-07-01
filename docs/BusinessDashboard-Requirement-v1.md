# FarmFlow — Business Dashboard Requirement v1
# Build Spec for Claude Code (machine-readable)

<!--
  METADATA
  ─────────────────────────────────────────────────────
  Project        : FarmFlow Carbon FinTech Platform
  Document       : Business Dashboard — Build Specification
  Version        : v1.0
  Author         : นาย วัยวัฒน์ อภิรักษ์ทานนท์
  Subdomain      : business.farmflow.[domain]
  Pages          : 13 build now (P00–P12) + 1 reserved (P13 Flowder, Phase 2)
  Stack          : Next.js (App Router) + Tailwind CSS | PostgreSQL + PostGIS | S3 file storage | JWT auth
  Source of truth: ERD v3 (current DB) + BRD Business Dashboard v1 + Wireframe Business Dashboard v1
  Related docs   : FarmFlowApp-ERDiagram-v3.md, FarmFlow_BRD_Business_Dashboard_V1, FarmFlow_Wireframe_Business_Dashboard_V1

  ⚠️ READ THIS FIRST — 4 NON-NEGOTIABLE RULES
  ─────────────────────────────────────────────────────
  1. NEW TABLES ARE PROPOSED, NOT REAL YET.
     Every table in §2 marked "STATUS: PROPOSED (ERD v4)" DOES NOT EXIST in the
     current database (which is ERD v3, Zero-PII). Claude Code MUST create
     migrations for them. Do NOT assume they already exist. Do NOT query them
     before the migration is written.

  2. MINIMAL-PII, NOT ZERO-PII (but DB is still Zero-PII today).
     This spec assumes USERS stores full_name, phone, email (Minimal-PII).
     ERD v3 USERS has NONE of these. The ALTER in §2.2 is PROPOSED for ERD v4.
     Until migrated, customer contact screens cannot show real data.

  3. NO PAYMENT GATEWAY. NO BANK ACCOUNT IN DB — EVER.
     There is no payment gateway integration. Bank account numbers are NEVER
     stored in any table. They may appear as MOCK display in the UI only.
     All money flows (incoming subscription, outgoing payout) use:
        upload slip → Finance verifies → Finance signs off (verified_by + signed_at)
     Persisted = slip file + amount + verifier id + signed time. NOT bank numbers.

  4. VERIFIER GATE FOR PAYOUTS.
     Outgoing payout to a farmer is only allowed for CARBON_CREDIT_BATCHES that an
     external Verifier already approved and that were SOLD. Business/Finance can
     NEVER approve MRV, edit KYC, or change carbon price.

  SCOPE THIS ROUND:
     • BUILD: P00–P12 + Feature 1 (packages.device_limit; enforce at device registration).
     • RESERVE SCHEMA ONLY (no UI): P13 Flowder (§2.3.1 + §2.3.2). Create the migrations
       so live tables never need re-migration later, but do NOT build the Flowder workflow
       in the Prototype.
-->

---

## 0. How Claude Code should use this document

- This file is the **single source of truth for building the Business Dashboard**. When it conflicts with assumptions, this file wins; when it is silent, follow existing repo conventions.
- The Business Dashboard lives in the **same Next.js project** as the rest of FarmFlow (mobile API + Admin + Verifier). It is reached via the Portal dashboard switcher (see §1.1).
- Build order: **§2 migrations first** → §3 RBAC → §4 shared conventions → §5 pages (suggested sequence in §7).
- Every table/field/route/permission referenced in §5 is defined in §2/§3/§4. If a name is not defined here, treat it as an existing ERD v3 object (see §2.5 reuse list).
- Definition of Done (DoD) checklists in each page section are the acceptance criteria.

---

## 1. Scope & Architecture

### 1.1 Portal + Dashboard switcher

Single web app, multiple role-scoped dashboards selected after login at the Portal:

```
portal.farmflow.[domain]      → Landing/Login. After auth, user picks a dashboard
                                they are allowed to enter:
                                  • Admin Dashboard      (dashboard.farmflow)  — MRV, KYC, price
                                  • Verifier Dashboard   (verifier.farmflow)   — external audit
                                  • Business Dashboard   (business.farmflow)   — THIS SPEC
```

- All dashboards share one auth system (JWT access token + `refresh_tokens` rotation) and one `admins` + `roles` RBAC backbone.
- The dashboard a staff member may enter is derived from their `role_name` (§3). A user with no business permission must not see the Business Dashboard option.

### 1.2 Tech stack & conventions (defaults — follow repo if it already differs)

| Concern            | Convention |
|--------------------|------------|
| Framework          | Next.js **App Router** (`app/`), React Server Components where possible |
| Styling            | Tailwind CSS. Reuse existing design tokens / shared UI components |
| API                | Next.js **Route Handlers** under `app/api/business/**` (REST). If the repo already uses tRPC, mirror that instead |
| DB access          | Match existing repo (Prisma **or** raw SQL via the existing client). **Do not introduce a second ORM.** Migrations follow the repo's existing migration tool |
| DB                 | PostgreSQL (+ PostGIS already enabled). UUID primary keys (`gen_random_uuid()` / `uuid`) |
| Auth               | JWT access token (short-lived) + `refresh_tokens`. RBAC guard on every business route (§3.4) |
| Files              | All uploads go through the existing `files` table + S3. Never store binary in business tables; store `*_file_id` FK → `files.file_id` |
| Money              | No payment gateway. No bank fields. Slip + manual verify + sign-off (§4.5) |
| Soft delete        | Tables with `deleted_at` must be filtered `WHERE deleted_at IS NULL` on every read |
| Audit              | Every approve/reject/update writes `audit_logs` (§4.6) |
| Platform target    | Desktop / Tablet first (back-office). Responsive but not mobile-first |

### 1.3 Suggested folder layout (adapt to existing structure)

```
app/
  (portal)/portal/page.tsx                 # dashboard switcher
  (business)/business/
    layout.tsx                             # shell: TopBar + Sidebar + RBAC guard
    overview/page.tsx                      # P01
    packages/page.tsx                      # P02
    payments/page.tsx                      # P03  (incoming)
    payouts/page.tsx                       # P04  (outgoing)
    banners/page.tsx                       # P05
    crm/page.tsx                           # P06
    campaigns/page.tsx                     # P07
    iot/page.tsx                           # P08
    support/page.tsx                       # P09
    customers/page.tsx                     # P10
    audit/page.tsx                         # P11
    settings/page.tsx                      # P12
app/api/business/
  packages/route.ts  subscriptions/route.ts  payments/route.ts  payouts/route.ts
  banners/route.ts   leads/route.ts          campaigns/route.ts  iot/route.ts
  support/route.ts   customers/route.ts       overview/route.ts   audit/route.ts
lib/business/
  rbac.ts            # permission constants + guard
  audit.ts           # writeAuditLog()
  signoff.ts         # sign-off helper (verified_by, signed_at)
```

---

## 2. Data Model

> ⚠️ **All tables in §2.1–§2.4 are `STATUS: PROPOSED (ERD v4)` and DO NOT EXIST in the current database (ERD v3).**
> Claude Code must generate migrations from the DDL below before any business page can read/write them.
> DDL targets PostgreSQL. Adjust types/defaults to match the repo's migration conventions. **No bank-account columns anywhere — intentional.**

### 2.0 Conventions used in the DDL
- `uuid` PK default `gen_random_uuid()`. FK columns named `<entity>_id`.
- `created_at` / `updated_at` = `timestamptz default now()`. `deleted_at` nullable where soft delete applies.
- Sign-off pattern (money tables): `verified_by_admin_id uuid NULL REFERENCES admins`, `signed_at timestamptz NULL`. (No e-signature image; the admin_id + timestamp IS the signature record.)

### 2.1 RBAC tables — UPDATE EXISTING

`roles` and `admins` already exist (ERD v3). Only the `roles.role_name` enum/value set must be **extended** with business roles. Business staff are rows in `admins` whose `role_id` points at a business role.

```sql
-- PROPOSED (ERD v4): extend allowed values of roles.role_name
-- Existing: 'SuperAdmin' | 'Auditor' | 'Verifier'
-- Add     : 'BusinessMaster' | 'Sales' | 'Marketing' | 'CustomerService' | 'Finance'
-- roles.permissions (json) holds the permission-string array (see §3.1).
-- No schema change to admins; only new role rows + their permission arrays.
```

### 2.2 USERS — UPDATE EXISTING (Minimal-PII)

```sql
-- PROPOSED (ERD v4): add Minimal-PII columns to the existing users table.
-- Current users table is Zero-PII (username only). These are the ONLY PII fields allowed.
ALTER TABLE users
  ADD COLUMN full_name varchar(255),   -- ชื่อ-นามสกุล
  ADD COLUMN phone     varchar(20),    -- เบอร์โทร
  ADD COLUMN email     varchar(255);   -- อีเมล
-- ❌ DO NOT add national_id, kyc photos, or any bank fields. Out of scope by policy.
```

### 2.3 Commercial tables — NEW (PROPOSED)

```sql
-- ── packages : Tier catalog (seed/hardcode for Prototype) ────────────────
CREATE TABLE packages (
  package_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  varchar(20) UNIQUE NOT NULL,   -- FREE | PREMIUM | GOLD | PLATINUM
  name                  varchar(100) NOT NULL,
  price_thb             numeric(12,2) NOT NULL DEFAULT 0,
  quota_rai             integer,                       -- max rai (NULL = unlimited base, see base_rai)
  base_rai              integer,                       -- PLATINUM base coverage (e.g. 200)
  overage_price_per_rai numeric(10,2),                 -- PLATINUM overage (e.g. 40 THB/rai)
  iot_free_units        integer NOT NULL DEFAULT 0,    -- free IoT devices granted
  device_limit          integer NOT NULL DEFAULT 2,    -- FEATURE 1: max simultaneous data-collection devices (login/Snap)
  features              jsonb,                         -- array of feature strings for UI
  is_active             boolean NOT NULL DEFAULT true,
  sort_order            integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
-- Seed: FREE(1–15rai, 0 IoT, device_limit=2), PREMIUM(฿1990,16–50rai, device_limit=5),
--       GOLD(฿4990,51–100rai,1 IoT, device_limit=10), PLATINUM(฿8900 base_rai=200,+฿40/rai,3 IoT, device_limit=25)

-- ── subscriptions : a user's active package ──────────────────────────────
CREATE TABLE subscriptions (
  subscription_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(user_id),
  package_id       uuid NOT NULL REFERENCES packages(package_id),
  status           varchar(20) NOT NULL DEFAULT 'Pending_Payment',
                   -- Pending_Payment | Active | Expired | Cancelled | Suspended
  quota_rai        integer,                  -- snapshot of allowed rai at activation
  started_at       timestamptz,
  expiry_date      timestamptz,
  auto_renew       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── payment_slips : INCOMING money (customer pays for a package) ──────────
CREATE TABLE payment_slips (
  slip_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(user_id),
  package_id           uuid NOT NULL REFERENCES packages(package_id),
  subscription_id      uuid REFERENCES subscriptions(subscription_id), -- set on approve
  slip_file_id         uuid NOT NULL REFERENCES files(file_id),        -- the slip image
  declared_amount_thb  numeric(12,2) NOT NULL,
  status               varchar(20) NOT NULL DEFAULT 'Pending_Review',
                       -- Pending_Review | Approved | Rejected
  rejection_reason     text,
  duplicate_flag       boolean NOT NULL DEFAULT false,  -- set if slip checksum already seen
  verified_by_admin_id uuid REFERENCES admins(admin_id),-- Finance who signed off
  signed_at            timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
  -- ❌ no bank account fields
);

-- ── payouts : OUTGOING money (pay farmer after carbon credit sale) ────────
CREATE TABLE payouts (
  payout_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(user_id),            -- farmer
  batch_id             uuid NOT NULL REFERENCES carbon_credit_batches(batch_id),
  tx_id                uuid REFERENCES credit_transactions(tx_id),         -- sale that funds it
  amount_thb           numeric(12,2) NOT NULL,
  status               varchar(20) NOT NULL DEFAULT 'Pending',
                       -- Pending | Paid | Rejected
  transfer_slip_file_id uuid REFERENCES files(file_id),  -- proof uploaded by Finance on pay
  rejection_reason     text,
  verified_by_admin_id uuid REFERENCES admins(admin_id), -- Finance who signed off
  signed_at            timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
  -- ❌ no bank account fields. GATE: only create rows for batches with status 'Sold'
);

-- ── banners : in-app marketing banners ───────────────────────────────────
CREATE TABLE banners (
  banner_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                varchar(150) NOT NULL,
  body                 text,
  image_file_id        uuid REFERENCES files(file_id),
  link_url             varchar(500),
  target_tier          varchar(20) NOT NULL DEFAULT 'ALL', -- ALL|FREE|PREMIUM|GOLD|PLATINUM
  status               varchar(20) NOT NULL DEFAULT 'Draft',
                       -- Draft | Scheduled | Published | Expired
  priority             integer NOT NULL DEFAULT 0,         -- display ordering
  start_at             timestamptz,
  end_at               timestamptz,
  created_by_admin_id  uuid REFERENCES admins(admin_id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ── leads + lead_activities : CRM ────────────────────────────────────────
CREATE TABLE leads (
  lead_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 varchar(255) NOT NULL,
  organization         varchar(255),
  email                varchar(255),
  phone                varchar(20),
  interest             text,
  source               varchar(20) NOT NULL DEFAULT 'website_form',
                       -- website_form | line_oa | manual | referral
  status               varchar(20) NOT NULL DEFAULT 'New',
                       -- New | Contacted | Qualified | Won | Lost
  assigned_to_admin_id uuid REFERENCES admins(admin_id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE lead_activities (
  activity_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      uuid NOT NULL REFERENCES leads(lead_id),
  admin_id     uuid NOT NULL REFERENCES admins(admin_id),
  activity_type varchar(20) NOT NULL,  -- call | email | meeting | note
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── campaigns + promo_codes : marketing ──────────────────────────────────
CREATE TABLE campaigns (
  campaign_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 varchar(150) NOT NULL,
  description          text,
  start_at             timestamptz,
  end_at               timestamptz,
  is_active            boolean NOT NULL DEFAULT true,
  created_by_admin_id  uuid REFERENCES admins(admin_id),
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE promo_codes (
  promo_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      uuid REFERENCES campaigns(campaign_id),
  code             varchar(50) UNIQUE NOT NULL,
  discount_type    varchar(10) NOT NULL,        -- percent | fixed
  discount_value   numeric(10,2) NOT NULL,
  max_redemptions  integer,                     -- NULL = unlimited
  redeemed_count   integer NOT NULL DEFAULT 0,
  valid_from       timestamptz,
  valid_until      timestamptz,
  is_active        boolean NOT NULL DEFAULT true,
  needs_master_approval boolean NOT NULL DEFAULT false, -- true if discount > cap
  created_at       timestamptz NOT NULL DEFAULT now()
);
-- NOTE: per-user referral usage already uses users.referral_code (ERD v3). Aggregate
-- referral stats by GROUP BY users.referral_code; no separate referral table needed.

-- ── iot_devices + iot_rentals : HaaS (distinct from ERD's `devices` = phones) ──
CREATE TABLE iot_devices (
  iot_device_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no      varchar(100) UNIQUE NOT NULL,
  model          varchar(100),
  status         varchar(20) NOT NULL DEFAULT 'Available',
                 -- Available | Rented | Repair | Damaged | Retired
  capex_thb      numeric(10,2) NOT NULL DEFAULT 2000,
  current_user_id uuid REFERENCES users(user_id),
  current_farm_id uuid REFERENCES farms(farm_id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE iot_rentals (
  rental_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iot_device_id    uuid NOT NULL REFERENCES iot_devices(iot_device_id),
  user_id          uuid NOT NULL REFERENCES users(user_id),
  farm_id          uuid REFERENCES farms(farm_id),
  monthly_fee_thb  numeric(10,2) NOT NULL DEFAULT 2700,
  deposit_thb      numeric(10,2) NOT NULL DEFAULT 0,
  source           varchar(10) NOT NULL DEFAULT 'paid',   -- paid | free_tier
  status           varchar(20) NOT NULL DEFAULT 'Active',  -- Active | Returned | Defaulted
  damage_reason    text,        -- set on damage: System Defect → free swap | Human Error → forfeit
  started_at       timestamptz NOT NULL DEFAULT now(),
  ended_at         timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── support_tickets : optional in Prototype (LINE OA is primary) ──────────
CREATE TABLE support_tickets (
  ticket_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES users(user_id),
  subject              varchar(255) NOT NULL,
  body                 text,
  category             varchar(50),
  status               varchar(20) NOT NULL DEFAULT 'Open',
                       -- Open | In_progress | Resolved | Closed
  assigned_to_admin_id uuid REFERENCES admins(admin_id),
  escalated_to         varchar(50),       -- Sales | Marketing | Admin
  line_thread_ref      varchar(255),      -- link/ref to LINE OA conversation
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
```

### 2.3.1 Flowder tables — NEW (PROPOSED · PHASE 2)

> **STATUS: PROPOSED (ERD v4) · PHASE 2 — schema only, NO UI in Prototype.**
> A *Flowder* is a certified field agent who collects data on behalf of farm owners (Platform "creates local jobs"). A Flowder is a normal `user` who holds an active certification — **not** a separate account type. Reserve these tables + the `assessment_sessions` columns in §2.3.2 **now** (cheap), build the workflow later (§5 P13).
> 🔒 MRV trust rule: a Flowder may only collect a farm that has (a) an **active certification** AND (b) an **active assignment** from that farm's owner. No assignment = no access.

```sql
-- ── flowder_certifications : training/license record for a user ───────────
CREATE TABLE flowder_certifications (
  certification_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(user_id),  -- the certified person
  certificate_no       varchar(50) UNIQUE,
  status               varchar(20) NOT NULL DEFAULT 'Active',
                       -- Active | Suspended | Revoked | Expired
  trained_at           timestamptz,        -- date course completed
  issued_at            timestamptz,
  expires_at           timestamptz,
  issued_by_admin_id   uuid REFERENCES admins(admin_id),
  revoke_reason        text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ── flowder_assignments : farm owner authorizes a Flowder for a period ─────
CREATE TABLE flowder_assignments (
  assignment_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id          uuid NOT NULL REFERENCES farms(farm_id),
  flowder_user_id  uuid NOT NULL REFERENCES users(user_id),   -- the Flowder
  granted_by_user_id uuid NOT NULL REFERENCES users(user_id), -- farm owner who authorized
  status           varchar(20) NOT NULL DEFAULT 'Active',     -- Active | Expired | Revoked
  valid_from       timestamptz NOT NULL DEFAULT now(),
  valid_until      timestamptz,                               -- NULL = until revoked
  -- payout_terms  jsonb,   -- RESERVED for future: Flowder wage handling (Phase 3, out of scope now)
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
```

### 2.3.2 ASSESSMENT_SESSIONS — UPDATE EXISTING (PROPOSED · PHASE 2 fields)

> `assessment_sessions` is a **core ERD v3 table in active 3S work**. Reserving these two columns now avoids a painful large-table migration later. Until used, `collected_by_user_id` defaults to the farm owner (self-collection).

```sql
-- PROPOSED (ERD v4): record WHO physically collected each session
ALTER TABLE assessment_sessions
  ADD COLUMN collected_by_user_id uuid REFERENCES users(user_id),       -- person holding the phone
  ADD COLUMN flowder_assignment_id uuid REFERENCES flowder_assignments(assignment_id); -- NULL if owner collected
-- Logic: if collected_by_user_id = farm.owner_user_id → self-collection (assignment_id NULL).
--        if a Flowder collected → collected_by_user_id = Flowder, assignment_id REQUIRED + must be Active.
-- This extends existing anti-fraud (a Flowder snapping many farms in one day = suspicious, like device-signature checks).
```

```sql
CREATE INDEX idx_subscriptions_user        ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status      ON subscriptions(status, expiry_date);
CREATE INDEX idx_payment_slips_status      ON payment_slips(status, created_at);
CREATE INDEX idx_payouts_status            ON payouts(status, created_at);
CREATE INDEX idx_payouts_batch             ON payouts(batch_id);
CREATE INDEX idx_banners_status_priority   ON banners(status, priority);
CREATE INDEX idx_leads_status              ON leads(status, assigned_to_admin_id);
CREATE INDEX idx_iot_rentals_status        ON iot_rentals(status);
CREATE INDEX idx_support_tickets_status    ON support_tickets(status, assigned_to_admin_id);
-- Phase 2 (Flowder)
CREATE INDEX idx_flowder_cert_user         ON flowder_certifications(user_id, status);
CREATE INDEX idx_flowder_assign_lookup     ON flowder_assignments(flowder_user_id, farm_id, status);
CREATE INDEX idx_assessment_collected_by   ON assessment_sessions(collected_by_user_id);
```

### 2.5 Existing ERD v3 tables reused (DO NOT recreate)

`users` · `admins` · `roles` · `refresh_tokens` · `devices` · `push_tokens` · `files` · `audit_logs` · `status_histories` · `farms` · `assessment_sessions` · `tree_snapshots` · `assessment_results` · `carbon_market_config` · `carbon_credit_batches` · `credit_transactions` · `notifications`

Key reused fields: `carbon_market_config.market_price_thb` (Estimated Value), `assessment_sessions.total_carbon_kgco2e` & `tree_snapshots.estimated_carbon_kgco2e` (carbon totals), `carbon_credit_batches.status` (`Pending|Issued|Sold|Retired` — payout gate uses `Sold`), `credit_transactions.total_amount_thb` (sale proceeds → payout basis), `notifications` (push to farmer on approve/pay), `devices` (existing per-user device registry — used by **FEATURE 1** `device_limit` enforcement).

> **Platform impact note:** packages and the Flowder model are deliberately designed so the platform *creates local jobs* — higher tiers unlock more data-collection devices, and (Phase 2) certified Flowders can earn income collecting on behalf of farm owners. Keep this intent visible in package marketing copy and the Overview narrative.

---

## 3. RBAC & Permissions

### 3.1 Permission strings (store array in `roles.permissions`)

```
overview:read
package:read     package:manage     package:approve
payment:read     payment:approve
payout:read      payout:approve
banner:manage
lead:read        lead:manage
campaign:manage
iot:read         iot:manage
support:read     support:manage
customer:read    customer:read_pii        # read_pii unlocks full_name/phone/email
audit:read
staff:manage                              # manage business staff (BusinessMaster only)
flowder:read     flowder:manage           # PHASE 2 — issue/suspend Flowder certifications (see P13)
```

> Business roles must **never** receive: `mrv:approve`, `kyc:edit`, `price:edit`, or any audit-mutation permission. Those belong to Admin/Verifier dashboards.

### 3.2 Role → permissions

| Role (`role_name`)   | Permissions |
|----------------------|-------------|
| `BusinessMaster`     | all business permissions + `audit:read` + `staff:manage` + `flowder:read` + `flowder:manage` |
| `Finance`            | `overview:read`, `payment:read`, `payment:approve`, `payout:read`, `payout:approve`, `package:read`, `iot:read`, `customer:read` |
| `Sales`              | `overview:read`, `package:read`, `package:manage`, `lead:read`, `lead:manage`, `iot:read`, `iot:manage`, `payment:read`, `customer:read`, `customer:read_pii`, `flowder:read` *(Phase 2)* |
| `Marketing`          | `overview:read`, `banner:manage`, `campaign:manage`, `lead:read`, `lead:manage`, `customer:read` |
| `CustomerService`    | `overview:read`, `support:read`, `support:manage`, `customer:read`, `customer:read_pii`, `package:read`, `payment:read`, `payout:read` |

### 3.3 Page visibility matrix (✓ act · R read-only · — hidden)

| Page | BusinessMaster | Sales | Marketing | CustomerService | Finance |
|------|:---:|:---:|:---:|:---:|:---:|
| P01 Overview        | ✓ | ✓ | ✓ | ✓ | ✓ |
| P02 Packages        | ✓ | ✓ | — | R | R |
| P03 Payment (in)    | ✓ | R | — | R | ✓ |
| P04 Payout (out)    | ✓ | — | — | R | ✓ |
| P05 Banners         | ✓ | — | ✓ | — | — |
| P06 CRM             | ✓ | ✓ | ✓ | — | — |
| P07 Campaigns       | ✓ | — | ✓ | — | — |
| P08 IoT HaaS        | ✓ | ✓ | — | R | R |
| P09 Support         | ✓ | ✓ | ✓ | ✓ | — |
| P10 Customers       | ✓ | ✓ | ✓ | ✓ | R |
| P11 Audit Log       | ✓ | — | — | — | — |
| P12 Settings        | ✓ | ✓ | ✓ | ✓ | ✓ |
| P13 Flowder *(Phase 2)* | ✓ | R | — | — | — |

### 3.4 RBAC guard (apply to every business route + page)

```ts
// lib/business/rbac.ts (pseudocode)
export async function requirePermission(req, perm: string) {
  const admin = await getAdminFromJWT(req);            // throws 401 if no valid token
  if (admin.admin_status !== 'Active') throw new ForbiddenError();
  const role = await getRole(admin.role_id);           // roles.permissions: string[]
  if (!role.permissions.includes(perm)) throw new ForbiddenError(); // 403
  return admin;
}
// Server Components / layout.tsx: redirect to /portal if the user lacks any business:* permission.
```

---

## 4. Global Conventions (apply to all pages)

### 4.1 API response shape

```jsonc
// success
{ "ok": true,  "data": { /* ... */ }, "meta": { "page": 1, "pageSize": 20, "total": 137 } }
// error
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "human readable", "fields": {} } }
```

### 4.2 Data Grid contract
Every list endpoint supports: `?page`, `?pageSize` (default 20, max 100), `?sort`, `?q` (search), plus page-specific filters. Always filter `deleted_at IS NULL` for soft-delete tables. Return `meta.total` for pagination.

### 4.3 UI states
Every grid renders 4 states: **loading** (skeleton), **empty**, **error** (retry), **data**. Status values render as colored badges: green=success/Active/Paid, amber=Pending/awaiting, red=Rejected/Damaged, grey=Expired/Closed.

### 4.4 Confirmation + reject reason
Any action that changes money or status (Approve/Reject/Pay/Delete/Publish) opens a confirmation modal. **Reject always requires a non-empty reason** written to the row's `*_reason` field.

### 4.5 Money sign-off (Payment & Payout) — shared helper
```ts
// lib/business/signoff.ts (pseudocode)
async function approveWithSignoff(table, id, adminId) {
  // set status='Approved'|'Paid', verified_by_admin_id=adminId, signed_at=now()
  // write audit_logs (action='APPROVE'); push notification to the user
}
```
- **No payment gateway. Bank numbers are never read from or written to the DB.** If a bank number must be shown to perform a transfer, it is a transient mock value in the UI; it is not persisted.
- Persisted evidence = `*_file_id` (slip) + amount + `verified_by_admin_id` + `signed_at`.

### 4.6 Audit logging (mandatory)
On every create/update/approve/reject across all business tables, write:
```
audit_logs(actor_id=admin_id, actor_type='ADMIN', action, table_name, record_id, old_data, new_data, created_at)
```
For status changes on long-lived entities, also append to `status_histories` where applicable.

### 4.7 File upload
Use the existing upload pipeline → insert into `files` (uploader_type='ADMIN', access_level='PRIVATE' for slips) → store returned `file_id` in the business table. Slip images are PRIVATE.

---

## 5. Page Specifications (P00–P12)

> Each page lists: **Route · Permission · Purpose · Layout · Components · Tables · API · Logic · Validation · DoD · Prototype**.
> Reminder: every `[PROPOSED]` table is from §2 and must be migrated first.

### P00 · Login (Portal)
- **Route:** `portal.farmflow.[domain]/login` then dashboard switcher
- **Permission:** public (pre-auth)
- **Purpose:** authenticate staff, then let them choose an allowed dashboard.
- **Components:** username + password form; login-lockout message; after auth, a switcher listing only dashboards the role can enter.
- **Tables:** `admins`, `roles`, `refresh_tokens`.
- **API:** `POST /api/auth/login` → `{accessToken, refreshToken, allowedDashboards[]}`; `POST /api/auth/logout` (revoke refresh token); `POST /api/auth/refresh`.
- **Logic:** verify bcrypt `password_hash`; issue JWT + insert `refresh_tokens`; `allowedDashboards` derived from role permissions (business shown if any `*:read` business perm present).
- **Validation:** lockout after N failed attempts; reject if `admin_status != 'Active'`.
- **DoD:** [ ] valid login routes to switcher [ ] business option hidden without permission [ ] logout revokes refresh token [ ] lockout works.
- **Prototype:** username+password only (SSO fields exist but unused).

### P01 · Business Overview
- **Route:** `/business/overview` · **Permission:** `overview:read`
- **Purpose:** one-screen business health.
- **Layout:** KPI card row → revenue trend chart → tier distribution → pipeline summary → impact metrics.
- **Components:** KPI cards (Total Revenue, MRR, Active Users, Total Rai, Free→Paid conversion, Churn, HaaS profit); revenue trend (by month, stacked by tier); tier donut; counts of Pending slips / Pending payouts / open tickets / new leads (each a quick-link); impact metrics (carbon in system, # farmers, community value).
- **Tables:** `subscriptions` [PROPOSED], `payment_slips` [PROPOSED], `payouts` [PROPOSED], `credit_transactions`, `iot_rentals` [PROPOSED], `leads` [PROPOSED], `users`, `farms`, `assessment_sessions`, `carbon_market_config`.
- **API:** `GET /api/business/overview?from&to` → aggregated KPIs + series.
- **Logic:** Revenue(in) = SUM approved `payment_slips.declared_amount_thb`. HaaS profit = active `iot_rentals` × (fee − amortized capex). Estimated carbon value = carbon × latest `carbon_market_config.market_price_thb` (`effective_from <= now()` desc limit 1).
- **DoD:** [ ] KPIs match underlying queries [ ] date filter works [ ] cards drill-down to their pages [ ] numbers shown per role scope.
- **Prototype:** manual refresh acceptable; charts may use server-aggregated JSON.

### P02 · Package & Subscription Management
- **Route:** `/business/packages` · **Permission:** `package:read` (view), `package:manage` (mutate)
- **Purpose:** manage customer packages + tier catalog.
- **Components:** Tab A = Tier catalog cards (FREE / PREMIUM ฿1,990 / GOLD ฿4,990 / PLATINUM ฿8,900 +฿40/rai) — each card shows `quota_rai`, `iot_free_units`, and **`device_limit`** (FEATURE 1: 2 / 5 / 10 / 25); Tab B = customer Data Grid (name, current tier, `quota_rai`, used rai, expiry, payment status); filters (tier, status, expiring-soon); detail panel (upgrade/downgrade, activate/suspend, change history).
- **Tables:** `packages` [PROPOSED], `subscriptions` [PROPOSED], `users`, `farms`.
- **API:** `GET /api/business/subscriptions` (grid); `PATCH /api/business/subscriptions/:id` (upgrade/downgrade/suspend); `GET /api/business/packages`.
- **Logic:** On upgrade/downgrade, recompute `quota_rai`; **block** if SUM(`farms.calculated_area_rai WHERE owner_user_id=user AND deleted_at IS NULL`) > new `quota_rai` (prompt to keep higher tier). Pro-rate where relevant.
- **Validation:** cannot downgrade below current used rai; status transitions only along enum.
- **DoD:** [ ] grid + filters + pagination [ ] quota enforcement vs farms [ ] history logged to `audit_logs` [ ] tier cards reflect `packages` rows.
- **Prototype:** tier catalog seeded/hardcoded in `packages`; no catalog-edit UI required.

### P03 · Payment Slip Verification — INCOMING (package fees)
- **Route:** `/business/payments` · **Permission:** `payment:approve` (Finance), `payment:read` (Sales/CS view)
- **Purpose:** Finance verifies + signs off customer package payments.
- **Components:** queue grid (status `Pending_Review`: customer, package, amount due, uploaded time); large slip viewer (from `files`; **bank info shown is mock only**); verify+sign-off form (Approve→sign / Reject+reason); duplicate flag.
- **Tables:** `payment_slips` [PROPOSED], `subscriptions` [PROPOSED], `files`, `users`.
- **API:** `GET /api/business/payments?status=Pending_Review`; `POST /api/business/payments/:id/approve`; `POST /api/business/payments/:id/reject` (`{reason}`).
- **Logic:** Approve → use §4.5 sign-off → set `payment_slips.status='Approved'`, link/activate `subscriptions` (Activate per P02) → notify user. Duplicate detection via `files.checksum_hash`.
- **Validation:** reject requires reason; amount must equal package price (or flag mismatch); only Finance/Master may approve.
- **DoD:** [ ] approve activates subscription + writes `verified_by_admin_id`+`signed_at` [ ] reject stores reason + notifies [ ] duplicate flagged [ ] no bank field persisted anywhere.
- **Prototype:** manual eyeball verification; no bank API.

### P04 · Payout Verification — OUTGOING (pay farmers)
- **Route:** `/business/payouts` · **Permission:** `payout:approve` (Finance), `payout:read` (CS view)
- **Purpose:** Finance pays farmers for sold carbon credits, with sign-off.
- **🔒 Verifier Gate:** a `payouts` row may only exist/show for a `carbon_credit_batches` row with `status='Sold'` (which required external Verifier approval upstream: Verify → batch Issued → Sold). Business/Finance can never approve MRV or create payouts for unsold/unapproved batches.
- **Components:** payout queue (farmer, amount, status); batch context drawer (`vintage_year`, `total_tco2e`, linked `credit_transactions`); transfer+sign-off (upload transfer slip → mark Paid + sign / Reject+reason).
- **Tables:** `payouts` [PROPOSED], `carbon_credit_batches`, `credit_transactions`, `files`, `users`.
- **API:** `GET /api/business/payouts?status=Pending`; `POST /api/business/payouts/:id/pay` (`{slipFileId}`); `POST /api/business/payouts/:id/reject` (`{reason}`).
- **Logic:** payout `amount_thb` derived from the sale (`credit_transactions.total_amount_thb`, minus platform terms if any). Pay → §4.5 sign-off → `status='Paid'` + notify farmer. **Bank number is mock UI only; never persisted.**
- **Validation:** block pay if source `batch.status != 'Sold'`; reject requires reason; only Finance/Master.
- **DoD:** [ ] only Sold-batch payouts visible [ ] pay records slip + `verified_by_admin_id`+`signed_at` [ ] farmer notified [ ] no bank field stored.
- **Prototype:** manual external bank transfer; slip uploaded as proof.

### P05 · Banner & Announcement Management
- **Route:** `/business/banners` · **Permission:** `banner:manage`
- **Purpose:** manage in-app banners for farmers.
- **Components:** list + thumbnail + status + drag-to-order; create/edit form (image upload, text, link, start/end, target tier); mobile live preview.
- **Tables:** `banners` [PROPOSED], `files`.
- **API:** `GET/POST /api/business/banners`; `PATCH/DELETE /api/business/banners/:id`; `POST /api/business/banners/:id/publish`.
- **Logic:** status auto-derives from `start_at`/`end_at` (Scheduled→Published→Expired) via query/cron; `priority` controls order.
- **DoD:** [ ] CRUD + image upload to `files` [ ] schedule auto show/hide [ ] tier targeting [ ] preview matches app.
- **Prototype:** marketing banners only; system-critical announcements remain Admin's.

### P06 · Lead & Partnership CRM
- **Route:** `/business/crm` · **Permission:** `lead:read` / `lead:manage`
- **Purpose:** track investor/partner leads as a pipeline.
- **Components:** Kanban (New→Contacted→Qualified→Won/Lost, drag to change); lead card (name/org, source, interest, assignee); detail drawer with `lead_activities` follow-up log; filters.
- **Tables:** `leads` [PROPOSED], `lead_activities` [PROPOSED], `admins`.
- **API:** `GET/POST /api/business/leads`; `PATCH /api/business/leads/:id`; `POST /api/business/leads/:id/activities`.
- **DoD:** [ ] kanban drag updates status + audit [ ] assign to admin [ ] activity log append-only.
- **Prototype:** website form may be imported manually (CSV/Sheet) before a webhook exists.

### P07 · Campaign & Referral / Promo
- **Route:** `/business/campaigns` · **Permission:** `campaign:manage`
- **Purpose:** manage promotions, referral and promo codes.
- **Components:** referral stats (group by `users.referral_code`); promo code CRUD (discount, expiry, quota); campaign tracking (signups, conversion, ROI).
- **Tables:** `campaigns` [PROPOSED], `promo_codes` [PROPOSED], `users` (`referral_code`).
- **API:** `GET/POST /api/business/campaigns`; `GET/POST /api/business/promo-codes`; `PATCH /api/business/promo-codes/:id`.
- **Logic:** if discount > policy cap, set `needs_master_approval=true` and block activation until a `BusinessMaster` approves.
- **DoD:** [ ] referral counts correct [ ] promo validity enforced [ ] over-cap requires master approval.

### P08 · IoT HaaS Rental Management
- **Route:** `/business/iot` · **Permission:** `iot:read` / `iot:manage`
- **Purpose:** manage IoT device inventory + rental cycles.
- **Components:** inventory grid (serial, status, current renter, farm); rental detail (monthly fee ~฿2,700, deposit, dates, free-tier link for Gold/Platinum); risk panel (damage reason).
- **Tables:** `iot_devices` [PROPOSED], `iot_rentals` [PROPOSED], `users`, `farms`.
- **API:** `GET/POST /api/business/iot/devices`; `GET/POST /api/business/iot/rentals`; `PATCH /api/business/iot/rentals/:id`.
- **Logic:** System Defect → free swap (no charge); Human Error → forfeit deposit + repair fee (record in `damage_reason`); free units come from package `iot_free_units`.
- **DoD:** [ ] device status lifecycle [ ] rental linked to user/farm [ ] damage handling recorded.
- **Prototype:** simple inventory + status tracking; no real-time telemetry.

### P09 · Customer Support / Ticketing
- **Route:** `/business/support` · **Permission:** `support:read` / `support:manage`
- **Purpose:** receive, track, escalate customer issues.
- **Components:** ticket list (status, category, assignee); ticket detail thread; escalation button; LINE OA deep link.
- **Tables:** `support_tickets` [PROPOSED, optional], `users`.
- **API:** `GET/POST /api/business/support/tickets`; `PATCH /api/business/support/tickets/:id`.
- **DoD:** [ ] create/assign/resolve [ ] escalate sets `escalated_to` [ ] LINE link opens.
- **Prototype:** LINE OA is primary; this page may be a lightweight log first.

### P10 · Customer Directory (Customer 360°)
- **Route:** `/business/customers` · **Permission:** `customer:read` (+`customer:read_pii` to see contact fields)
- **Purpose:** unified per-customer view for service/sales.
- **Components:** search (name/phone/email); header (full_name, phone, email, current tier, account_status); tabs — Farms (read-only, no deep GIS), Carbon (sum totals + estimated value), History (payments, payouts, tickets, rentals).
- **Tables:** `users` [PROPOSED +PII], `farms`, `assessment_sessions`, `subscriptions` [PROPOSED], `payment_slips` [PROPOSED], `payouts` [PROPOSED], `support_tickets` [PROPOSED].
- **API:** `GET /api/business/customers?q=`; `GET /api/business/customers/:id`.
- **Logic:** contact fields (`full_name/phone/email`) returned only if caller has `customer:read_pii`; otherwise masked. **Never** expose national id / KYC photos / bank info (none exist in DB).
- **DoD:** [ ] search by Minimal-PII [ ] PII gated by permission [ ] tabs read-only [ ] no forbidden PII surfaced.
- **⚠️ Depends on §2.2 (users Minimal-PII ALTER). Until migrated, contact fields are null.**

### P11 · Business Audit Log
- **Route:** `/business/audit` · **Permission:** `audit:read` (BusinessMaster only)
- **Purpose:** read-only history of business staff actions.
- **Components:** log grid (actor, action, table, record, time); old↔new diff viewer; filters (actor, action, date).
- **Tables:** `audit_logs` (existing), `admins`.
- **API:** `GET /api/business/audit?actor&action&from&to`.
- **DoD:** [ ] read-only (no mutate route) [ ] diff renders [ ] filters work.

### P12 · Account / Settings
- **Route:** `/business/settings` · **Permission:** any business role (self only)
- **Purpose:** manage own account.
- **Components:** profile (username, role read-only, change password); security (revoke all `refresh_tokens`, recent logins); notification prefs (new slip / new ticket).
- **Tables:** `admins`, `refresh_tokens`.
- **API:** `PATCH /api/business/me`; `POST /api/business/me/change-password`; `POST /api/business/me/logout-all`.
- **DoD:** [ ] change password (bcrypt) [ ] logout-all revokes tokens [ ] self-scope enforced.

### P13 · Flowder Management  ·  🔮 PHASE 2 / FUTURE (schema reserved, no Prototype UI)
- **Route:** `/business/flowder` · **Permission:** `flowder:manage` (BusinessMaster), `flowder:read` (Sales view)
- **Status:** **Do NOT build UI in the Prototype.** Tables in §2.3.1 + `assessment_sessions` columns in §2.3.2 should be reserved in the ERD v4 migration now; the workflow below is a Phase-2 target so the schema doesn't have to change later.
- **Purpose:** issue/suspend Flowder certifications and let the platform create local data-collection jobs.
- **Components (Phase 2):** Flowder roster (user, certificate_no, status, expiry); issue/renew/suspend/revoke certification form (Revoke requires reason); per-Flowder assignment list (which farms, validity); activity overview (sessions collected, anomaly flags).
- **Tables:** `flowder_certifications` [PROPOSED · P2], `flowder_assignments` [PROPOSED · P2], `users`, `farms`, `assessment_sessions` (`collected_by_user_id`).
- **API (Phase 2):** `GET/POST /api/business/flowder/certifications`; `PATCH /api/business/flowder/certifications/:id` (suspend/revoke); `GET /api/business/flowder/assignments`.
- **Logic (Phase 2 — MRV trust):** a Flowder may collect a farm **only if** they have an `Active` certification **AND** an `Active` `flowder_assignments` row for that farm within `valid_from..valid_until`. The mobile Snap flow must check this before allowing capture, and stamp `assessment_sessions.collected_by_user_id` + `flowder_assignment_id`.
- **Open questions to resolve before Phase 2 build:** accountability if a Flowder commits fraud (owner vs Flowder liability); whether Verifier treats agent-collected data differently from self-collected; whether wages flow through the platform (currently OUT of scope — reserved `flowder_assignments.payout_terms`).
- **DoD (Phase 2):** [ ] issue/suspend/revoke certification + audit [ ] assignment gate enforced in Snap [ ] every session records collector + assignment.

> **FEATURE 1 note — `device_limit` (build this round, no dedicated page):** enforcement happens in the **shared device-registration / login flow** (mobile app + `devices` table), not in a Business Dashboard page. The Business Dashboard only *displays* `device_limit` per tier on P02. Rule: when a user registers an Nth active device, block if N > their active `subscriptions.package.device_limit` and prompt to upgrade. The Business Dashboard side is therefore just the catalog field + P02 display; the runtime check belongs to the existing auth/device module.

---

## 6. Key business rules (consolidated)

| Rule | Enforcement |
|------|-------------|
| No payment gateway | All money via slip + manual verify; no gateway code |
| No bank number in DB | No bank columns anywhere; mock UI only, never persisted |
| Money sign-off | `verified_by_admin_id` + `signed_at` required on Approve/Pay |
| Verifier gate (payout) | `payouts` only for `carbon_credit_batches.status='Sold'` |
| Quota enforcement | SUM(`farms.calculated_area_rai`) ≤ `subscriptions.quota_rai` |
| **Device limit (Feature 1)** | active devices per user ≤ tier `device_limit` (Free 2 / Prem 5 / Gold 10 / Plat 25); enforced at device registration |
| **Flowder gate (Phase 2)** | Flowder may collect a farm only with Active certification AND Active assignment for that farm |
| **Collector recorded (Phase 2)** | every `assessment_sessions` stamps `collected_by_user_id` (+ `flowder_assignment_id` if agent) |
| Separation of duties | Sales ≠ payment approver; business roles lack `mrv:approve`/`kyc:edit`/`price:edit` |
| Reject needs reason | Every reject writes a non-empty `*_reason` |
| Soft delete | `WHERE deleted_at IS NULL` on every read |
| Audit everything | create/update/approve/reject → `audit_logs` |
| PII scope | Only full_name/phone/email; gated by `customer:read_pii` |

---

## 7. Suggested build order

1. **Migrations** — §2 (extend roles enum, users Minimal-PII ALTER, all PROPOSED tables + indexes incl. Phase-2 Flowder tables + `assessment_sessions` columns as reserved schema), seed `packages` (with `device_limit` 2/5/10/25).
2. **Auth + RBAC** — §3 guard, Portal switcher (P00), business `layout.tsx` shell.
3. **Money core (highest business value)** — P03 Payment (in), P04 Payout (out), with §4.5 sign-off + §4.6 audit.
4. **Commerce** — P02 Packages (display `device_limit`), P01 Overview. Wire **Feature 1** `device_limit` check into the existing device-registration flow.
5. **Growth/ops** — P05 Banners, P06 CRM, P07 Campaigns, P08 IoT.
6. **Service + meta** — P09 Support, P10 Customers, P11 Audit, P12 Settings.
7. **Phase 2 (after Mentor demo) — DO NOT build now** — P13 Flowder Management (certifications + assignments + Snap gating). Schema is already reserved in step 1, so this adds no migration churn to live tables.

> When in doubt, prefer correctness of the money + Verifier-gate + no-PII rules over feature completeness. Those are the trust guarantees of the platform.
