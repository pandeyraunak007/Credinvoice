/**
 * Two-Party Contract Template
 * For Self-Funded Dynamic Discounting (Buyer pays Seller directly)
 */

export interface TwoPartyContractData {
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
  sellerReceives: number;

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

  // Acceptance timestamps
  buyerAcceptedAt: Date;
  sellerAcceptedAt: Date;
}

export function generateTwoPartyContract(data: TwoPartyContractData): string {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateTime = (date: Date) => new Date(date).toLocaleString('en-IN');

  return `
═══════════════════════════════════════════════════════════════════
                    DYNAMIC DISCOUNTING CONTRACT
                         (Self-Funded)
═══════════════════════════════════════════════════════════════════
Contract Number: ${data.contractNumber}
Generated On: ${formatDateTime(data.generatedAt)}
Contract Type: TWO-PARTY AGREEMENT
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

───────────────────────────────────────────────────────────────────
                       INVOICE DETAILS
───────────────────────────────────────────────────────────────────

Invoice Number: ${data.invoiceNumber}
Invoice Date: ${formatDate(data.invoiceDate)}
Original Due Date: ${formatDate(data.dueDate)}
Invoice Amount: ${formatCurrency(data.invoiceAmount)}

───────────────────────────────────────────────────────────────────
                     DISCOUNT ARRANGEMENT
───────────────────────────────────────────────────────────────────

Discount Percentage: ${data.discountPercentage}%
Discount Amount: ${formatCurrency(data.discountAmount)}
Early Payment Date: ${formatDate(data.earlyPaymentDate)}

┌─────────────────────────────────────────────────────────────────┐
│                      PAYMENT SUMMARY                            │
├─────────────────────────────────────────────────────────────────┤
│ Original Invoice Amount:          ${formatCurrency(data.invoiceAmount).padStart(20)} │
│ Less: Discount (${data.discountPercentage}%):              ${('-' + formatCurrency(data.discountAmount)).padStart(20)} │
├─────────────────────────────────────────────────────────────────┤
│ AMOUNT SELLER RECEIVES:           ${formatCurrency(data.sellerReceives).padStart(20)} │
│ AMOUNT BUYER PAYS:                ${formatCurrency(data.sellerReceives).padStart(20)} │
│ PAYMENT DUE BY:                   ${formatDate(data.earlyPaymentDate).padStart(20)} │
└─────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────
                     TERMS AND CONDITIONS
───────────────────────────────────────────────────────────────────

1. AGREEMENT
   1.1 The Buyer agrees to pay the Seller the Early Payment Amount
       in exchange for the agreed discount on the Invoice.
   1.2 The Seller agrees to accept the discounted amount as full
       and final settlement of the Invoice.

2. OBLIGATIONS OF THE BUYER
   2.1 The Buyer shall pay ${formatCurrency(data.sellerReceives)} to the Seller's
       registered bank account on or before ${formatDate(data.earlyPaymentDate)}.
   2.2 Payment shall be made via bank transfer (NEFT/RTGS/IMPS).

3. OBLIGATIONS OF THE SELLER
   3.1 Upon receiving the Early Payment Amount, the Seller
       acknowledges the Invoice as fully settled.
   3.2 The Seller waives any claim to the remaining
       ${formatCurrency(data.discountAmount)} (discount amount).

4. SETTLEMENT
   4.1 Upon successful payment by the Buyer, this Invoice shall
       be considered fully settled.
   4.2 No further payment obligations exist between the parties
       for this Invoice.

5. REPRESENTATIONS AND WARRANTIES
   5.1 The Buyer warrants: The Invoice is genuine, goods/services
       were delivered satisfactorily, and no disputes exist.
   5.2 The Seller warrants: The Invoice is valid, undisputed,
       and has not been assigned to any third party.

6. DEFAULT
   6.1 If the Buyer fails to pay by ${formatDate(data.earlyPaymentDate)},
       this discount arrangement becomes void.
   6.2 The original Invoice terms shall apply in case of default.

7. GOVERNING LAW
   7.1 This contract is governed by the laws of India.
   7.2 Disputes shall be resolved through arbitration under the
       Arbitration and Conciliation Act, 1996.

───────────────────────────────────────────────────────────────────
                      DIGITAL ACCEPTANCE
───────────────────────────────────────────────────────────────────

This contract was digitally accepted on the CredInvoice platform.

Buyer Acceptance:
  Company: ${data.buyer.companyName}
  Accepted On: ${formatDateTime(data.buyerAcceptedAt)}
  Action: Created invoice and discount offer, selected self-funding

Seller Acceptance:
  Company: ${data.seller.companyName}
  Accepted On: ${formatDateTime(data.sellerAcceptedAt)}
  Action: Accepted discount offer

───────────────────────────────────────────────────────────────────
Contract ID: ${data.contractNumber}
Generated: ${new Date(data.generatedAt).toISOString()}
Platform: CredInvoice - Dynamic Discounting
═══════════════════════════════════════════════════════════════════
`.trim();
}
