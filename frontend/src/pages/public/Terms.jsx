import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function Terms() {
  return (
    <PublicLayout>
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-slate-400">Last updated: January 1, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 text-lg mb-8">
              These Terms of Service ("Terms") govern your access to and use of CredInvoice's platform, services, and website (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
            </p>

            <Section title="1. Acceptance of Terms">
              <p>By registering for an account or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</p>
            </Section>

            <Section title="2. Eligibility">
              <p className="mb-4">To use our Services, you must:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Be at least 18 years of age</li>
                <li>Be a registered business entity in India (for business accounts)</li>
                <li>Have a valid GSTIN (for invoice financing services)</li>
                <li>Complete our KYC verification process</li>
                <li>Not be prohibited from using the Services under applicable laws</li>
              </ul>
            </Section>

            <Section title="3. Account Registration">
              <h4 className="text-lg font-semibold mb-3 text-white">Account Creation</h4>
              <p className="mb-4">You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your account credentials.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Account Security</h4>
              <p className="mb-4">You are responsible for all activities under your account. Notify us immediately of any unauthorized access or security breach.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">One Account Per Entity</h4>
              <p>Each business entity may maintain only one account unless otherwise approved by CredInvoice.</p>
            </Section>

            <Section title="4. Services Description">
              <p className="mb-4">CredInvoice provides a supply chain finance platform that enables:</p>

              <h4 className="text-lg font-semibold mb-3 text-white">For Buyers</h4>
              <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
                <li>Uploading and managing invoices</li>
                <li>Offering early payment discounts to suppliers</li>
                <li>Accessing financier-funded early payment programs</li>
                <li>Managing supplier relationships</li>
              </ul>

              <h4 className="text-lg font-semibold mb-3 text-white">For Sellers/Suppliers</h4>
              <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
                <li>Receiving and accepting discount offers</li>
                <li>Accessing early payment through financing programs</li>
                <li>Uploading invoices for GST-backed financing</li>
                <li>Managing receivables</li>
              </ul>

              <h4 className="text-lg font-semibold mb-3 text-white">For Financiers</h4>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Accessing verified invoice financing opportunities</li>
                <li>Submitting bids on invoices</li>
                <li>Managing financing portfolio</li>
                <li>Receiving repayments</li>
              </ul>
            </Section>

            <Section title="5. User Obligations">
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Provide accurate and truthful information</li>
                <li>Maintain valid business registrations and licenses</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or deceptive practices</li>
                <li>Not upload false or misleading invoices</li>
                <li>Pay all amounts due in a timely manner</li>
                <li>Not circumvent platform controls or processes</li>
                <li>Not use the Services for money laundering or illegal activities</li>
              </ul>
            </Section>

            <Section title="6. Invoice Authenticity">
              <p className="mb-4">By uploading invoices to our platform, you represent and warrant that:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>The invoice represents a genuine business transaction</li>
                <li>The goods or services have been delivered</li>
                <li>The invoice has not been previously financed or assigned</li>
                <li>You have the right to finance the invoice</li>
                <li>All information on the invoice is accurate</li>
              </ul>
            </Section>

            <Section title="7. Fees and Payments">
              <h4 className="text-lg font-semibold mb-3 text-white">Platform Fees</h4>
              <p className="mb-4">Fees for using our Services are disclosed on the platform and may include transaction fees, processing fees, and subscription fees. All fees are exclusive of applicable taxes.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Financing Costs</h4>
              <p className="mb-4">Interest rates, discount rates, and financing fees are determined by market conditions and financier bids. These are disclosed before you accept any financing arrangement.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Payment Terms</h4>
              <p>All payments must be made through designated payment methods. Late payments may incur additional charges.</p>
            </Section>

            <Section title="8. Intellectual Property">
              <p className="mb-4">All intellectual property rights in the Services, including software, designs, trademarks, and content, are owned by CredInvoice or its licensors. You are granted a limited, non-exclusive license to use the Services for their intended purpose.</p>
              <p>You may not:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Copy, modify, or distribute our software</li>
                <li>Reverse engineer or decompile our systems</li>
                <li>Use our trademarks without permission</li>
                <li>Scrape or extract data from our platform</li>
              </ul>
            </Section>

            <Section title="9. Disclaimers">
              <h4 className="text-lg font-semibold mb-3 text-white">Platform Role</h4>
              <p className="mb-4">CredInvoice operates as a marketplace connecting buyers, sellers, and financiers. We are not a party to the financing transactions and do not guarantee the performance of any party.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">No Financial Advice</h4>
              <p className="mb-4">Information provided on our platform is for informational purposes only and does not constitute financial, legal, or tax advice.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Service Availability</h4>
              <p>We strive for continuous availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue Services with reasonable notice.</p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p className="mb-4">To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>CredInvoice shall not be liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the fees paid by you in the preceding 12 months</li>
                <li>We are not liable for losses arising from third-party actions, including buyer or financier default</li>
                <li>We are not responsible for losses due to circumstances beyond our control</li>
              </ul>
            </Section>

            <Section title="11. Indemnification">
              <p>You agree to indemnify and hold harmless CredInvoice, its officers, employees, and agents from any claims, damages, or expenses arising from your use of the Services, violation of these Terms, or infringement of any third-party rights.</p>
            </Section>

            <Section title="12. Termination">
              <h4 className="text-lg font-semibold mb-3 text-white">By You</h4>
              <p className="mb-4">You may terminate your account at any time by contacting support. Outstanding obligations remain payable.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">By Us</h4>
              <p className="mb-4">We may suspend or terminate your account for:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>Extended inactivity</li>
                <li>Any other reason at our discretion with notice</li>
              </ul>
            </Section>

            <Section title="13. Dispute Resolution">
              <h4 className="text-lg font-semibold mb-3 text-white">Governing Law</h4>
              <p className="mb-4">These Terms are governed by the laws of India.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Arbitration</h4>
              <p className="mb-4">Any disputes shall be resolved through arbitration in Mumbai, India, in accordance with the Arbitration and Conciliation Act, 1996.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Jurisdiction</h4>
              <p>Subject to arbitration, courts in Mumbai shall have exclusive jurisdiction.</p>
            </Section>

            <Section title="14. Modifications">
              <p>We may modify these Terms at any time. Material changes will be notified via email or platform notification at least 30 days before taking effect. Continued use after changes constitutes acceptance.</p>
            </Section>

            <Section title="15. General Provisions">
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and CredInvoice</li>
                <li><strong>Severability:</strong> If any provision is invalid, the remaining provisions remain in effect</li>
                <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver</li>
                <li><strong>Assignment:</strong> You may not assign your rights without our consent</li>
                <li><strong>Notices:</strong> Notices will be sent to the email address on your account</li>
              </ul>
            </Section>

            <Section title="16. Contact Information">
              <p className="mb-4">For questions about these Terms:</p>
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <p className="text-slate-300"><strong>CredInvoice Technologies Pvt. Ltd.</strong></p>
                <p className="text-slate-400">Email: legal@credinvoice.com</p>
                <p className="text-slate-400">Address: Mumbai, Maharashtra, India</p>
              </div>
            </Section>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="text-slate-300 space-y-4">{children}</div>
    </div>
  );
}
