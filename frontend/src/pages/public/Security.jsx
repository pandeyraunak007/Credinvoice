import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function Security() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            Bank-Grade Security
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Data Security is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Our Priority
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            CredInvoice implements industry-leading security measures to protect your financial data,
            transactions, and business information.
          </p>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔐',
                title: 'End-to-End Encryption',
                desc: 'All data is encrypted using AES-256 encryption both in transit (TLS 1.3) and at rest.',
              },
              {
                icon: '🛡️',
                title: 'Multi-Factor Authentication',
                desc: 'Secure your account with MFA including OTP, authenticator apps, and biometric options.',
              },
              {
                icon: '🔍',
                title: 'Continuous Monitoring',
                desc: '24/7 security monitoring with automated threat detection and response systems.',
              },
              {
                icon: '🏦',
                title: 'Financial-Grade Infrastructure',
                desc: 'Built on enterprise-grade cloud infrastructure meeting banking security standards.',
              },
              {
                icon: '📋',
                title: 'Regular Audits',
                desc: 'Third-party security audits and penetration testing conducted quarterly.',
              },
              {
                icon: '🔄',
                title: 'Automated Backups',
                desc: 'Continuous data backups with geo-redundancy ensuring business continuity.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compliance & Certifications</h2>
            <p className="text-slate-400 text-lg">
              We adhere to the highest regulatory and industry standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🏛️',
                title: 'RBI Guidelines',
                desc: 'Fully aligned with Reserve Bank of India regulations for digital lending and payments',
              },
              {
                icon: '📋',
                title: 'GST Compliant',
                desc: 'Integrated with GST Network for invoice verification and e-Invoice compliance',
              },
              {
                icon: '✅',
                title: 'AML/KYC',
                desc: 'Comprehensive Anti-Money Laundering and Know Your Customer procedures',
              },
              {
                icon: '🔒',
                title: 'ISO 27001',
                desc: 'Information security management following international standards',
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection Details */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">How We Protect Your Data</h2>

              <div className="space-y-6">
                <SecurityDetail
                  title="Encryption at Rest"
                  description="All stored data is encrypted using AES-256, the same standard used by leading banks and financial institutions."
                />
                <SecurityDetail
                  title="Encryption in Transit"
                  description="All communications use TLS 1.3, ensuring data cannot be intercepted during transmission."
                />
                <SecurityDetail
                  title="Access Controls"
                  description="Role-based access control (RBAC) ensures users only see data relevant to their role. All access is logged and auditable."
                />
                <SecurityDetail
                  title="Secure Infrastructure"
                  description="Our platform runs on isolated, hardened infrastructure with multiple layers of firewalls and intrusion detection."
                />
                <SecurityDetail
                  title="Data Segregation"
                  description="Customer data is logically segregated, ensuring your information is isolated from other users."
                />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Security Practices</h2>

              <div className="space-y-6">
                <SecurityDetail
                  title="Vulnerability Management"
                  description="Continuous vulnerability scanning and immediate patching of identified security issues."
                />
                <SecurityDetail
                  title="Penetration Testing"
                  description="Regular third-party penetration testing to identify and address potential vulnerabilities."
                />
                <SecurityDetail
                  title="Incident Response"
                  description="24/7 security team with documented incident response procedures and rapid response capabilities."
                />
                <SecurityDetail
                  title="Employee Training"
                  description="All employees undergo security awareness training and background verification."
                />
                <SecurityDetail
                  title="Vendor Security"
                  description="All third-party vendors are assessed for security compliance before integration."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KYC & Verification */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">KYC & Verification</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every user on our platform undergoes thorough verification to ensure a trusted ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl p-8 border border-blue-500/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                Business Verification
              </h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  GSTIN validation against GST Network
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  PAN verification with Income Tax
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  Business registration verification
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  Bank account validation
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl p-8 border border-emerald-500/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <span className="text-2xl">👤</span>
                Identity Verification
              </h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Aadhaar-based eKYC
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Video KYC for enhanced verification
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Document verification
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Liveness detection
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-8 border border-purple-500/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Ongoing Monitoring
              </h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  Transaction monitoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  Suspicious activity detection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  Periodic re-verification
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  Watchlist screening
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/30 rounded-3xl p-8 md:p-12 border border-slate-700/50">
            <h2 className="text-2xl font-bold mb-4">Responsible Disclosure Program</h2>
            <p className="text-slate-400 mb-6">
              We welcome responsible security researchers who help us maintain the highest security standards.
              If you discover a potential security vulnerability, please report it to us.
            </p>
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
              <p className="text-slate-300 mb-2"><strong>Report vulnerabilities to:</strong></p>
              <p className="text-cyan-400">security@credinvoice.com</p>
            </div>
            <p className="text-slate-400 text-sm">
              We commit to acknowledging your report within 48 hours and keeping you informed
              of remediation progress. Eligible researchers may be recognized in our security hall of fame.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-cyan-600/10 rounded-3xl p-8 md:p-12 border border-emerald-500/20 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Questions About Security?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Our security team is available to answer any questions about our security
              practices and compliance certifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:security@credinvoice.com"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl font-medium hover:bg-slate-100 transition"
              >
                Contact Security Team
              </a>
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl font-medium border border-slate-600 hover:bg-slate-800/50 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function SecurityDetail({ title, description }) {
  return (
    <div className="border-l-2 border-emerald-500/30 pl-4">
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
