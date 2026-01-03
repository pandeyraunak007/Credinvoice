import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function InvoiceFinancing() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
                📋 GST-Verified Financing
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Invoice{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Financing
                </span>
              </h1>
              <p className="text-xl text-slate-400 mb-8">
                Turn your GST invoices into immediate working capital.
                Multiple financiers compete to give you the best rates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 rounded-xl text-lg font-medium hover:opacity-90 transition text-center"
                >
                  Get Funded Now
                </Link>
                <Link
                  to="/blog/gst-invoice-financing-guide"
                  className="px-8 py-4 rounded-xl text-lg font-medium border border-slate-700 hover:bg-slate-800/50 transition text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '80-90%', label: 'Advance Rate', color: 'emerald' },
                    { value: '24-48h', label: 'Funding Time', color: 'teal' },
                    { value: '12-24%', label: 'APR Range', color: 'cyan' },
                    { value: 'Rs.50K+', label: 'Min Invoice', color: 'blue' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Invoice Financing Works</h2>
            <p className="text-slate-400 text-lg">From upload to funding in 24-48 hours</p>
          </div>

          <div className="grid md:grid-cols-6 gap-4">
            {[
              { step: '1', icon: '📤', title: 'Upload Invoice', desc: 'Submit your GST invoice' },
              { step: '2', icon: '✅', title: 'Verification', desc: 'GST & buyer validated' },
              { step: '3', icon: '🏦', title: 'Bids Open', desc: 'Financiers submit offers' },
              { step: '4', icon: '🎯', title: 'Select Best', desc: 'Choose your preferred bid' },
              { step: '5', icon: '💸', title: 'Get Funded', desc: 'Receive advance payment' },
              { step: '6', icon: '🔄', title: 'Settlement', desc: 'Buyer pays on due date' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 text-center h-full">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mx-auto mb-3 text-sm">
                    {item.step}
                  </div>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GST Advantage */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                The GST{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Advantage
                </span>
              </h2>
              <p className="text-slate-400 text-lg mb-6">
                GST registration provides a trusted foundation for invoice financing.
                Government-verified invoices mean lower risk and better rates.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Verified Transactions',
                    desc: 'GST invoices confirm genuine business activity between registered entities.',
                  },
                  {
                    title: 'Digital Trail',
                    desc: 'Complete transaction history available through GST Network data.',
                  },
                  {
                    title: 'Lower Risk = Better Rates',
                    desc: 'Financiers offer competitive rates for verified, lower-risk invoices.',
                  },
                  {
                    title: 'e-Invoice Ready',
                    desc: 'Support for e-Invoice integration for seamless validation.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-400 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50">
              <h4 className="font-semibold mb-6 text-center">Eligibility Requirements</h4>
              <div className="space-y-4">
                {[
                  { icon: '📋', text: 'Active GSTIN for 12+ months' },
                  { icon: '✅', text: 'Regular GST return filing' },
                  { icon: '🏢', text: 'Registered business entity' },
                  { icon: '📄', text: 'Valid, unpaid GST invoices' },
                  { icon: '💰', text: 'Invoice value Rs.50,000+' },
                  { icon: '🔐', text: 'Complete KYC verification' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Bidding */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Competitive Bidding = Better Rates</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Multiple banks and NBFCs compete for your invoices,
              driving down costs and giving you the best possible terms.
            </p>
          </div>

          <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center text-3xl">
                  🏦
                </div>
                <h3 className="font-semibold mb-2">Multiple Financiers</h3>
                <p className="text-slate-400 text-sm">
                  Banks, NBFCs, and institutional lenders all competing for your business.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-3xl">
                  📊
                </div>
                <h3 className="font-semibold mb-2">Transparent Comparison</h3>
                <p className="text-slate-400 text-sm">
                  See all bids side-by-side with clear breakdown of rates and fees.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl">
                  ✨
                </div>
                <h3 className="font-semibold mb-2">Best Terms Win</h3>
                <p className="text-slate-400 text-sm">
                  You choose the offer that works best for your business needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for MSMEs */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for MSMEs</h2>
            <p className="text-slate-400 text-lg">
              Addressing the Rs.300B+ credit gap with accessible, collateral-light financing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🚀',
                title: 'Quick Access',
                desc: 'From application to funding in 24-48 hours, not weeks.',
              },
              {
                icon: '🔓',
                title: 'No Collateral',
                desc: 'Your invoice is the security. No property or assets required.',
              },
              {
                icon: '📈',
                title: 'Scales With You',
                desc: 'Financing capacity grows automatically as your sales increase.',
              },
              {
                icon: '🤝',
                title: 'Relationship Intact',
                desc: 'Your buyer relationship remains unchanged. They pay on normal terms.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Example */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Understand the Costs</h2>
            <p className="text-slate-400 text-lg">Transparent pricing with no hidden fees</p>
          </div>

          <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-slate-300">Example Invoice</h4>
                <div className="space-y-3 text-slate-400">
                  <div className="flex justify-between">
                    <span>Invoice Value:</span>
                    <span className="text-white">Rs.10,00,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Term:</span>
                    <span className="text-white">60 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Advance Rate:</span>
                    <span className="text-white">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="text-white">1.5% per month</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-slate-300">Cost Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Advance Amount:</span>
                    <span className="text-emerald-400 font-semibold">Rs.8,00,000</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Interest (60 days):</span>
                    <span className="text-white">Rs.24,000</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Processing Fee (0.5%):</span>
                    <span className="text-white">Rs.5,000</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-3 mt-3">
                    <span className="text-white font-semibold">You Receive:</span>
                    <span className="text-emerald-400 font-bold text-xl">Rs.7,71,000</span>
                  </div>
                  <div className="text-sm text-slate-500 text-right">
                    Effective APR: ~21.75%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Financiers */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl p-8 md:p-12 border border-purple-500/20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
                  For Financiers
                </div>
                <h2 className="text-3xl font-bold mb-6">
                  Access Verified Opportunities
                </h2>
                <p className="text-slate-400 text-lg mb-6">
                  CredInvoice gives banks and NBFCs access to a curated pipeline
                  of GST-verified invoices with transparent risk data.
                </p>
                <ul className="space-y-3">
                  {[
                    'GST-verified genuine transactions',
                    'Complete buyer creditworthiness data',
                    'Short-term deployment (30-90 days)',
                    'Digital-first operations',
                    'Portfolio diversification',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <span className="text-purple-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">🏦</div>
                <Link
                  to="/register"
                  className="inline-block bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-xl font-medium transition"
                >
                  Join as Financier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-transparent rounded-3xl p-12 border border-emerald-500/20 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Unlock Your Invoice Value Today
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Stop waiting 60-90 days for payment. Convert your invoices into
              immediate working capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-100 transition"
              >
                Get Funded Now
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 rounded-xl text-lg font-medium border border-slate-600 hover:bg-slate-800/50 transition"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
