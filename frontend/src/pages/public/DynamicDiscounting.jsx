import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function DynamicDiscounting() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                💰 Self-Funded Solution
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Dynamic{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Discounting
                </span>
              </h1>
              <p className="text-xl text-slate-400 mb-8">
                Turn your idle cash into attractive returns while helping suppliers get paid early.
                A win-win for your entire supply chain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 rounded-xl text-lg font-medium hover:opacity-90 transition text-center"
                >
                  Start Now
                </Link>
                <Link
                  to="/blog/what-is-dynamic-discounting"
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
                    { value: '15-30%', label: 'Annualized Returns', color: 'blue' },
                    { value: 'T+1', label: 'Payment Speed', color: 'cyan' },
                    { value: '0%', label: 'Default Risk', color: 'emerald' },
                    { value: '100%', label: 'Cash Utilization', color: 'purple' },
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
            <h2 className="text-3xl font-bold mb-4">How Dynamic Discounting Works</h2>
            <p className="text-slate-400 text-lg">Simple, transparent, effective</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '1', icon: '📤', title: 'Upload Invoice', desc: 'Buyer uploads invoice with AI extraction' },
              { step: '2', icon: '💵', title: 'Set Discount', desc: 'Define discount terms (fixed or sliding)' },
              { step: '3', icon: '📧', title: 'Notify Supplier', desc: 'Supplier receives the offer' },
              { step: '4', icon: '✅', title: 'Accept Offer', desc: 'Supplier accepts early payment' },
              { step: '5', icon: '💰', title: 'Get Paid', desc: 'Funds transferred, contract generated' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-slate-600">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Buyers */}
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl p-8 border border-blue-500/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">🏢</span>
                For Buyers
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Attractive Returns on Cash',
                    desc: 'Earn 15-30% annualized returns on idle treasury instead of minimal bank interest.',
                  },
                  {
                    title: 'Strengthen Supplier Relationships',
                    desc: 'Build loyalty and priority treatment by supporting supplier cash flow.',
                  },
                  {
                    title: 'Supply Chain Resilience',
                    desc: 'Financially healthy suppliers mean fewer disruptions and better service.',
                  },
                  {
                    title: 'Flexible Deployment',
                    desc: 'Use excess cash productively with full control over timing and amounts.',
                  },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-slate-400 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Suppliers */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl p-8 border border-emerald-500/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">🏭</span>
                For Suppliers
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Faster Cash Flow',
                    desc: 'Get paid in days instead of waiting 60-90 days for standard payment terms.',
                  },
                  {
                    title: 'Lower Cost Than Financing',
                    desc: 'Discount costs are typically lower than bank loans or factoring fees.',
                  },
                  {
                    title: 'No Debt Added',
                    desc: 'Early payment doesn\'t add liabilities—it\'s an accelerated receivable.',
                  },
                  {
                    title: 'Optional Participation',
                    desc: 'Accept offers when you need cash, wait for full payment when you don\'t.',
                  },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-400 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-slate-400 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discount Calculator */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See the Returns</h2>
            <p className="text-slate-400 text-lg">
              Example: 2% discount for 50 days early payment
            </p>
          </div>

          <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-slate-300">Scenario</h4>
                <div className="space-y-3 text-slate-400">
                  <div className="flex justify-between">
                    <span>Invoice Amount:</span>
                    <span className="text-white">Rs.10,00,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Original Payment Term:</span>
                    <span className="text-white">60 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Early Payment Date:</span>
                    <span className="text-white">Day 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount Offered:</span>
                    <span className="text-white">2%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-slate-300">Results</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Buyer Pays:</span>
                    <span className="text-blue-400 font-semibold">Rs.9,80,000</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Buyer Savings:</span>
                    <span className="text-emerald-400 font-semibold">Rs.20,000</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Days Early:</span>
                    <span className="text-white">50 days</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-3 mt-3">
                    <span className="text-white font-semibold">Annualized Return:</span>
                    <span className="text-cyan-400 font-bold text-xl">14.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI Invoice Extraction', desc: 'Upload PDFs or images. Our AI extracts all data in seconds.' },
              { icon: '📊', title: 'Sliding Scale Discounts', desc: 'Set dynamic rates that adjust based on payment timing.' },
              { icon: '📱', title: 'Real-Time Notifications', desc: 'Instant alerts for offers, acceptances, and payments.' },
              { icon: '📄', title: 'Auto-Generated Contracts', desc: 'Legal agreements created automatically for every transaction.' },
              { icon: '📈', title: 'Analytics Dashboard', desc: 'Track returns, participation rates, and supplier metrics.' },
              { icon: '🔗', title: 'ERP Integration', desc: 'Connect with SAP, Oracle, Tally, and other systems.' },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-transparent rounded-3xl p-12 border border-blue-500/20 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Start Earning Returns on Your Cash
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Set up your first dynamic discounting program in minutes.
              No complex integration required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-100 transition"
              >
                Get Started Free
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
