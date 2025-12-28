# CredInvoice - User Stories

## Overview

This document contains all user stories for CredInvoice Phase 1, organized by workflow and priority.

---

## Priority Levels

| Priority | Description |
|----------|-------------|
| **P0** | Must Have - Core functionality, launch blocker |
| **P1** | Should Have - Important but not critical for launch |
| **P2** | Nice to Have - Future enhancement |

---

## Workflow 1: Dynamic Discounting (Self-Funded)

Self-funded early payment where Buyer pays from their own treasury.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-DD-01 | Buyer | As a Buyer, I want to upload an invoice so that I can offer early payment discounts | - Can upload PDF/image<br>- File size up to 10MB<br>- Supported formats: PDF, JPEG, PNG | P0 |
| US-DD-02 | Buyer | As a Buyer, I want AI to extract invoice details so that I save time on data entry | - Auto-extract: Invoice#, Date, Due Date, GSTIN, Amounts<br>- Show confidence score<br>- Allow manual correction | P0 |
| US-DD-03 | Buyer | As a Buyer, I want to set discount percentage so that I can incentivize early payment | - Set fixed % or sliding scale<br>- Preview discounted amount<br>- Set early payment date | P0 |
| US-DD-04 | Seller | As a Seller, I want to receive notifications so that I don't miss discount offers | - Email notification<br>- In-app notification<br>- Show offer details in notification | P0 |
| US-DD-05 | Seller | As a Seller, I want to see discount details clearly so that I can make informed decisions | - Show original amount<br>- Show discount %<br>- Show final amount<br>- Show early payment date | P0 |
| US-DD-06 | Buyer | As a Buyer, I want to authorize payment so that funds are released to seller | - Confirm payment authorization<br>- Select bank account<br>- View transaction status | P0 |
| US-DD-07 | Seller | As a Seller, I want to track payment status so that I know when to expect funds | - View disbursement status<br>- See expected date<br>- Get notification on completion | P1 |

---

## Workflow 2: DD + Early Payment (Financier-Funded)

Financier-funded early payment with competitive bidding.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-EP-01 | Buyer | As a Buyer, I want to choose between self-funding or financier-funding | - Clear option selection<br>- Explain implications of each<br>- Can switch before confirmation | P0 |
| US-EP-02 | Buyer | As a Buyer, I want to send accepted invoices to multiple financiers for bidding | - Invoice sent to mapped financiers<br>- Set bid window duration<br>- View bid status | P0 |
| US-EP-03 | Financier | As a Financier, I want to view invoice details before placing a bid | - See invoice document<br>- See buyer/seller info<br>- See KYC status<br>- See payment history | P0 |
| US-EP-04 | Financier | As a Financier, I want to place competitive bids with my discount rate | - Enter discount rate<br>- Enter processing fee<br>- See calculated net amount<br>- Set bid validity | P0 |
| US-EP-05 | Buyer | As a Buyer, I want to compare all bids so I can select the lowest rate | - View all bids in table<br>- Sort by rate/net amount<br>- See financier details<br>- One-click selection | P0 |
| US-EP-06 | Financier | As a Financier, I want to disburse funds after my bid is accepted | - Receive acceptance notification<br>- Initiate disbursement<br>- Track transfer status | P0 |
| US-EP-07 | Seller | As a Seller, I want to receive funds from financier within T+1 | - View expected disbursement date<br>- Get notification on receipt<br>- See transaction details | P0 |
| US-EP-08 | Financier | As a Financier, I want to track repayment from Buyer on due date | - View repayment schedule<br>- Get due date reminders<br>- Track payment receipt<br>- Handle overdue cases | P1 |

---

## Workflow 3: GST-Backed Invoice Financing

Invoice financing with GST verification and haircut-based pricing.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-GST-01 | Company | As a Company, I want to upload my GST invoice for early financing | - Upload invoice document<br>- AI extraction of details<br>- GST format validation | P0 |
| US-GST-02 | Company | As a Company, I want my invoice auto-validated via GST portal | - Real-time GST API check<br>- Show validation status<br>- Flag discrepancies | P2 |
| US-GST-03 | Financier | As a Financier, I want to review company creditworthiness before bidding | - View company KYC<br>- See GST filing history<br>- View past transaction history<br>- See credit score | P0 |
| US-GST-04 | Financier | As a Financier, I want to add haircut based on my risk assessment | - Enter haircut %<br>- Enter discount rate<br>- Calculate net disbursement<br>- Explain haircut to borrower | P0 |
| US-GST-05 | Company | As a Company, I want to compare bids including haircuts to find best terms | - View all bids with haircuts<br>- See net amount receivable<br>- Compare effective rates<br>- Select best offer | P0 |
| US-GST-06 | Financier | As a Financier, I want to track repayment on due date | - View repayment schedule<br>- Send reminders<br>- Track receipt<br>- Handle defaults | P1 |

---

## Foundation: Authentication & User Management

Core authentication and user setup functionality.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-AUTH-01 | Any | As a user, I want to register on the platform | - Enter email, password<br>- Select user type<br>- Enter company name<br>- Receive confirmation | P0 |
| US-AUTH-02 | Any | As a user, I want to login securely | - Email/password login<br>- Receive JWT tokens<br>- Handle invalid credentials | P0 |
| US-AUTH-03 | Any | As a user, I want to reset my password if forgotten | - Request reset via email<br>- Receive reset link<br>- Set new password | P1 |
| US-AUTH-04 | Any | As a user, I want to enable 2FA for extra security | - Setup TOTP-based 2FA<br>- Scan QR code<br>- Enter verification code | P1 |
| US-AUTH-05 | Any | As a user, I want to stay logged in across sessions | - Refresh token mechanism<br>- 7-day refresh validity<br>- Secure token storage | P0 |

---

## Foundation: Profile Management

User profile and company information management.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-PROF-01 | Buyer | As a Buyer, I want to complete my company profile | - Enter company details<br>- Add GSTIN, PAN<br>- Add address<br>- Add contact info | P0 |
| US-PROF-02 | Seller | As a Seller, I want to complete my company profile | - Enter company details<br>- Add GSTIN, PAN<br>- Add business type<br>- Add contact info | P0 |
| US-PROF-03 | Financier | As a Financier, I want to complete my company profile | - Enter company details<br>- Add RBI license<br>- Add entity type<br>- Add contact info | P0 |
| US-PROF-04 | Any | As a user, I want to add my bank account details | - Add account number<br>- Add IFSC code<br>- Add bank name<br>- Set primary account | P0 |
| US-PROF-05 | Any | As a user, I want to manage multiple bank accounts | - Add multiple accounts<br>- Set default account<br>- Remove accounts | P1 |

---

## Foundation: KYC Workflow

Know Your Customer document management and verification.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-KYC-01 | Any | As a user, I want to upload KYC documents | - Upload PAN, GST certificate<br>- Upload incorporation docs<br>- Upload bank statement<br>- See upload status | P0 |
| US-KYC-02 | Any | As a user, I want to track my KYC verification status | - See pending documents<br>- See approved documents<br>- See rejected with reason | P0 |
| US-KYC-03 | Admin | As an Admin, I want to review submitted KYC documents | - View document list<br>- Download/view documents<br>- See user details | P0 |
| US-KYC-04 | Admin | As an Admin, I want to approve or reject KYC documents | - Approve with one click<br>- Reject with reason<br>- Request additional docs | P0 |
| US-KYC-05 | Any | As a user, I want to be notified of KYC status changes | - Email notification<br>- In-app notification<br>- Show rejection reason | P0 |

---

## AI Invoice Extractor

Core feature for automatic invoice data extraction.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-AI-01 | Any | As a user, I want to upload invoice documents | - Support PDF, JPEG, PNG, TIFF<br>- Max 10MB file size<br>- Show upload progress | P0 |
| US-AI-02 | Any | As a user, I want invoice data automatically extracted | - Extract invoice number<br>- Extract dates<br>- Extract GSTINs<br>- Extract amounts | P0 |
| US-AI-03 | Any | As a user, I want to see extraction confidence scores | - Show per-field confidence<br>- Highlight low-confidence fields<br>- Flag for review | P0 |
| US-AI-04 | Any | As a user, I want to correct extracted data | - Edit any extracted field<br>- Validate on save<br>- Show validation errors | P0 |
| US-AI-05 | System | As the system, I want to validate extracted data | - Validate GST format<br>- Validate date logic<br>- Check for duplicates<br>- Validate amounts | P0 |

---

## Notifications

User notification system.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-NOTIF-01 | Any | As a user, I want to receive in-app notifications | - See notification list<br>- See unread count<br>- Mark as read | P0 |
| US-NOTIF-02 | Any | As a user, I want to receive email notifications | - Receive on important events<br>- Clear subject line<br>- Action links in email | P1 |
| US-NOTIF-03 | Any | As a user, I want to manage notification preferences | - Toggle notification types<br>- Toggle email/in-app<br>- Set quiet hours | P2 |

---

## Admin Operations

Platform administration functionality.

### User Stories

| ID | Role | User Story | Acceptance Criteria | Priority |
|----|------|------------|---------------------|----------|
| US-ADMIN-01 | Admin | As an Admin, I want to view all users | - List all users<br>- Filter by type/status<br>- Search by name/email | P0 |
| US-ADMIN-02 | Admin | As an Admin, I want to manage user status | - Activate/suspend users<br>- View user history<br>- Add admin notes | P0 |
| US-ADMIN-03 | Admin | As an Admin, I want to view all invoices | - List all invoices<br>- Filter by status/type<br>- View invoice details | P0 |
| US-ADMIN-04 | Admin | As an Admin, I want to monitor transactions | - View all disbursements<br>- Track repayments<br>- Handle failures | P0 |
| US-ADMIN-05 | Admin | As an Admin, I want to handle disputes | - View dispute list<br>- Investigate details<br>- Resolve with action | P1 |
| US-ADMIN-06 | Admin | As an Admin, I want to view platform reports | - Transaction summary<br>- User growth<br>- Revenue metrics | P1 |

---

## Summary by Priority

### P0 - Must Have (32 stories)

| Category | Count |
|----------|-------|
| Dynamic Discounting | 6 |
| DD + Early Payment | 7 |
| GST-Backed Financing | 4 |
| Authentication | 3 |
| Profile Management | 4 |
| KYC Workflow | 5 |
| AI Invoice Extractor | 5 |
| Notifications | 1 |
| Admin Operations | 4 |

### P1 - Should Have (10 stories)

| Category | Count |
|----------|-------|
| Dynamic Discounting | 1 |
| DD + Early Payment | 1 |
| GST-Backed Financing | 1 |
| Authentication | 2 |
| Profile Management | 1 |
| Notifications | 1 |
| Admin Operations | 2 |

### P2 - Nice to Have (2 stories)

| Category | Count |
|----------|-------|
| GST-Backed Financing | 1 |
| Notifications | 1 |

---

## Implementation Mapping

### Sprint 1-2: Foundation
- US-AUTH-01 to US-AUTH-05
- US-PROF-01 to US-PROF-05

### Sprint 3: KYC
- US-KYC-01 to US-KYC-05

### Sprint 4: Invoice & AI
- US-AI-01 to US-AI-05
- US-DD-01, US-DD-02

### Sprint 5: Dynamic Discounting
- US-DD-03 to US-DD-07

### Sprint 6: Financier Bidding
- US-EP-01 to US-EP-08

### Sprint 7: GST-Backed Financing
- US-GST-01 to US-GST-06

### Sprint 8: Admin & Polish
- US-ADMIN-01 to US-ADMIN-06
- US-NOTIF-01 to US-NOTIF-03
