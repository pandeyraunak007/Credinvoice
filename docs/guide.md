# CredInvoice - Technical Guide

## Overview

CredInvoice is a Supply Chain Finance platform connecting MSME Sellers, Large Enterprise Buyers, and Financiers (Banks/NBFCs) to enable invoice-based financing solutions.

---

## Platform Vision

> "To become India's leading Supply Chain Finance platform, enabling seamless capital flow between enterprises, suppliers, and financial institutions, empowering 1 million MSMEs with instant access to working capital by 2028."

---

## Problem Statement

The Indian supply chain faces critical challenges:
- MSMEs suffer from 60-120 day payment cycles causing cash flow stress
- Buyers lack tools to optimize working capital through early payment discounts
- Financiers have limited access to verified, low-risk invoice financing opportunities
- This results in a **$300B+ credit gap** in the MSME sector

---

## Solution: Three Product Workflows

### 1. Dynamic Discounting (Self-Funded)

**Initiator:** Buyer (Large Enterprise)
**Funding Source:** Buyer's Own Funds (Treasury)
**Value:** Buyer offers early payment discount, Seller receives funds early

```
┌─────────────────────────────────────────────────────────────────┐
│              DYNAMIC DISCOUNTING WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BUYER                                    SELLER                │
│                                                                 │
│  ┌─────────────────┐                                           │
│  │ 1. Upload       │                                           │
│  │    Invoice      │◄─── AI Extraction auto-populates          │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ 2. Set Discount │                                           │
│  │    % & Terms    │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           │  ──── Notification ────►  ┌─────────────────┐      │
│           │                           │ 3. Review Offer │      │
│           │                           └────────┬────────┘      │
│           │                                    │               │
│           │                           ┌────────▼────────┐      │
│           │  ◄─── Accept/Reject ────  │ 4. Accept/Reject│      │
│           │                           └─────────────────┘      │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ 5. Authorize    │                                           │
│  │    Payment      │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                           ┌─────────────────┐      │
│  ┌─────────────────┐                  │ 6. Receive      │      │
│  │ Funds Disbursed │ ─── Transfer ──► │    Early Payment│      │
│  └─────────────────┘                  └─────────────────┘      │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  TRANSACTION COMPLETE - Invoice marked as PAID                  │
└─────────────────────────────────────────────────────────────────┘
```

**Example Calculation:**
```
Invoice Amount:     ₹10,00,000
Original Due Date:  60 days from invoice date
Early Payment Date: 15 days (45 days early)
Discount Rate:      2%
Discount Amount:    ₹20,000
Payment to Seller:  ₹9,80,000
```

---

### 2. Dynamic Discounting + Early Payment (Financier-Funded)

**Initiator:** Buyer (Large Enterprise)
**Funding Source:** Financier (Bank/NBFC)
**Value:** Seller gets early payment from Financier, Buyer pays on original due date

```
┌─────────────────────────────────────────────────────────────────┐
│         DD + EARLY PAYMENT WORKFLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BUYER              SELLER              FINANCIERS              │
│                                                                 │
│  ┌──────────┐                                                   │
│  │ 1.Upload │                                                   │
│  │  Invoice │                                                   │
│  └────┬─────┘                                                   │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────┐                                                   │
│  │ 2.Apply  │                                                   │
│  │ Discount │                                                   │
│  └────┬─────┘                                                   │
│       │                                                         │
│       │  ── Notify ──►  ┌──────────┐                           │
│       │                 │ 3.Accept │                           │
│       │  ◄── Accept ──  └────┬─────┘                           │
│       │                      │                                  │
│       ▼                      │                                  │
│  ┌──────────┐                │                                  │
│  │ 4.Choose │                │                                  │
│  │FINANCIER │                │                                  │
│  │ Funding  │                │                                  │
│  └────┬─────┘                │                                  │
│       │                      │                                  │
│       │  ─── For Bidding ────┼──────►  ┌──────────┐            │
│       │                      │         │ 5.Place  │            │
│       │                      │         │   BIDS   │            │
│       │  ◄── Multiple Bids ──┼───────  └──────────┘            │
│       │                      │                                  │
│       ▼                      │                                  │
│  ┌──────────┐                │                                  │
│  │ 6.Select │                │                                  │
│  │LOWEST BID│                │                                  │
│  └────┬─────┘                │                                  │
│       │                      │         ┌──────────┐            │
│       │  ─── Bid Accepted ───┼───────► │7.Disburse│            │
│       │                      │         │  Funds   │            │
│       │                ┌─────┴─────┐   └────┬─────┘            │
│       │                │ 8.Receive │ ◄──────┘                  │
│       │                │  Payment  │                           │
│       │                └───────────┘                           │
│       │                                                         │
│  ═════╪═════════════════════════════════════════════════════   │
│       │         ON ORIGINAL DUE DATE                            │
│       ▼                                                         │
│  ┌──────────┐                          ┌──────────┐            │
│  │ 9.Pay    │ ─── Repayment ─────────► │Financier │            │
│  │Financier │                          │ Receives │            │
│  └──────────┘                          └──────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Financial Flow Example:**
```
Invoice Amount:         ₹10,00,000
Original Due Date:      60 days
Seller Discount Agreed: 2%

FINANCIER BIDS:
├── Financier A: 1.8%
├── Financier B: 2.0%
└── Financier C: 1.5%  ◄── SELECTED (Lowest)

PAYMENT FLOWS:
Day 5:  Financier C pays Seller ₹9,85,000
Day 60: Buyer pays Financier C ₹10,00,000

NET RESULT:
├── Seller: Receives ₹9,85,000 on Day 5
├── Buyer:  No early cash outflow
└── Financier C: Earns ₹15,000 (1.5%)
```

---

### 3. GST-Backed Invoice Financing

**Initiator:** Seller, Buyer, or Any Company
**Funding Source:** Financier (Bank/NBFC)
**Value:** Invoice financing with risk-based haircut

```
┌─────────────────────────────────────────────────────────────────┐
│              GST-BACKED INVOICE FINANCING                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  COMPANY (Seller/Buyer/Any)           FINANCIERS                │
│                                                                 │
│  ┌───────────────┐                                              │
│  │ 1. Upload     │                                              │
│  │    Invoice    │◄─── AI + GST Validation                      │
│  └───────┬───────┘                                              │
│          │                                                      │
│          │  ─── For Early Payment ───►  ┌──────────────┐       │
│          │                              │ 2. Review    │       │
│          │                              │    Invoice   │       │
│          │                              └──────┬───────┘       │
│          │                                     │               │
│          │                              ┌──────▼───────┐       │
│          │                              │ 3. Place BID │       │
│          │                              │  with HAIRCUT│       │
│          │  ◄─── Multiple Bids ───────  └──────────────┘       │
│          │                                                      │
│          ▼                                                      │
│  ┌───────────────┐                                              │
│  │ 4. Select     │                                              │
│  │    BEST BID   │                                              │
│  └───────┬───────┘                                              │
│          │                                                      │
│          │  ─── Accept Bid ───────────►  ┌──────────────┐      │
│          │                               │ 5. Disburse  │      │
│          │                               │    Funds     │      │
│  ┌───────┴───────┐                       └──────┬───────┘      │
│  │ 6. Receive    │◄───────── Payment ───────────┘              │
│  │    Funds      │                                              │
│  └───────────────┘                                              │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│          │         ON ORIGINAL DUE DATE                         │
│          ▼                                                      │
│  ┌───────────────┐                       ┌──────────────┐      │
│  │ 7. Repay      │ ─── Full Amount ────► │  Financier   │      │
│  │    Financier  │                       │  Receives    │      │
│  └───────────────┘                       └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

**What is a Haircut?**
A risk-based discount applied by financiers. E.g., 10% haircut on ₹10L = Financier funds ₹9L.

---

## User Roles

### 1. Buyer (Large Enterprise / Anchor)

**Persona:** Amit Verma, CFO at TechCorp India (Annual Procurement: ₹500 Cr)

**Pain Points:**
- Manual invoice processing
- Inability to leverage early payment for discounts
- Supplier relationship challenges

**Platform Capabilities:**
- Upload invoices (AI extraction)
- Set dynamic discount offers
- Choose funding source (Self or Financier)
- View and select financier bids
- Authorize payments

---

### 2. Seller (MSME / Supplier)

**Persona:** Rajesh Kumar, Owner of Kumar Textiles (Annual Revenue: ₹5 Cr)

**Pain Points:**
- 60-90 day payment cycles
- Cash flow stress
- High cost of informal credit

**Platform Capabilities:**
- Receive discount offers from buyers
- Accept/reject proposals
- Upload invoices for GST-backed financing
- View and accept financier bids
- Track disbursements

---

### 3. Financier (Bank / NBFC)

**Persona:** Priya Sharma, Credit Manager at Urban Finance Ltd

**Pain Points:**
- Limited deal flow
- Manual underwriting
- NPA risk

**Platform Capabilities:**
- Browse available invoices
- Submit competitive bids
- Review buyer/seller KYC
- Disburse funds
- Track portfolio and repayments

---

### 4. Admin (Platform Operations)

**Responsibilities:**
- User management
- KYC review and approval
- Invoice validation
- Dispute resolution
- System configuration
- Compliance monitoring

---

## Role Permission Matrix

| Capability | Buyer | Seller | Financier | Admin |
|------------|-------|--------|-----------|-------|
| Upload Invoice | Yes | Yes* | No | Yes |
| Set Discount | Yes | No | No | No |
| Accept/Reject Discount | No | Yes | No | No |
| Place Bid | No | No | Yes | No |
| Select Winning Bid | Yes** | Yes*** | No | Override |
| Authorize Payment | Yes | No | No | Override |
| Disburse Funds | Self-fund | No | Yes | Monitor |
| KYC Approval | No | No | No | Yes |

*For GST-Backed Financing | **For DD+Early Payment | ***For GST-Backed

---

## Technology Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20 LTS | Lightweight, efficient |
| **Framework** | Express.js + TypeScript | Low memory footprint |
| **ORM** | Prisma | Type-safe database access |
| **Database** | SQLite (dev) → PostgreSQL (prod) | Flexible deployment |
| **Cache** | node-cache | In-memory caching |
| **File Storage** | Local → Oracle Object Storage | Document storage |
| **Auth** | JWT (access + refresh) | Stateless authentication |
| **AI** | Mock → GPT-4 Vision | Invoice extraction |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREDINVOICE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Buyer   │  │ Seller  │  │Financier│  │  Admin  │            │
│  │ Portal  │  │ Portal  │  │ Portal  │  │ Portal  │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       └────────────┴────────────┴────────────┘                 │
│                          │                                      │
│              ┌───────────▼───────────┐                         │
│              │     API GATEWAY       │                         │
│              │   (Express.js)        │                         │
│              └───────────┬───────────┘                         │
│                          │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   SERVICE MODULES                         │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│  │  │  Auth   │ │ Invoice │ │ Bidding │ │ Payment │        │  │
│  │  │ Service │ │ Service │ │ Service │ │ Service │        │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│  │  │   KYC   │ │ Profile │ │ Notif.  │ │  Admin  │        │  │
│  │  │ Service │ │ Service │ │ Service │ │ Service │        │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│              ┌───────────▼───────────┐                         │
│              │  AI INVOICE EXTRACTOR │                         │
│              │   (Mock / GPT-4)      │                         │
│              └───────────────────────┘                         │
│                          │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     DATA LAYER                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │ SQLite/  │  │  Cache   │  │  File    │               │  │
│  │  │PostgreSQL│  │(node-cache)│ │ Storage  │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Overview

### Core Entities

| Entity | Description |
|--------|-------------|
| `User` | Authentication & base user info |
| `Buyer` | Large enterprise profile |
| `Seller` | MSME/Supplier profile |
| `Financier` | Bank/NBFC profile |
| `Invoice` | Invoice records with status tracking |
| `DiscountOffer` | DD workflow offers |
| `Bid` | Financier bids on invoices |
| `Disbursement` | Fund transfer records |
| `Repayment` | Repayment tracking |
| `KycDocument` | KYC document uploads |
| `Notification` | User notifications |
| `AuditLog` | Activity audit trail |

### Invoice Status Flow

```
DRAFT
  │
  ▼
PENDING_ACCEPTANCE ──► REJECTED
  │
  ▼
ACCEPTED
  │
  ├──► (Self-Funded) ──► DISBURSED ──► SETTLED
  │
  ▼
OPEN_FOR_BIDDING
  │
  ▼
BID_SELECTED
  │
  ▼
DISBURSED
  │
  ▼
SETTLED
```

---

## API Structure

### Base URL
```
/api/v1
```

### Module Endpoints

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/auth` | Registration, login, tokens |
| Profile | `/profile` | User profile management |
| KYC | `/kyc` | Document upload & verification |
| Invoices | `/invoices` | Invoice CRUD & extraction |
| Discounts | `/discounts` | Dynamic discounting |
| Bids | `/bids` | Financier bidding |
| Disbursements | `/disbursements` | Fund transfers |
| Repayments | `/repayments` | Repayment tracking |
| Notifications | `/notifications` | User notifications |
| Admin | `/admin` | Admin operations |

---

## Deployment Target

### Oracle Cloud Free Tier

| Service | Usage | Limit |
|---------|-------|-------|
| Compute VM | Backend server | 2 VMs, 1GB RAM each |
| Object Storage | File storage | 10 GB |
| Autonomous DB | PostgreSQL (optional) | 20 GB |

### Memory Budget (1GB VM)
- Node.js backend: ~200-300 MB
- OS overhead: ~200 MB
- Buffer for spikes: ~500 MB

---

## Security Measures

| Component | Implementation |
|-----------|----------------|
| Authentication | JWT tokens (15-min access, 7-day refresh) |
| Password | bcrypt with 12 salt rounds |
| API Security | Helmet.js, CORS, rate limiting |
| Validation | Zod schema validation |
| RBAC | Role-based middleware |
| Audit | Full action logging |

---

## Phase 2 Roadmap (Future)

- GST/eInvoice API Integration
- TReDS Partnership
- Seller Financing with Recourse
- Auto-Bidding for Financiers
- Rule-Based Credit Scoring
- Analytics Dashboard
- Mobile Apps (iOS/Android)
