# CredInvoice - User Stories

## Overview

This document contains all user stories for CredInvoice Phase 1, organized by workflow and priority.

**Last Updated:** December 29, 2025

---

## Priority Levels

| Priority | Description |
|----------|-------------|
| **P0** | Must Have - Core functionality, launch blocker |
| **P1** | Should Have - Important but not critical for launch |
| **P2** | Nice to Have - Future enhancement |

## Status Legend

| Status | Description |
|--------|-------------|
| :white_check_mark: | Completed |
| :construction: | In Progress |
| :x: | Not Started |

---

## Workflow 1: Dynamic Discounting (Self-Funded)

Self-funded early payment where Buyer pays from their own treasury.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-DD-01 | Buyer | Upload an invoice to offer early payment discounts | P0 | :white_check_mark: |
| US-DD-02 | Buyer | AI extracts invoice details automatically | P0 | :x: |
| US-DD-03 | Buyer | Set discount percentage with slider UI | P0 | :construction: |
| US-DD-04 | Seller | Receive notifications for discount offers | P0 | :construction: |
| US-DD-05 | Seller | View discount details clearly before accepting | P0 | :white_check_mark: |
| US-DD-06 | Buyer | Authorize payment to release funds | P0 | :white_check_mark: |
| US-DD-07 | Seller | Track payment/disbursement status | P1 | :white_check_mark: |

---

## Workflow 2: DD + Early Payment (Financier-Funded)

Financier-funded early payment with competitive bidding.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-EP-01 | Buyer | Choose between self-funding or financier-funding | P0 | :white_check_mark: |
| US-EP-02 | Buyer | Send accepted invoices to financiers for bidding | P0 | :white_check_mark: |
| US-EP-03 | Financier | View invoice details before placing bid | P0 | :white_check_mark: |
| US-EP-04 | Financier | Place competitive bids with discount rate | P0 | :white_check_mark: |
| US-EP-05 | Buyer | Compare all bids and select lowest rate | P0 | :white_check_mark: |
| US-EP-06 | Financier | Disburse funds after bid is accepted | P0 | :white_check_mark: |
| US-EP-07 | Seller | Receive funds from financier within T+1 | P0 | :white_check_mark: |
| US-EP-08 | Financier | Track repayment from Buyer on due date | P1 | :white_check_mark: |

---

## Workflow 3: GST-Backed Invoice Financing

Invoice financing with GST verification and haircut-based pricing.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-GST-01 | Company | Upload GST invoice for early financing | P0 | :white_check_mark: |
| US-GST-02 | Company | Invoice auto-validated via GST portal API | P2 | :x: |
| US-GST-03 | Financier | Review company creditworthiness before bidding | P0 | :construction: |
| US-GST-04 | Financier | Add haircut based on risk assessment | P0 | :white_check_mark: |
| US-GST-05 | Company | Compare bids including haircuts | P0 | :white_check_mark: |
| US-GST-06 | Financier | Track repayment on due date | P1 | :white_check_mark: |

---

## Foundation: Authentication & User Management

Core authentication and user setup functionality.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-AUTH-01 | Any | Register on the platform | P0 | :white_check_mark: |
| US-AUTH-02 | Any | Login securely with JWT | P0 | :white_check_mark: |
| US-AUTH-03 | Any | Reset password if forgotten | P1 | :x: |
| US-AUTH-04 | Any | Enable 2FA for extra security | P1 | :x: |
| US-AUTH-05 | Any | Stay logged in with refresh tokens | P0 | :white_check_mark: |

---

## Foundation: Profile Management

User profile and company information management.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-PROF-01 | Buyer | Complete company profile | P0 | :white_check_mark: |
| US-PROF-02 | Seller | Complete company profile | P0 | :white_check_mark: |
| US-PROF-03 | Financier | Complete company profile | P0 | :white_check_mark: |
| US-PROF-04 | Any | Add bank account details | P0 | :white_check_mark: |
| US-PROF-05 | Any | Manage multiple bank accounts | P1 | :white_check_mark: |

---

## Foundation: KYC Workflow

Know Your Customer document management and verification.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-KYC-01 | Any | Upload KYC documents | P0 | :white_check_mark: |
| US-KYC-02 | Any | Track KYC verification status | P0 | :white_check_mark: |
| US-KYC-03 | Admin | Review submitted KYC documents | P0 | :white_check_mark: |
| US-KYC-04 | Admin | Approve or reject KYC with reason | P0 | :white_check_mark: |
| US-KYC-05 | Any | Receive notification on KYC status change | P0 | :construction: |

---

## AI Invoice Extractor

Core feature for automatic invoice data extraction.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-AI-01 | Any | Upload invoice documents (PDF, JPEG, PNG) | P0 | :white_check_mark: |
| US-AI-02 | Any | Invoice data automatically extracted | P0 | :x: |
| US-AI-03 | Any | See extraction confidence scores | P0 | :x: |
| US-AI-04 | Any | Correct extracted data manually | P0 | :x: |
| US-AI-05 | System | Validate extracted data (GST, dates, amounts) | P0 | :x: |

---

## Notifications

User notification system.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-NOTIF-01 | Any | Receive in-app notifications | P0 | :construction: |
| US-NOTIF-02 | Any | Receive email notifications | P1 | :x: |
| US-NOTIF-03 | Any | Manage notification preferences | P2 | :x: |

---

## Admin Operations

Platform administration functionality.

### User Stories

| ID | Role | User Story | Priority | Status |
|----|------|------------|----------|--------|
| US-ADMIN-01 | Admin | View all users with filters | P0 | :white_check_mark: |
| US-ADMIN-02 | Admin | Manage user status (activate/suspend) | P0 | :white_check_mark: |
| US-ADMIN-03 | Admin | View all invoices | P0 | :white_check_mark: |
| US-ADMIN-04 | Admin | Monitor transactions & disbursements | P0 | :white_check_mark: |
| US-ADMIN-05 | Admin | Handle disputes | P1 | :x: |
| US-ADMIN-06 | Admin | View platform reports | P1 | :x: |

---

## Implementation Summary

### P0 - Must Have (32 stories)

| Category | Total | Done | In Progress | Not Started |
|----------|-------|------|-------------|-------------|
| Dynamic Discounting | 6 | 4 | 2 | 0 |
| DD + Early Payment | 8 | 8 | 0 | 0 |
| GST-Backed Financing | 4 | 3 | 1 | 0 |
| Authentication | 3 | 3 | 0 | 0 |
| Profile Management | 4 | 4 | 0 | 0 |
| KYC Workflow | 5 | 4 | 1 | 0 |
| AI Invoice Extractor | 5 | 1 | 0 | 4 |
| Notifications | 1 | 0 | 1 | 0 |
| Admin Operations | 4 | 4 | 0 | 0 |
| **TOTAL P0** | **40** | **31** | **5** | **4** |

### P1 - Should Have (10 stories)

| Category | Total | Done | In Progress | Not Started |
|----------|-------|------|-------------|-------------|
| Dynamic Discounting | 1 | 1 | 0 | 0 |
| DD + Early Payment | 1 | 1 | 0 | 0 |
| GST-Backed Financing | 1 | 1 | 0 | 0 |
| Authentication | 2 | 0 | 0 | 2 |
| Profile Management | 1 | 1 | 0 | 0 |
| Notifications | 1 | 0 | 0 | 1 |
| Admin Operations | 2 | 0 | 0 | 2 |
| **TOTAL P1** | **9** | **4** | **0** | **5** |

### P2 - Nice to Have (2 stories)

| Category | Total | Done | In Progress | Not Started |
|----------|-------|------|-------------|-------------|
| GST-Backed Financing | 1 | 0 | 0 | 1 |
| Notifications | 1 | 0 | 0 | 1 |
| **TOTAL P2** | **2** | **0** | **0** | **2** |

---

## Overall Progress

| Priority | Total | Completed | Completion % |
|----------|-------|-----------|--------------|
| P0 (Must Have) | 40 | 31 | **78%** |
| P1 (Should Have) | 9 | 4 | **44%** |
| P2 (Nice to Have) | 2 | 0 | **0%** |
| **TOTAL** | **51** | **35** | **69%** |

---

## Remaining Work for Phase 1 Launch

### Critical (P0) - 9 items remaining

1. **AI Invoice Extraction** (US-AI-02 to US-AI-05) - 4 stories
   - Integrate OCR (Google Vision / AWS Textract)
   - Build confidence scoring
   - Add manual correction UI

2. **Dynamic Discount Slider** (US-DD-03) - 1 story
   - Add slider UI component for discount %

3. **Notifications** (US-DD-04, US-KYC-05, US-NOTIF-01) - 3 stories
   - Wire up notification display in UI
   - Trigger notifications on status changes

4. **Financier Creditworthiness View** (US-GST-03) - 1 story
   - Show company history and credit info

### Should Have (P1) - 5 items

1. Password reset flow
2. Two-factor authentication
3. Email notifications
4. Admin dispute handling
5. Platform reports dashboard

---

## Recent Updates (Dec 29, 2025)

- :white_check_mark: Implemented Admin KYC Review feature (US-KYC-03, US-KYC-04)
- :white_check_mark: Connected KYC onboarding frontend to backend API
- :white_check_mark: Fixed AuthContext to properly read nested KYC status
- :white_check_mark: Created admin user for testing
