/**
 * Three-Party Contract Template
 * For Financier-Funded Dynamic Discounting
 * Financier pays Seller early, Buyer repays Financier on due date
 */

export interface ThreePartyContractData {
  contractNumber: string;
  generatedAt: Date;

  // Invoice details
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceAmount: number;
  dueDate: Date;

  // Discount details
  discountPercentage: number;
  discountAmount: number;
  earlyPaymentDate: Date;

  // Payment flow
  sellerReceives: number;      // What financier pays to seller
  financierRate: number;       // Annual discount rate
  financierFee: number;        // Processing fee
  buyerRepays: number;         // What buyer pays to financier
  repaymentDueDate: Date;      // When buyer must repay

  // Buyer details
  buyer: {
    companyName: string;
    gstin: string | null;
    address: string | null;
    contactName: string | null;
  };

  // Seller details
  seller: {
    companyName: string;
    gstin: string | null;
    address: string | null;
    contactName: string | null;
  };

  // Financier details
  financier: {
    companyName: string;
    rbiLicense: string | null;
    entityType: string | null;
    address: string | null;
    contactName: string | null;
  };

  // Acceptance timestamps
  buyerAcceptedAt: Date;
  sellerAcceptedAt: Date;
  financierAcceptedAt: Date;
}

export function generateThreePartyContract(data: ThreePartyContractData): string {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateTime = (date: Date) => new Date(date).toLocaleString('en-IN');

  const financierEarnings = data.buyerRepays - data.sellerReceives;

  return `
═══════════════════════════════════════════════════════════════════
                    DYNAMIC DISCOUNTING CONTRACT
                       (Financier-Funded)
═══════════════════════════════════════════════════════════════════
Contract Number: ${data.contractNumber}
Generated On: ${formatDateTime(data.generatedAt)}
Contract Type: THREE-PARTY AGREEMENT
───────────────────────────────────────────────────────────────────

                         PARTIES

BUYER (First Party):
  Company: ${data.buyer.companyName}
  GSTIN: ${data.buyer.gstin || 'N/A'}
  Address: ${data.buyer.address || 'N/A'}
  Contact: ${data.buyer.contactName || 'N/A'}

SELLER (Second Party):
  Company: ${data.seller.companyName}
  GSTIN: ${data.seller.gstin || 'N/A'}
  Address: ${data.seller.address || 'N/A'}
  Contact: ${data.seller.contactName || 'N/A'}

FINANCIER (Third Party):
  Company: ${data.financier.companyName}
  Entity Type: ${data.financier.entityType || 'N/A'}
  RBI License: ${data.financier.rbiLicense || 'N/A'}
  Address: ${data.financier.address || 'N/A'}
  Contact: ${data.financier.contactName || 'N/A'}

───────────────────────────────────────────────────────────────────
                       INVOICE DETAILS
───────────────────────────────────────────────────────────────────

Invoice Number: ${data.invoiceNumber}
Invoice Date: ${formatDate(data.invoiceDate)}
Original Due Date: ${formatDate(data.dueDate)}
Invoice Amount: ${formatCurrency(data.invoiceAmount)}

───────────────────────────────────────────────────────────────────
                    FINANCING ARRANGEMENT
───────────────────────────────────────────────────────────────────

Discount Percentage: ${data.discountPercentage}%
Financier Rate: ${data.financierRate}% (annualized)
Processing Fee: ${formatCurrency(data.financierFee)}

┌─────────────────────────────────────────────────────────────────┐
│                       PAYMENT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: Financier → Seller (Early Payment)                    │
│  ─────────────────────────────────────────                      │
│  Amount: ${formatCurrency(data.sellerReceives).padStart(40)}  │
│  By Date: ${formatDate(data.earlyPaymentDate).padStart(40)}  │
│                                                                 │
│  STEP 2: Buyer → Financier (Repayment)                          │
│  ─────────────────────────────────────                          │
│  Amount: ${formatCurrency(data.buyerRepays).padStart(40)}  │
│  Due Date: ${formatDate(data.repaymentDueDate).padStart(39)}  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     FINANCIAL SUMMARY                           │
├─────────────────────────────────────────────────────────────────┤
│ Original Invoice Amount:          ${formatCurrency(data.invoiceAmount).padStart(20)} │
│ Seller's Discount (${data.discountPercentage}%):           ${('-' + formatCurrency(data.discountAmount)).padStart(20)} │
│ SELLER RECEIVES:                  ${formatCurrency(data.sellerReceives).padStart(20)} │
├─────────────────────────────────────────────────────────────────┤
│ Financier Pays Seller:            ${formatCurrency(data.sellerReceives).padStart(20)} │
│ Financier Rate (${data.financierRate}%):             ${('+' + formatCurrency(financierEarnings - data.financierFee)).padStart(20)} │
│ Processing Fee:                   ${('+' + formatCurrency(data.financierFee)).padStart(20)} │
│ BUYER REPAYS:                     ${formatCurrency(data.buyerRepays).padStart(20)} │
└─────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────
                     TERMS AND CONDITIONS
───────────────────────────────────────────────────────────────────

1. AGREEMENT
   1.1 The Seller has offered a discount for early payment.
   1.2 The Buyer has chosen to fund this through a Financier.
   1.3 The Financier agrees to provide early payment to the Seller
       in exchange for the right to receive payment from the Buyer
       on the original due date.

2. OBLIGATIONS OF THE FINANCIER
   2.1 The Financier shall disburse ${formatCurrency(data.sellerReceives)} to
       the Seller's registered bank account within 2 business days
       of contract execution.
   2.2 The Financier accepts the assignment of receivable from the
       Buyer for this Invoice.

3. OBLIGATIONS OF THE SELLER
   3.1 The Seller assigns the right to receive payment for this
       Invoice to the Financier.
   3.2 Upon receiving early payment, the Seller acknowledges the
       Invoice as settled from their perspective.
   3.3 The Seller warrants the Invoice is valid, undisputed, and
       has not been previously assigned.

4. OBLIGATIONS OF THE BUYER
   4.1 The Buyer agrees to pay ${formatCurrency(data.buyerRepays)} to the
       Financier on or before ${formatDate(data.repaymentDueDate)}.
   4.2 The Buyer's payment obligation is to the Financier, not
       the Seller, once this contract is executed.
   4.3 The Buyer warrants the Invoice is genuine and payable.

5. PAYMENT FLOW

   Step 1: Financier → Seller (Early Payment)
   ┌─────────────────────────────────────────┐
   │ Amount: ${formatCurrency(data.sellerReceives).padStart(28)} │
   │ Timeline: Within 2 business days        │
   │ Method: Bank Transfer                   │
   └─────────────────────────────────────────┘

   Step 2: Buyer → Financier (Repayment)
   ┌─────────────────────────────────────────┐
   │ Amount: ${formatCurrency(data.buyerRepays).padStart(28)} │
   │ Due Date: ${formatDate(data.repaymentDueDate).padStart(27)} │
   │ Method: Bank Transfer                   │
   └─────────────────────────────────────────┘

6. DEFAULT AND REMEDIES
   6.1 If the Buyer fails to pay by the Due Date:
       - Late payment fee of 2% per month applies
       - Financier may pursue legal remedies
       - Default will be reported to credit bureaus
   6.2 The Seller is not liable for Buyer's default after
       receiving early payment.

7. ASSIGNMENT
   7.1 The Seller hereby assigns all rights, title, and interest
       in the Invoice receivable to the Financier.
   7.2 This assignment is effective upon disbursement to Seller.

8. REPRESENTATIONS AND WARRANTIES
   8.1 Buyer warrants: Invoice is genuine, goods/services were
       delivered, no disputes exist.
   8.2 Seller warrants: Invoice is valid, not previously assigned,
       no liens or encumbrances.
   8.3 Financier warrants: Has authority and funds to execute
       this financing arrangement.

9. CONFIDENTIALITY
   9.1 All parties agree to keep the terms of this contract
       confidential, except as required by law.

10. GOVERNING LAW
    10.1 This contract is governed by the laws of India.
    10.2 Disputes shall be resolved through arbitration in the
         city of the Buyer under the Arbitration and Conciliation
         Act, 1996.

───────────────────────────────────────────────────────────────────
                      DIGITAL ACCEPTANCE
───────────────────────────────────────────────────────────────────

This contract was digitally accepted on the CredInvoice platform.

Buyer Acceptance:
  Company: ${data.buyer.companyName}
  Accepted On: ${formatDateTime(data.buyerAcceptedAt)}
  Action: Uploaded invoice, created discount offer, accepted financier bid

Seller Acceptance:
  Company: ${data.seller.companyName}
  Accepted On: ${formatDateTime(data.sellerAcceptedAt)}
  Action: Accepted discount offer

Financier Acceptance:
  Company: ${data.financier.companyName}
  Accepted On: ${formatDateTime(data.financierAcceptedAt)}
  Action: Submitted winning bid at ${data.financierRate}% rate

───────────────────────────────────────────────────────────────────
Contract ID: ${data.contractNumber}
Generated: ${new Date(data.generatedAt).toISOString()}
Platform: CredInvoice - Dynamic Discounting
═══════════════════════════════════════════════════════════════════
`.trim();
}
