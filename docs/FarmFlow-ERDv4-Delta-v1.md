# FarmFlow — ERD v4 Delta (Minimal)

| | |
|---|---|
| **Version** | v1.0 |
| **Date** | 2026-06-12 |
| **Status** | Proposed — for the API/DB owner to review before migration |
| **Scope** | The **real** schema changes the Web App needs across **Admin · Verifier · Business** dashboards |
| **Companion to** | `FarmFlowApp-ERDiagram-v3.md` (current DB) · `BusinessDashboard-Requirement-v1.md` (intent) · `FarmFlow-API-Requirements-v1.0.md` (contracts) |

> **One DB, one API, one ERD.** This delta lands on the **existing shared Postgres** and is built as
> **new modules in the existing Bun/Elysia API** — not a separate backend. The `BusinessDashboard-Requirement-v1.md`
> spec is treated as **requirements/intent only**; where its AI-drafted DDL conflicts with the real ERD v3, **the real ERD wins** (see §5).

---

## 1. Key finding — ERD v3 is richer than the Business spec assumed

Before proposing anything, the real `apps/farmflow-api/src/db/schema/` was inspected. Three facts shrink the delta dramatically:

1. **RBAC is already normalized & data-driven.** `roles.role_name` is a **`varchar`, not an enum**, and there are dedicated `permissions` (with a unique `code`) and `role_permissions` (join) tables. → **New business roles and permissions are SEED DATA, not a schema migration.**
2. **Most Admin/Verifier needs already have tables:** `carbon_market_config` (market price), `audit_logs`, `admins`, `notifications`, `carbon_credit_batches` (status enum already includes `sold`), `credit_transactions` (`buyer_id`, `total_amount_thb`). → **Admin & Verifier need essentially no new tables.**
3. **IDs are `varchar` with the repo's own default** (not `uuid gen_random_uuid()`).

**Net effect:** the real delta is **1 ALTER + 3 new tables + seed data** — everything else the Business spec lists is **deferred** (new, isolated tables that are cheap to add later).

---

## 2. The delta

### A. ALTER existing — `users` Minimal-PII (1 migration)

```
ALTER TABLE users
  ADD COLUMN full_name varchar(255) NULL,   -- ชื่อ-นามสกุล
  ADD COLUMN phone     varchar(20)  NULL,   -- เบอร์โทร
  ADD COLUMN email     varchar(255) NULL;   -- อีเมล
```

- **Serves:** Admin Farmers (name/phone) · Verifier report (the report page already renders `ownerName`/`phone`) · Business Customer view.
- **Safe:** nullable + additive → no backfill, no impact on the mobile/producer flow.
- ❌ **Never** add `national_id`, KYC photos, or any bank field — policy. These three are the **only** PII columns allowed.

### B. New tables — Business commercial (3 migrations)

Follow the repo's Drizzle conventions: **`varchar` id + repo default**, snake_case columns, `timestamptz` for times, `numeric(p,s)` for money. No `uuid gen_random_uuid()`.

```
-- packages : tier catalog (seeded; no catalog-edit UI in prototype)
packages(
  id, code UNIQUE, name, price_thb numeric,
  quota_rai int, base_rai int, overage_price_per_rai numeric,
  iot_free_units int default 0, device_limit int default 2,   -- Feature 1
  features jsonb, is_active bool default true, sort_order int default 0,
  created_at, updated_at
)

-- subscriptions : a user's active package
subscriptions(
  id, user_id -> users, package_id -> packages,
  status varchar default 'Pending_Payment',   -- Pending_Payment|Active|Expired|Cancelled|Suspended
  quota_rai int, started_at, expiry_date, auto_renew bool default false,
  created_at, updated_at
)

-- payment_slips : INCOMING money (customer pays for a package) — slip + manual verify + sign-off
payment_slips(
  id, user_id -> users, package_id -> packages,
  subscription_id -> subscriptions NULL,        -- set on approve
  slip_file_id -> files,                         -- the slip image (PRIVATE)
  declared_amount_thb numeric,
  status varchar default 'Pending_Review',       -- Pending_Review|Approved|Rejected
  rejection_reason text,
  duplicate_flag bool default false,             -- set if files.checksum already seen
  verified_by_admin_id -> admins NULL,           -- Finance who signed off
  signed_at NULL,
  created_at
  -- ❌ no bank-account fields anywhere
)
```

Suggested indexes:
```
idx_subscriptions_user(user_id)
idx_subscriptions_status(status, expiry_date)
idx_payment_slips_status(status, created_at)
```

### C. Seed only — ❌ NOT a migration

Because RBAC is normalized, all roles/permissions are rows:

- **`roles`** — insert `BusinessMaster`, `Finance`, `Sales`, `Marketing`, `CustomerService` (+ `Verifier` / `Auditor` if not already seeded).
- **`permissions`** — insert `code` rows:
  `overview:read`, `package:read`, `package:manage`, `payment:read`, `payment:approve`,
  `payout:read`, `payout:approve`, `customer:read`, `customer:read_pii`, `audit:read`, `staff:manage`
  (add others — banner/lead/campaign/iot/support — only when those pages become real).
- **`role_permissions`** — link each role to its permission set (see Business spec §3.2).
- **`packages`** — seed 4 tiers: FREE (device_limit 2), PREMIUM ฿1,990 (5), GOLD ฿4,990 (10), PLATINUM ฿8,900 base 200 rai +฿40/rai (25).

> **Guardrail:** business roles must **never** get `mrv:approve`, `kyc:edit`, or `price:edit`. Those stay on Admin/Verifier.

### D. Deferred — mock in the UI now, build later (all safe additive tables)

Not in this delta. Each is a **new, isolated table** → adding later does not touch existing relationships, so deferral is low-risk:

- `payouts` (gated on a `Sold` batch; not in the "must be real" set)
- `banners`, `leads` + `lead_activities`, `campaigns` + `promo_codes`, `iot_devices` + `iot_rentals`, `support_tickets`
- **Flowder (Phase 2):** `flowder_certifications`, `flowder_assignments`, and the two `assessment_sessions` columns (`collected_by_user_id`, `flowder_assignment_id`). Reserve only when Phase 2 starts.

---

## 3. What each dashboard actually needs (traceability)

| Dashboard | Need | Source | Delta? |
|---|---|---|---|
| Admin | Farmers (name/phone) | `users` + **A** | ALTER A |
| Admin | Farms / GIS | `farms` (exists) | — |
| Admin | Market price (Settings) | `carbon_market_config` (exists) | — |
| Admin | Audit log | `audit_logs` (exists) | — |
| Admin | Admin users / roles | `admins`, `roles`, `permissions`, `role_permissions` (exist) | seed C |
| Verifier | Batches / results / snapshots | `carbon_credit_batches`, `assessment_results`, `tree_snapshots` (exist) | — |
| Verifier | Report (ownerName/phone) | `users` + **A** | ALTER A |
| Verifier | Verifier auth | `admins` + `Verifier` role | seed C |
| Business | Package control | **packages, subscriptions** | NEW B |
| Business | Slip approve/reject/verify | **payment_slips** | NEW B |
| Business | User/staff control | `users`(+A), `admins`, `roles`, `permissions` | ALTER A + seed C |

---

## 4. Migration / build order

1. **Migration 1** — `ALTER users` (Minimal-PII, nullable).
2. **Migration 2** — create `packages`, `subscriptions`, `payment_slips` + indexes.
3. **Seed** — business roles + permissions + `role_permissions`; seed `packages` (4 tiers).
4. **API modules** (in the Bun/Elysia API, cloned from the existing `farms` module pattern):
   `packages` (read) → `subscriptions` (read + PATCH upgrade/suspend) → `payment_slips` (list + approve/reject with sign-off + audit).
5. **Wire** the 3 Business "must-be-real" pages; connect Admin/Verifier to real endpoints gradually.

---

## 5. Conflicts with `BusinessDashboard-Requirement-v1.md` — use the real stack

The Business spec was AI-drafted before the real ERD was confirmed. Where they differ, **follow the column on the right:**

| Business spec says | Real stack (use this) |
|---|---|
| `roles.permissions jsonb` | `permissions` + `role_permissions` (normalized) |
| Next.js Route Handlers under `app/api/business/**` + direct DB | **New modules inside the existing Bun/Elysia API** |
| Response `{ ok, data, meta }` | `{ success, data, meta }` (existing `ok()` helper) |
| `uuid PRIMARY KEY DEFAULT gen_random_uuid()` | `varchar` id + the repo's existing default |
| `admin_status = 'Active'` | enum is lowercase `'active' | 'inactive'` |

The Business spec remains the **source of truth for requirements** (pages, RBAC matrix, business rules, DoD). Only its DDL/stack assumptions are superseded here.

---

## 6. Message for the API/DB owner

> ERD v4 delta is intentionally tiny: **`ALTER users` +3 nullable PII columns**, and **3 new tables** (`packages`, `subscriptions`, `payment_slips`). RBAC reuses the existing `permissions` / `role_permissions` tables — **seed only, no schema change**. **No other table is touched.** Migrations via the existing drizzle-kit flow; the Business modules will be added to the API following the existing `farms` module pattern.

---

*Companion docs: `BusinessDashboard-Requirement-v1.md` (requirements) · `FarmFlowApp-ERDiagram-v3.md` (current schema) · `FarmFlow-API-Requirements-v1.0.md` (contracts).*
