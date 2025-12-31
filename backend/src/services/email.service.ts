import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email templates
export const emailTemplates = {
  discountOfferReceived: (data: {
    sellerName: string;
    buyerName: string;
    invoiceNumber: string;
    originalAmount: number;
    discountedAmount: number;
    discountPercentage: number;
    expiresAt: Date;
    isRevision?: boolean;
    revisionNumber?: number;
  }) => ({
    subject: data.isRevision
      ? `Revised Discount Offer (Revision ${data.revisionNumber}) from ${data.buyerName} - ${data.invoiceNumber}`
      : `New Discount Offer from ${data.buyerName} - ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CRED<span style="font-weight: normal;">INVOICE</span></h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">${data.isRevision ? 'Revised Discount Offer Received' : 'New Discount Offer Received'}</h2>
          <p style="color: #4b5563;">Hi ${data.sellerName},</p>
          <p style="color: #4b5563;">You have received a ${data.isRevision ? `revised discount offer (Revision ${data.revisionNumber})` : 'new discount offer'} from <strong>${data.buyerName}</strong>.</p>

          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="margin-top: 0; color: #374151;">Offer Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Invoice Number:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1f2937;">${data.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Original Amount:</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937;">₹${(data.originalAmount / 100000).toFixed(2)}L</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Discount Offered:</td>
                <td style="padding: 8px 0; text-align: right; color: #16a34a; font-weight: bold;">${data.discountPercentage}%</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #374151; font-weight: bold;">You Will Receive:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #16a34a;">₹${(data.discountedAmount / 100000).toFixed(2)}L</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Expires:</strong> ${new Date(data.expiresAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/seller/discounts"
               style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Review Offer
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            If you accept this offer, you'll receive early payment at the discounted rate.
          </p>
        </div>
        <div style="padding: 20px; background: #1f2937; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            This is an automated message from CredInvoice. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `New Discount Offer from ${data.buyerName}\n\nInvoice: ${data.invoiceNumber}\nOriginal: ₹${(data.originalAmount / 100000).toFixed(2)}L\nDiscount: ${data.discountPercentage}%\nYou'll Receive: ₹${(data.discountedAmount / 100000).toFixed(2)}L\nExpires: ${data.expiresAt}\n\nLogin to CredInvoice to review this offer.`
  }),

  discountOfferAccepted: (data: {
    buyerName: string;
    sellerName: string;
    invoiceNumber: string;
    discountedAmount: number;
    fundingType?: string;
  }) => ({
    subject: `Discount Offer Accepted - ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CRED<span style="font-weight: normal;">INVOICE</span></h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: #16a34a; font-size: 30px;">✓</span>
            </div>
          </div>
          <h2 style="color: #1f2937; text-align: center;">Discount Offer Accepted!</h2>
          <p style="color: #4b5563;">Hi ${data.buyerName},</p>
          <p style="color: #4b5563;"><strong>${data.sellerName}</strong> has accepted your discount offer for invoice <strong>${data.invoiceNumber}</strong>.</p>

          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; margin-bottom: 8px;">Amount to Pay</p>
            <p style="font-size: 28px; font-weight: bold; color: #16a34a; margin: 0;">₹${(data.discountedAmount / 100000).toFixed(2)}L</p>
          </div>

          <p style="color: #4b5563;">Please proceed to select your funding option and authorize payment.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/invoices"
               style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Invoice
            </a>
          </div>
        </div>
        <div style="padding: 20px; background: #1f2937; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            This is an automated message from CredInvoice. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `Discount Offer Accepted!\n\n${data.sellerName} has accepted your discount offer for invoice ${data.invoiceNumber}.\n\nAmount to Pay: ₹${(data.discountedAmount / 100000).toFixed(2)}L\n\nLogin to CredInvoice to complete the payment.`
  }),

  discountOfferRejected: (data: {
    buyerName: string;
    sellerName: string;
    invoiceNumber: string;
    reason?: string;
    canRevise?: boolean;
    revisionsRemaining?: number;
  }) => ({
    subject: `Discount Offer Declined - ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CRED<span style="font-weight: normal;">INVOICE</span></h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Discount Offer Declined</h2>
          <p style="color: #4b5563;">Hi ${data.buyerName},</p>
          <p style="color: #4b5563;"><strong>${data.sellerName}</strong> has declined your discount offer for invoice <strong>${data.invoiceNumber}</strong>.</p>

          ${data.reason ? `
          <div style="background: #fef2f2; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${data.reason}</p>
          </div>
          ` : ''}

          ${data.canRevise ? `
          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>You can revise this offer!</strong> You have ${data.revisionsRemaining} revision${data.revisionsRemaining !== 1 ? 's' : ''} remaining.
              Consider adjusting your discount terms and resubmitting.
            </p>
          </div>
          ` : `
          <p style="color: #4b5563;">You can submit a new offer with different terms or proceed with standard payment terms.</p>
          `}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/invoices"
               style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ${data.canRevise ? 'Revise Offer' : 'View Invoice'}
            </a>
          </div>
        </div>
        <div style="padding: 20px; background: #1f2937; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            This is an automated message from CredInvoice. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `Discount Offer Declined\n\n${data.sellerName} has declined your discount offer for invoice ${data.invoiceNumber}.${data.reason ? `\n\nReason: ${data.reason}` : ''}${data.canRevise ? `\n\nYou have ${data.revisionsRemaining} revision(s) remaining. Login to CredInvoice to revise your offer.` : '\n\nLogin to CredInvoice to submit a new offer or proceed with standard payment.'}`
  }),

  bidReceived: (data: {
    buyerName: string;
    financierName: string;
    invoiceNumber: string;
    bidRate: number;
    bidAmount: number;
  }) => ({
    subject: `New Financing Bid Received - ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CRED<span style="font-weight: normal;">INVOICE</span></h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">New Financing Bid</h2>
          <p style="color: #4b5563;">Hi ${data.buyerName},</p>
          <p style="color: #4b5563;"><strong>${data.financierName}</strong> has placed a bid on your invoice <strong>${data.invoiceNumber}</strong>.</p>

          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Discount Rate:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #7c3aed;">${data.bidRate}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Net Amount:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1f2937;">₹${(data.bidAmount / 100000).toFixed(2)}L</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/invoices"
               style="background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Review Bids
            </a>
          </div>
        </div>
        <div style="padding: 20px; background: #1f2937; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            This is an automated message from CredInvoice. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `New Financing Bid from ${data.financierName}\n\nInvoice: ${data.invoiceNumber}\nRate: ${data.bidRate}%\nAmount: ₹${(data.bidAmount / 100000).toFixed(2)}L\n\nLogin to CredInvoice to review this bid.`
  }),

  paymentDisbursed: (data: {
    recipientName: string;
    invoiceNumber: string;
    amount: number;
    payerName: string;
  }) => ({
    subject: `Payment Received - ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CRED<span style="font-weight: normal;">INVOICE</span></h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: #16a34a; font-size: 30px;">₹</span>
            </div>
          </div>
          <h2 style="color: #1f2937; text-align: center;">Payment Received!</h2>
          <p style="color: #4b5563;">Hi ${data.recipientName},</p>
          <p style="color: #4b5563;">Great news! Payment for invoice <strong>${data.invoiceNumber}</strong> has been processed.</p>

          <div style="background: #dcfce7; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #15803d; margin-bottom: 8px;">Amount Received</p>
            <p style="font-size: 32px; font-weight: bold; color: #15803d; margin: 0;">₹${(data.amount / 100000).toFixed(2)}L</p>
            <p style="color: #166534; margin-top: 8px; font-size: 14px;">from ${data.payerName}</p>
          </div>

          <p style="color: #4b5563;">The funds will be credited to your registered bank account within 1-2 business days.</p>
        </div>
        <div style="padding: 20px; background: #1f2937; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            This is an automated message from CredInvoice. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `Payment Received!\n\nInvoice: ${data.invoiceNumber}\nAmount: ₹${(data.amount / 100000).toFixed(2)}L\nFrom: ${data.payerName}\n\nThe funds will be credited to your registered bank account within 1-2 business days.`
  }),

  repaymentDue: (data: {
    buyerName: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    financierName: string;
    daysUntilDue: number;
  }) => ({
    subject: `Repayment Due ${data.daysUntilDue <= 3 ? 'Soon' : 'Reminder'} - ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CRED<span style="font-weight: normal;">INVOICE</span></h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Repayment ${data.daysUntilDue <= 3 ? 'Due Soon' : 'Reminder'}</h2>
          <p style="color: #4b5563;">Hi ${data.buyerName},</p>
          <p style="color: #4b5563;">This is a reminder about your upcoming repayment for invoice <strong>${data.invoiceNumber}</strong>.</p>

          <div style="background: ${data.daysUntilDue <= 3 ? '#fef2f2' : '#fef3c7'}; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: ${data.daysUntilDue <= 3 ? '#991b1b' : '#92400e'}; margin-bottom: 8px;">Amount Due</p>
            <p style="font-size: 28px; font-weight: bold; color: ${data.daysUntilDue <= 3 ? '#dc2626' : '#d97706'}; margin: 0;">₹${(data.amount / 100000).toFixed(2)}L</p>
            <p style="color: ${data.daysUntilDue <= 3 ? '#991b1b' : '#92400e'}; margin-top: 8px;">
              Due: ${new Date(data.dueDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              <br/><strong>(${data.daysUntilDue} days remaining)</strong>
            </p>
          </div>

          <p style="color: #4b5563;">Repayment to: <strong>${data.financierName}</strong></p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/invoices"
               style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Details
            </a>
          </div>
        </div>
        <div style="padding: 20px; background: #1f2937; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            This is an automated message from CredInvoice. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `Repayment Reminder\n\nInvoice: ${data.invoiceNumber}\nAmount Due: ₹${(data.amount / 100000).toFixed(2)}L\nDue Date: ${data.dueDate}\nTo: ${data.financierName}\n\nPlease ensure timely repayment.`
  }),
};

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isConfigured = true;
      console.log('[EmailService] SMTP configured successfully');
    } else {
      console.log('[EmailService] SMTP not configured - emails will be logged only');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;

    if (!this.isConfigured || !this.transporter) {
      // Log email for development
      console.log('\n=== EMAIL (Dev Mode) ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Text:', text || '(HTML only)');
      console.log('========================\n');
      return true;
    }

    try {
      const mailOptions = {
        from: `"CredInvoice" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || undefined,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);
      return false;
    }
  }

  // Convenience methods
  async sendDiscountOfferReceived(to: string, data: Parameters<typeof emailTemplates.discountOfferReceived>[0]) {
    const template = emailTemplates.discountOfferReceived(data);
    return this.sendEmail({ to, ...template });
  }

  async sendDiscountOfferAccepted(to: string, data: Parameters<typeof emailTemplates.discountOfferAccepted>[0]) {
    const template = emailTemplates.discountOfferAccepted(data);
    return this.sendEmail({ to, ...template });
  }

  async sendDiscountOfferRejected(to: string, data: Parameters<typeof emailTemplates.discountOfferRejected>[0]) {
    const template = emailTemplates.discountOfferRejected(data);
    return this.sendEmail({ to, ...template });
  }

  async sendBidReceived(to: string, data: Parameters<typeof emailTemplates.bidReceived>[0]) {
    const template = emailTemplates.bidReceived(data);
    return this.sendEmail({ to, ...template });
  }

  async sendPaymentDisbursed(to: string, data: Parameters<typeof emailTemplates.paymentDisbursed>[0]) {
    const template = emailTemplates.paymentDisbursed(data);
    return this.sendEmail({ to, ...template });
  }

  async sendRepaymentDue(to: string, data: Parameters<typeof emailTemplates.repaymentDue>[0]) {
    const template = emailTemplates.repaymentDue(data);
    return this.sendEmail({ to, ...template });
  }
}

export const emailService = new EmailService();
