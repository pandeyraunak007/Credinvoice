import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function Privacy() {
  return (
    <PublicLayout>
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-slate-400">Last updated: January 1, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 text-lg mb-8">
              At CredInvoice Technologies Pvt. Ltd. ("CredInvoice", "we", "us", or "our"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>

            <Section title="1. Information We Collect">
              <h4 className="text-lg font-semibold mb-3 text-white">Personal Information</h4>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
                <li>Name, email address, and phone number</li>
                <li>Business information (company name, GSTIN, PAN, registration details)</li>
                <li>KYC documents (identity proof, address proof, business documents)</li>
                <li>Bank account details for payment processing</li>
                <li>Invoice and transaction data</li>
              </ul>

              <h4 className="text-lg font-semibold mb-3 text-white">Automatically Collected Information</h4>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Providing and maintaining our services</li>
                <li>Processing transactions and financing requests</li>
                <li>Verifying identity and conducting KYC/AML checks</li>
                <li>Communicating with you about services, updates, and support</li>
                <li>Improving our platform and developing new features</li>
                <li>Complying with legal obligations and regulatory requirements</li>
                <li>Preventing fraud and ensuring platform security</li>
                <li>Analyzing usage patterns to enhance user experience</li>
              </ul>
            </Section>

            <Section title="3. Information Sharing and Disclosure">
              <p className="mb-4">We may share your information with:</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Service Providers</h4>
              <p className="mb-4">Third-party vendors who assist in operating our platform, including payment processors, cloud hosting providers, and analytics services.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Financing Partners</h4>
              <p className="mb-4">Banks, NBFCs, and other financial institutions participating in our marketplace, to facilitate financing transactions.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Business Partners</h4>
              <p className="mb-4">Other parties on the platform (buyers, sellers) as necessary to complete transactions.</p>

              <h4 className="text-lg font-semibold mb-3 text-white">Legal Requirements</h4>
              <p>We may disclose information when required by law, court order, or government regulations, or to protect our rights and safety.</p>
            </Section>

            <Section title="4. Data Security">
              <p className="mb-4">We implement robust security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Encryption of data in transit and at rest (AES-256)</li>
                <li>Secure access controls and authentication</li>
                <li>Regular security audits and penetration testing</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </Section>

            <Section title="5. Data Retention">
              <p>We retain your information for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations (typically 8 years for financial records)</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records as required by law</li>
              </ul>
            </Section>

            <Section title="6. Your Rights">
              <p className="mb-4">Under applicable data protection laws, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact us at privacy@credinvoice.com</p>
            </Section>

            <Section title="7. Cookies and Tracking">
              <p className="mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Maintain your session and preferences</li>
                <li>Analyze platform usage and performance</li>
                <li>Personalize your experience</li>
                <li>Provide security features</li>
              </ul>
              <p className="mt-4">You can manage cookie preferences through your browser settings.</p>
            </Section>

            <Section title="8. Third-Party Links">
              <p>Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
            </Section>

            <Section title="10. International Data Transfers">
              <p>Your information may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place for such transfers.</p>
            </Section>

            <Section title="11. Changes to This Policy">
              <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
            </Section>

            <Section title="12. Contact Us">
              <p className="mb-4">For questions about this Privacy Policy or our data practices, contact us:</p>
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <p className="text-slate-300"><strong>CredInvoice Technologies Pvt. Ltd.</strong></p>
                <p className="text-slate-400">Email: privacy@credinvoice.com</p>
                <p className="text-slate-400">Address: Mumbai, Maharashtra, India</p>
              </div>
            </Section>

            <Section title="13. Grievance Officer">
              <p className="mb-4">In accordance with Information Technology Act, 2000, our Grievance Officer is:</p>
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <p className="text-slate-300"><strong>Grievance Officer</strong></p>
                <p className="text-slate-400">Email: grievance@credinvoice.com</p>
                <p className="text-slate-400">Response time: Within 30 days of receipt</p>
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
