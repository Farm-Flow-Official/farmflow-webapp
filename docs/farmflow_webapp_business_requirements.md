# FarmFlow Business Requirements
> **Version 1** — Business Dashboard & Verification Portal  
> **Author:** นาย วัยวัฒน์ อภิรักษ์ทานนท์

---

## Project Vision

FarmFlow is a Thai Carbon FinTech platform that connects smallholder farmers to the global carbon credit market. The platform leverages **AI and Computer Vision** to analyze farmland, estimate carbon sequestration, and monitor crop growth — all transparently through the FarmFlow app with a real-time **User Dashboard**.

The system is powered by the **Digital MRV (Measurement, Reporting, and Verification)** standard to produce verifiable, internationally credible datasets. UX is guided by the **3S principle (Snap, Sync, Sustain)** to make complex technology accessible to farmers.

**Core problems FarmFlow solves:**
- Lack of data transparency
- Slow and expensive verification processes
- Unequal access to the green economy for Thai farmers

---

## Part 2: Business Dashboard & Verification Portal

**Platform:** Web Application (Desktop / Tablet primary)  
**Purpose:** Back-office system for internal admins and independent verifiers — a central hub for Digital MRV data validation, user management, and carbon pricing governance.

---

## 2.1 Domain Architecture & Access Control

The system enforces **Data Isolation & Security** by strictly separating internal team operations from external verifier access via subdomains:

| Subdomain | Purpose |
|-----------|---------|
| `dashboard.farmflow.[domain]` | Internal Admin Dashboard |
| `portal.farmflow.[domain]` | Landing Portal (user routing; scalable for future expansion) |
| `verifier.farmflow.[domain]` | External Verifier Portal |

---

## 2.2 User Roles & Capabilities

### Role A: FarmFlow Admin (Internal)

The system uses **Granular RBAC** across 4 admin levels to prevent conflicts of interest and maintain data integrity.

---

#### 1. Master Admin
**Responsibilities:** Platform-wide oversight, permission structure, economic mechanisms.

**Permissions:**
- Full access to all systems
- Manage announcement banners / news
- Configure system-level variables (specifically `market_price_thb`)
- Suspend, delete, or manage permissions of lower-level admins (excluding self)
- Access Admin Audit Log (all admin activity)

**Restrictions:**
- ❌ Cannot approve carbon credit MRV results on behalf of independent verifiers

> **Prototype Note:** Carbon sequestration equations (`SPECIES_EQUATIONS`) are **hardcoded in the database** — no UI required, to reduce development time.

---

#### 2. Verify Admin
**Responsibilities:** Identity (KYC) and land title document verification.

**Permissions:**
- Review ID card photo (`id_card_front_url`) vs. selfie (`face_photo_url`)
- Verify farm land title (`ownership_proof_url`)
- Approve or reject KYC; must fill in `kyc_rejection_reason` on rejection
- Resolve land overlap disputes (**Overlap Validation**) via GIS system

> **Prototype Note:** KYC/E-KYC is **not yet implemented**. When a farmer registers successfully, the system **auto-bypasses** `account_status` to `Active` to allow immediate access to carbon assessment features (Snap) for testing.

---

#### 3. Financial Admin
**Responsibilities:** Withdrawal requests and accounting data management.

**Permissions:**
- Access basic user info
- Review bank account data (`USER_BANK_ACCOUNTS`): account name, account number
- Approve or reject payout transfers based on total carbon amount (`total_carbon_kgco2e`)

> **Prototype Note:** Use **manual bank transfers** + upload slip image to change status to `Paid`. No bank API Gateway integration required yet.

---

#### 4. General Admin
**Responsibilities:** Basic farmer support (Customer Support).

**Permissions:**
- Access basic user info
- Manage complaints / support tickets
- Escalate issues to relevant admin teams
- Manage announcement banners / news

> **Prototype Note:** Complaint handling (Ticketing) uses **LINE OA** as the primary channel to reduce web app development overhead.

---

### Role B: Verifier / Auditor (External — e.g., VGREEN)
**Responsibilities:** Validate forest condition data (Digital MRV) against scientific standards.

**Permissions:**
- Access deep farm data (GIS)
- View tree photos with satellite coordinates (`capture_lat`, `capture_lng`)
- View AI confidence scores (`ai_confidence_score`)
- **Verify & Approve** (certify result) or **Reject Batch** (reject with stated reason)

**Restrictions:**
- ❌ Cannot edit farmer personal information
- ❌ Cannot adjust carbon credit pricing
- ❌ Cannot delete or modify Audit Log history

---

## 2.3 Core System Workflows

### Workflow 1: KYC & Identity Verification

**UI:** Data Grid showing farmers with `account_status = Pending_KYC`

**Actions:**

| Action | Behavior |
|--------|----------|
| **Approve** | Sets account status → `Active`; triggers push notification to farmer |
| **Reject** | Forces admin to fill `kyc_rejection_reason`; sends push notification with specific correction instructions (e.g., blurry photo, not the actual person) |

> **Prototype Note:** This workflow screen is **skipped** — system auto-bypasses to `Active` status (see Verify Admin note above).

---

### Workflow 2: Global Farm Map & GIS Validation

**UI:** Interactive Map connected to PostGIS database, displaying all `farm_polygon_geojson` records.

**Overlap Validation Logic (Anti-Greenwashing):**
- System auto-calculates polygon overlap
- If overlap exceeds threshold (e.g., **15%**):
  - Area is highlighted **red** (Flagged Area) automatically
  - `overlap_validation_flag` is set
  - Verify Admin is alerted to review land title documents for both farms
  - Prevents duplicate carbon credit claims on the same land

---

### Workflow 3: Anomaly Detection & Smart Sorting (for Verifiers)

**Purpose:** Reduce the burden of reviewing massive datasets.

**Logic:**
- System pulls data from `TREE_SNAPSHOTS`
- Filters and surfaces farms or trees with **abnormal or low `ai_confidence_score`** as alerts

**Cross-check Logic:**
- Verifiers can deep-inspect images with conflicting metadata — e.g., inconsistencies between `weather_condition` and GPS coordinates vs. timestamp

---

### Workflow 4: Batch Verification & PDF Export

**Action:** Verifier can **bulk approve (Batch Processing)** all farms meeting verification criteria.

**PDF Export Engine** — generated report per farm includes:

| Field | Description |
|-------|-------------|
| Farmer name & contact | Full name, phone number |
| Farm location | Address, satellite imagery, Lat/Long |
| Carbon sequestration history | Records with timestamps |
| AI confidence score | `ai_confidence_score` value |
| Carbon value | `total_carbon_kgco2e` (kg unit) |
| Verifier signature | Full name of approving verifier (E-Document) |

**Public Trust & Integrity:**
- Every PDF contains an embedded **QR Code** linking to a URL with the `session_id`
- External users can scan to verify: *"This document ID exists in the FarmFlow system (Valid Document)"*
- **No PII is exposed** in the public verification endpoint

---

### Workflow 5: Dispute & Rejection Logic

**Trigger:** Verifier detects anomaly and initiates a rejection.

**System Constraint:**
- ❌ Rejection is **blocked** unless `ai_rejection_reason` is filled in
- Reason is sent to the farmer so they can:
  - Correct the specific issue
  - Re-survey only the problematic area
  - **No need to restart the entire submission**

---

### Workflow 6: Payout & Financial Workflow

**UI:** Data Grid displaying farmer withdrawal requests.
- Shows **Estimated Value** (calculated from `total_carbon_kgco2e`)
- Paired with bank account info from `USER_BANK_ACCOUNTS`

**Actions:**

| Action | Steps | Outcome |
|--------|-------|---------|
| **Approve** | Financial Admin transfers via external banking app → uploads transfer slip image to system | Status → `Paid`; farmer notified |
| **Reject** | Admin must enter rejection reason (e.g., "Account number incorrect, please update info") | Farmer notified with reason |

---

## Key Database Fields Reference

| Field | Description |
|-------|-------------|
| `account_status` | Farmer account status: `Pending_KYC` / `Active` |
| `kyc_rejection_reason` | Reason for KYC rejection (required on reject) |
| `id_card_front_url` | URL of uploaded ID card front photo |
| `face_photo_url` | URL of selfie photo for KYC comparison |
| `ownership_proof_url` | URL of farm land title document |
| `farm_polygon_geojson` | GeoJSON polygon of farm boundary |
| `overlap_validation_flag` | Flag set when farm polygon overlap exceeds threshold |
| `capture_lat` / `capture_lng` | GPS coordinates of tree photo capture |
| `ai_confidence_score` | AI model confidence score for tree/carbon assessment |
| `ai_rejection_reason` | Verifier-provided reason for rejecting a batch |
| `total_carbon_kgco2e` | Total estimated carbon sequestration in kg CO₂ equivalent |
| `market_price_thb` | Carbon credit market price in Thai Baht (set by Master Admin) |
| `SPECIES_EQUATIONS` | Carbon calculation equations per tree species (hardcoded in DB) |
| `USER_BANK_ACCOUNTS` | Farmer bank account records for payout |
| `session_id` | Unique ID embedded in PDF QR codes for document verification |

---

## Prototype Scope Summary

| Feature | Prototype Behavior |
|---------|-------------------|
| KYC / E-KYC | **Bypassed** — auto-set `account_status = Active` on registration |
| `SPECIES_EQUATIONS` | **Hardcoded** in DB — no UI needed |
| Payout processing | **Manual** bank transfer + slip upload — no API Gateway |
| Complaint ticketing | Via **LINE OA** — no in-app ticket system |
| KYC workflow screen | **Skipped** in UI development |
| Public document verification | QR Code → validates `session_id` existence only (no PII) |
