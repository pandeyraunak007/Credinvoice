# CredInvoice - Developer Guide

## Project Overview

CredInvoice is a Supply Chain Finance Platform that enables invoice financing, dynamic discounting, and bid-based financing between Buyers (large enterprises), Sellers (MSMEs/suppliers), and Financiers (banks/NBFCs).

## Tech Stack

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (access + refresh tokens)
- **Validation:** Zod
- **File Upload:** Multer

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **State Management:** React Context API

---

## Quick Start

### Prerequisites
- Node.js v20+
- PostgreSQL database
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

Backend runs on: **http://localhost:3000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## Sample Accounts

All accounts below have **KYC APPROVED** status and can be used immediately:

| Role | Email | Password | Company | Dashboard URL |
|------|-------|----------|---------|---------------|
| **Buyer** | test@example.com | Password123! | Test Enterprises | `/` |
| **Seller** | seller@example.com | Seller123! | Seller Corp | `/seller` |
| **Financier** | financier@example.com | Financier123! | Capital Finance Ltd | `/financier` |

---

## API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get tokens |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout user |

### Profile (`/api/v1/profile`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user profile |
| PUT | `/` | Update profile |
| GET | `/bank-accounts` | List bank accounts |
| POST | `/bank-accounts` | Add bank account |
| PUT | `/bank-accounts/:id` | Update bank account |
| DELETE | `/bank-accounts/:id` | Delete bank account |
| POST | `/bank-accounts/:id/set-primary` | Set as primary |

### KYC (`/api/v1/kyc`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Get KYC status |
| GET | `/documents` | List uploaded documents |
| POST | `/upload` | Upload KYC document |
| DELETE | `/documents/:id` | Delete document |

### Invoices (`/api/v1/invoices`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List invoices |
| POST | `/` | Create invoice |
| GET | `/:id` | Get invoice details |
| PUT | `/:id` | Update invoice |
| POST | `/:id/submit` | Submit for acceptance |
| POST | `/:id/accept` | Buyer accepts invoice |
| POST | `/:id/reject` | Buyer rejects invoice |
| POST | `/:id/open-for-bidding` | Open for financier bids |
| GET | `/available` | Get available invoices (for financiers) |

### Bids (`/api/v1/bids`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create bid on invoice |
| GET | `/:id` | Get bid details |
| GET | `/invoice/:invoiceId` | Get bids for invoice |
| GET | `/my-bids` | Get financier's bids |
| POST | `/:id/accept` | Accept bid |
| POST | `/:id/withdraw` | Withdraw bid |

### Disbursements (`/api/v1/disbursements`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List disbursements |
| GET | `/:id` | Get disbursement details |
| POST | `/self-funded` | Initiate buyer self-funded payment |
| POST | `/financier` | Initiate financier payment |
| PATCH | `/:id/status` | Update disbursement status |
| GET | `/repayments/upcoming` | Get upcoming repayments |
| POST | `/repayments/:id/mark-paid` | Mark repayment as paid |

---

## User Types & Workflows

### Buyer (Large Enterprise)
1. Register and complete KYC
2. Create invoices for goods/services received from sellers
3. Submit invoices for seller acceptance
4. Choose financing option:
   - **Self-funded:** Pay early with discount
   - **Financier-funded:** Let financier pay seller, repay on due date

### Seller (MSME/Supplier)
1. Register and complete KYC
2. Receive invoice notifications from buyers
3. Accept or reject invoices
4. View discount offers for early payment
5. Accept financing offers and receive funds

### Financier (Bank/NBFC)
1. Register and complete KYC
2. Browse available invoices in marketplace
3. Place competitive bids with discount rates
4. Disburse funds when bid is accepted
5. Collect repayment on invoice due date

---

## Invoice Workflow

```
DRAFT → PENDING_ACCEPTANCE → ACCEPTED → OPEN_FOR_BIDDING → BID_SELECTED → DISBURSED → SETTLED
                          ↘ REJECTED
```

1. **DRAFT:** Invoice created, can be edited
2. **PENDING_ACCEPTANCE:** Submitted to buyer/seller for acceptance
3. **ACCEPTED:** Counterparty accepted the invoice
4. **OPEN_FOR_BIDDING:** Available for financier bids
5. **BID_SELECTED:** Winning bid selected
6. **DISBURSED:** Funds transferred to seller
7. **SETTLED:** Repayment received, invoice closed

---

## KYC Document Types

| Document Type | Required For |
|---------------|--------------|
| PAN_CARD | All users |
| GST_CERTIFICATE | All users |
| INCORPORATION_CERTIFICATE | Companies |
| CANCELLED_CHEQUE | All users |
| BANK_STATEMENT | Optional |
| ADDRESS_PROOF | Optional |
| RBI_LICENSE | Financiers only |
| DIRECTOR_ID | Companies |

---

## Project Structure

```
CredInvoice/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, env, constants
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── kyc/
│   │   │   ├── invoice/
│   │   │   ├── bid/
│   │   │   └── disbursement/
│   │   ├── utils/           # Response helpers
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── uploads/             # Uploaded files
│       └── kyc/
│
├── frontend/
│   ├── src/
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── buyer/       # Buyer portal
│   │   │   ├── seller/      # Seller portal
│   │   │   ├── financier/   # Financier portal
│   │   │   ├── kyc/         # KYC onboarding
│   │   │   └── admin/       # Admin portal
│   │   ├── services/        # API service
│   │   └── App.jsx          # Routes
│   └── vite.config.js       # Vite config with API proxy
│
└── GUIDE.md                 # This file
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/credinvoice"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

---

## Common Commands

```bash
# Backend
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate Prisma client

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Troubleshooting

### KYC Still Required After Approval
- Clear browser cache and localStorage
- Log out and log back in
- Check browser console for API errors

### API Connection Issues
- Ensure backend is running on port 3000
- Check Vite proxy config in `frontend/vite.config.js`
- Verify CORS settings in backend

### Database Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync schema
- Use `npx prisma studio` to inspect data

---

## Session Summary (Dec 28, 2025)

### Completed Tasks:
1. Started frontend and backend servers
2. Identified sample accounts in database
3. Marked all existing accounts as KYC APPROVED
4. Connected KYC frontend form to backend API
5. Fixed AuthContext to properly read nested KYC status
6. Pushed all changes to GitHub

### Key Fixes:
- **KYC Status Bug:** The profile API returns nested structure (`profile.buyer.kycStatus`), but AuthContext was checking `profile.kycStatus`. Fixed by adding helper function to extract KYC status based on user type.

---

## Session Summary (Dec 31, 2025)

### New Features Implemented:

#### 1. Discount Offer Confirmation Dialog
- Added a 2nd confirmation dialog when buyer submits a discount offer
- Shows detailed summary: invoice number, seller name, original amount, discount %, discounted amount, savings
- Displays payment timeline comparing early payment date vs original due date
- Implemented in `frontend/src/pages/buyer/CreateInvoice.jsx`

#### 2. Real-Time Notification System
- Created new `NotificationContext` with toast-style notifications
- Notifications appear in top-right corner with auto-dismiss (5 seconds default)
- Support for multiple notification types: success, error, info, discount, payment, invoice
- Optional sound alerts for notifications
- Implemented in `frontend/src/context/NotificationContext.jsx`

#### 3. Seller Notification on New Discount Offers
- Added polling every 30 seconds on seller dashboard
- Shows popup notification when new discount offer is received
- Includes direct link to review the offer
- Updated `frontend/src/pages/seller/SellerPortal.jsx`

#### 4. Buyer Notification on Offer Acceptance/Rejection
- Added polling on buyer dashboard to detect status changes
- Shows success notification when seller accepts offer
- Shows error notification when seller rejects offer
- Includes action button to navigate to funding selection
- Updated `frontend/src/pages/buyer/Dashboard.jsx`

#### 5. Financier Notification on New Invoices
- Added polling on financier marketplace
- Shows notification when new invoices become available for bidding
- Updated `frontend/src/pages/financier/Marketplace.jsx`

#### 6. Interest Rate Label Change
- Changed "Your Discount Rate (%)" to "Your Interest Rate (%)" in financier bid placement modal
- Updated in `frontend/src/pages/financier/Marketplace.jsx`

### Bug Fixes:

#### 1. Invoice Status Mapping Fix
- Fixed `BID_ACCEPTED` → `BID_SELECTED` status mapping
- The backend uses `BID_SELECTED` but frontend was mapping `BID_ACCEPTED`
- This caused invoices to show as "Draft" after bid selection
- Fixed in:
  - `frontend/src/pages/buyer/InvoiceDetail.jsx`
  - `frontend/src/pages/buyer/Invoices.jsx`

#### 2. Status Timeline Update
- Added `BID_SELECTED` status to invoice timeline
- Shows "Financier bid accepted, awaiting disbursement" description

### Files Modified:
| File | Changes |
|------|---------|
| `frontend/src/App.jsx` | Added NotificationProvider wrapper |
| `frontend/src/context/NotificationContext.jsx` | **NEW** - Notification system |
| `frontend/src/pages/buyer/CreateInvoice.jsx` | Added DiscountOfferConfirmModal |
| `frontend/src/pages/buyer/Dashboard.jsx` | Added notification polling |
| `frontend/src/pages/buyer/InvoiceDetail.jsx` | Fixed status mapping |
| `frontend/src/pages/buyer/Invoices.jsx` | Fixed status mapping |
| `frontend/src/pages/seller/SellerPortal.jsx` | Added notification polling |
| `frontend/src/pages/financier/Marketplace.jsx` | Added notifications & label change |

### GitHub Repository:
https://github.com/pandeyraunak007/Credinvoice
