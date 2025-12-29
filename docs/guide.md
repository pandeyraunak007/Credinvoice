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

## Technology Architecture

### System Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend["Frontend Layer (React + Vite)"]
        BP[Buyer Portal]
        SP[Seller Portal]
        FP[Financier Portal]
        AP[Admin Portal]
    end

    subgraph API["API Gateway (Express.js)"]
        MW[Middleware Layer]
        RT[Route Handlers]
    end

    subgraph Services["Service Layer"]
        AS[Auth Service]
        IS[Invoice Service]
        PS[Profile Service]
        KS[KYC Service]
        BS[Bidding Service]
        DS[Disbursement Service]
        NS[Notification Service]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        FS[File Storage]
        CA[Cache Layer]
    end

    subgraph External["External Services"]
        AI[AI Extraction]
        GST[GST Verification]
        BANK[Bank APIs]
    end

    Frontend --> API
    API --> Services
    Services --> Data
    Services --> External

    MW --> RT
    AS --> PG
    IS --> PG
    IS --> AI
    PS --> PG
    KS --> PG
    KS --> FS
    BS --> PG
    DS --> BANK
```

### Component Communication Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend (React)
    participant V as Vite Proxy
    participant A as API Server (Express)
    participant M as Middleware
    participant S as Service Layer
    participant P as Prisma ORM
    participant D as PostgreSQL

    U->>F: User Action
    F->>V: API Request (/api/v1/*)
    V->>A: Proxy to Backend (localhost:3000)
    A->>M: Request Processing
    M->>M: Auth Validation (JWT)
    M->>M: Input Validation (Zod)
    M->>S: Call Service Method
    S->>P: Database Query
    P->>D: SQL Execution
    D-->>P: Result Set
    P-->>S: Typed Objects
    S-->>A: Response Data
    A-->>V: JSON Response
    V-->>F: API Response
    F-->>U: UI Update
```

---

## Tech Stack & Selection Rationale

### Frontend Stack

| Technology | Version | Why We Chose It |
|------------|---------|-----------------|
| **React** | 18.x | Industry standard, excellent ecosystem, component-based architecture ideal for complex multi-role dashboards |
| **Vite** | 5.x | Lightning-fast HMR (Hot Module Replacement), superior DX compared to CRA, native ES modules |
| **TailwindCSS** | 3.x | Utility-first approach enables rapid UI development, consistent design system, small bundle size with purging |
| **Lucide React** | Latest | Consistent, lightweight icon library with tree-shaking support |
| **React Router** | 6.x | Declarative routing, nested routes, excellent for role-based navigation |

### Backend Stack

| Technology | Version | Why We Chose It |
|------------|---------|-----------------|
| **Node.js** | 20 LTS | Event-driven, non-blocking I/O perfect for high-concurrency financial transactions |
| **Express.js** | 4.x | Minimal, flexible, battle-tested in production environments |
| **TypeScript** | 5.x | Type safety prevents runtime errors critical in financial applications |
| **Prisma** | 5.x | Type-safe ORM, excellent migrations, auto-generated types |
| **PostgreSQL** | 15+ | ACID compliance essential for financial data, JSON support, excellent performance |
| **JWT** | - | Stateless authentication, scalable across multiple instances |
| **Zod** | 3.x | Runtime type validation, TypeScript inference, excellent error messages |
| **bcryptjs** | - | Industry-standard password hashing with configurable work factor |

### Why This Stack?

```mermaid
mindmap
  root((Tech Stack))
    Frontend
      React
        Component Reusability
        Large Ecosystem
        Virtual DOM Performance
      Vite
        Fast Development
        Optimized Builds
        Native ESM
      TailwindCSS
        Rapid Prototyping
        Consistent Design
        Small Bundle
    Backend
      Node.js
        Event Loop
        npm Ecosystem
        JavaScript Everywhere
      Express
        Minimal Overhead
        Middleware Pattern
        Production Ready
      TypeScript
        Type Safety
        Better IDE Support
        Catch Errors Early
    Database
      PostgreSQL
        ACID Compliance
        JSON Support
        Relational Integrity
      Prisma
        Type Safety
        Migrations
        Query Builder
```

---

## User Flow Diagrams

### Authentication Flow

```mermaid
flowchart TD
    A[User Visits Platform] --> B{Has Account?}
    B -->|No| C[Register Page]
    B -->|Yes| D[Login Page]

    C --> E[Select User Type]
    E --> F[Enter Details]
    F --> G[Create Account]
    G --> H[Redirect to KYC]

    D --> I[Enter Credentials]
    I --> J{Valid?}
    J -->|No| K[Show Error]
    K --> I
    J -->|Yes| L{KYC Status?}

    L -->|Not Started| H
    L -->|Pending| M[KYC Status Page]
    L -->|Approved| N[Dashboard]

    H --> O[Business Details]
    O --> P[Bank Details]
    P --> Q[Document Upload]
    Q --> R[Submit KYC]
    R --> M
```

### Invoice Creation Flow (Buyer)

```mermaid
flowchart TD
    A[Buyer Dashboard] --> B[Create Invoice]
    B --> C{Select Entry Method}

    C -->|Manual Entry| D[Fill Invoice Form]
    C -->|AI Extraction| E[Upload Invoice PDF/Image]

    E --> F[AI Extracts Data]
    F --> G[Review & Edit Extracted Data]

    D --> H[Select Seller]
    G --> H

    H --> I{Seller Found?}
    I -->|No| J[Invite New Seller]
    I -->|Yes| K[Seller Selected]

    J --> L[Send Referral Email]
    L --> M[Wait for Seller KYC]

    K --> N[Enter Line Items]
    N --> O[Add Tax Details]
    O --> P[Upload Attachments]
    P --> Q[Review Summary]
    Q --> R{Action}

    R -->|Save Draft| S[Invoice Saved as Draft]
    R -->|Submit| T[Invoice Sent to Seller]
```

### Dynamic Discounting Flow

```mermaid
sequenceDiagram
    participant B as Buyer
    participant P as Platform
    participant S as Seller
    participant F as Financier

    B->>P: Upload Invoice
    P->>P: AI Extraction
    B->>P: Set Discount Terms (2%, 45 days early)
    P->>S: Notify: New Discount Offer

    S->>P: Review Offer
    alt Accept Offer
        S->>P: Accept Discount
        P->>B: Notify: Seller Accepted

        alt Self-Funded
            B->>P: Authorize Payment
            P->>S: Disburse Funds
            P->>P: Mark Invoice SETTLED
        else Financier-Funded
            P->>F: Post to Marketplace
            F->>P: Submit Bid (1.5%)
            B->>P: Select Best Bid
            P->>F: Notify: Bid Accepted
            F->>S: Disburse Funds
            Note over B,F: On Due Date
            B->>F: Repay Full Amount
            P->>P: Mark Invoice SETTLED
        end
    else Reject Offer
        S->>P: Reject Discount
        P->>B: Notify: Seller Rejected
    end
```

### KYC Approval Flow

```mermaid
flowchart TD
    A[User Submits KYC] --> B[Status: SUBMITTED]
    B --> C[Admin Reviews]

    C --> D{Documents Valid?}
    D -->|No| E[Request Additional Docs]
    E --> F[User Uploads More]
    F --> C

    D -->|Yes| G{Business Verified?}
    G -->|No| H[Reject KYC]
    H --> I[User Notified]

    G -->|Yes| J[Approve KYC]
    J --> K[Status: APPROVED]
    K --> L[User Gets Full Access]
```

---

## Solution: Three Product Workflows

### 1. Dynamic Discounting (Self-Funded)

```mermaid
flowchart LR
    subgraph Buyer
        A1[Upload Invoice] --> A2[Set Discount %]
        A2 --> A3[Send to Seller]
    end

    subgraph Seller
        B1[Receive Offer] --> B2{Accept?}
        B2 -->|Yes| B3[Accepted]
        B2 -->|No| B4[Rejected]
    end

    subgraph Payment
        C1[Buyer Authorizes] --> C2[Funds Transfer]
        C2 --> C3[Invoice Settled]
    end

    A3 --> B1
    B3 --> C1
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

### 2. Dynamic Discounting + Early Payment (Financier-Funded)

```mermaid
flowchart TD
    subgraph Phase1[Invoice Setup]
        A[Buyer Uploads Invoice] --> B[Sets Discount Terms]
        B --> C[Seller Accepts]
    end

    subgraph Phase2[Bidding]
        D[Posted to Marketplace] --> E[Financiers Review]
        E --> F[Submit Bids]
        F --> G[Buyer Selects Best Bid]
    end

    subgraph Phase3[Disbursement]
        H[Financier Disburses to Seller] --> I[Seller Receives Early Payment]
    end

    subgraph Phase4[Settlement]
        J[On Due Date] --> K[Buyer Pays Financier]
        K --> L[Invoice Settled]
    end

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
```

### 3. GST-Backed Invoice Financing

```mermaid
flowchart TD
    A[Company Uploads Invoice] --> B[GST Validation]
    B --> C[Posted for Financing]
    C --> D[Financiers Place Bids with Haircut]
    D --> E[Company Selects Best Bid]
    E --> F[Financier Disburses Funds]
    F --> G[Company Receives Capital]
    G --> H[On Due Date: Repay Financier]
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| BUYER : "has"
    USER ||--o| SELLER : "has"
    USER ||--o| FINANCIER : "has"

    BUYER ||--o{ INVOICE : "creates"
    SELLER ||--o{ INVOICE : "receives"

    INVOICE ||--o| DISCOUNT_OFFER : "has"
    INVOICE ||--o{ BID : "receives"

    FINANCIER ||--o{ BID : "places"

    BID ||--o| DISBURSEMENT : "triggers"
    DISBURSEMENT ||--o| REPAYMENT : "requires"

    USER ||--o{ KYC_DOCUMENT : "uploads"
    USER ||--o{ BANK_ACCOUNT : "owns"
    USER ||--o{ NOTIFICATION : "receives"

    USER {
        uuid id PK
        string email UK
        string password_hash
        enum user_type
        enum status
        timestamp created_at
    }

    INVOICE {
        uuid id PK
        string invoice_number
        date invoice_date
        date due_date
        decimal total_amount
        enum status
        uuid buyer_id FK
        uuid seller_id FK
    }

    BID {
        uuid id PK
        decimal discount_rate
        decimal amount
        enum status
        uuid invoice_id FK
        uuid financier_id FK
    }
```

### Invoice Status State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Create Invoice
    DRAFT --> PENDING_ACCEPTANCE: Submit to Seller
    PENDING_ACCEPTANCE --> REJECTED: Seller Rejects
    PENDING_ACCEPTANCE --> ACCEPTED: Seller Accepts

    ACCEPTED --> DISBURSED: Self-Funded Payment
    ACCEPTED --> OPEN_FOR_BIDDING: Request Financier Funding

    OPEN_FOR_BIDDING --> BID_SELECTED: Buyer Selects Bid
    BID_SELECTED --> DISBURSED: Financier Pays Seller

    DISBURSED --> SETTLED: Final Payment Complete

    REJECTED --> [*]
    SETTLED --> [*]
```

---

## API Architecture

### API Module Structure

```mermaid
flowchart TB
    subgraph Gateway["API Gateway (/api/v1)"]
        direction TB
        AUTH["/auth"]
        PROFILE["/profile"]
        KYC["/kyc"]
        INVOICES["/invoices"]
        BIDS["/bids"]
        ADMIN["/admin"]
    end

    subgraph Middleware
        CORS[CORS]
        HELMET[Security Headers]
        RATE[Rate Limiting]
        JWT_AUTH[JWT Validation]
        RBAC[Role-Based Access]
        VALIDATE[Input Validation]
    end

    Middleware --> Gateway
```

### Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant E as Express Server
    participant M as Middleware Stack
    participant H as Route Handler
    participant S as Service
    participant D as Database

    C->>E: HTTP Request
    E->>M: Process Middleware

    Note over M: 1. CORS Check
    Note over M: 2. Security Headers
    Note over M: 3. Rate Limiting
    Note over M: 4. JWT Validation
    Note over M: 5. Role Authorization
    Note over M: 6. Input Validation

    M->>H: Validated Request
    H->>S: Business Logic
    S->>D: Data Operations
    D-->>S: Results
    S-->>H: Processed Data
    H-->>E: Response Object
    E-->>C: JSON Response
```

---

## Component Communication

### Frontend-Backend Communication

```mermaid
flowchart LR
    subgraph Frontend["React Frontend :5173"]
        UI[UI Components]
        CTX[Auth Context]
        SVC[API Services]
    end

    subgraph Proxy["Vite Dev Proxy"]
        VP["/api/* → :3000"]
    end

    subgraph Backend["Express Backend :3000"]
        API[API Routes]
        MW[Middleware]
        CTRL[Controllers]
        SERV[Services]
    end

    subgraph Database["PostgreSQL :5432"]
        DB[(Tables)]
    end

    UI --> CTX
    CTX --> SVC
    SVC --> VP
    VP --> API
    API --> MW
    MW --> CTRL
    CTRL --> SERV
    SERV --> DB
```

### Service Layer Dependencies

```mermaid
flowchart TD
    subgraph Controllers
        AC[Auth Controller]
        IC[Invoice Controller]
        PC[Profile Controller]
        BC[Bid Controller]
        KC[KYC Controller]
    end

    subgraph Services
        AS[Auth Service]
        IS[Invoice Service]
        PS[Profile Service]
        BS[Bid Service]
        KS[KYC Service]
        NS[Notification Service]
    end

    subgraph DataAccess
        PR[Prisma Client]
        FS[File Storage]
    end

    AC --> AS
    IC --> IS
    IC --> NS
    PC --> PS
    BC --> BS
    BC --> NS
    KC --> KS
    KC --> FS

    AS --> PR
    IS --> PR
    PS --> PR
    BS --> PR
    KS --> PR
    NS --> PR
```

---

## User Roles & Permissions

### Role Permission Matrix

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
| View All Users | No | No | No | Yes |

*For GST-Backed Financing | **For DD+Early Payment | ***For GST-Backed

### Role-Based Navigation

```mermaid
flowchart TD
    A[Login] --> B{User Type}

    B -->|Buyer| C[Buyer Dashboard]
    C --> C1[My Invoices]
    C --> C2[Create Invoice]
    C --> C3[Review Bids]
    C --> C4[Payments]

    B -->|Seller| D[Seller Dashboard]
    D --> D1[Pending Approvals]
    D --> D2[My Invoices]
    D --> D3[Financing Requests]
    D --> D4[Disbursements]

    B -->|Financier| E[Financier Dashboard]
    E --> E1[Marketplace]
    E --> E2[My Bids]
    E --> E3[Portfolio]
    E --> E4[Collections]

    B -->|Admin| F[Admin Dashboard]
    F --> F1[KYC Queue]
    F --> F2[User Management]
    F --> F3[Invoice Oversight]
    F --> F4[System Config]
```

---

## Security Architecture

```mermaid
flowchart TD
    subgraph Security["Security Layers"]
        L1[HTTPS/TLS]
        L2[CORS Policy]
        L3[Rate Limiting]
        L4[JWT Authentication]
        L5[Role-Based Access]
        L6[Input Validation]
        L7[SQL Injection Prevention]
        L8[Audit Logging]
    end

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8
```

| Component | Implementation |
|-----------|----------------|
| Authentication | JWT tokens (15-min access, 7-day refresh) |
| Password | bcrypt with 12 salt rounds |
| API Security | Helmet.js, CORS, rate limiting |
| Validation | Zod schema validation |
| RBAC | Role-based middleware |
| Audit | Full action logging |

---

## Deployment Architecture

### Production Setup

```mermaid
flowchart TB
    subgraph Users
        U1[Buyers]
        U2[Sellers]
        U3[Financiers]
    end

    subgraph CDN["CDN (CloudFlare)"]
        CF[Static Assets]
    end

    subgraph Cloud["Oracle Cloud / AWS"]
        subgraph LB["Load Balancer"]
            NLB[Network LB]
        end

        subgraph Compute["Compute Instances"]
            VM1[Backend Node 1]
            VM2[Backend Node 2]
        end

        subgraph Database["Managed Database"]
            PG[(PostgreSQL)]
        end

        subgraph Storage["Object Storage"]
            S3[Documents/KYC Files]
        end
    end

    Users --> CDN
    Users --> LB
    CDN --> Users
    NLB --> VM1
    NLB --> VM2
    VM1 --> PG
    VM2 --> PG
    VM1 --> S3
    VM2 --> S3
```

### Memory Budget (1GB VM)
- Node.js backend: ~200-300 MB
- OS overhead: ~200 MB
- Buffer for spikes: ~500 MB

---

## Development Setup

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-repo/credinvoice.git
cd credinvoice

# Backend setup
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
# Backend (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/credinvoice"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000

# Frontend (uses Vite proxy, no env needed for API)
```

---

## Phase 2 Roadmap (Future)

- GST/eInvoice API Integration
- TReDS Partnership
- Seller Financing with Recourse
- Auto-Bidding for Financiers
- Rule-Based Credit Scoring
- Analytics Dashboard
- Mobile Apps (iOS/Android)
