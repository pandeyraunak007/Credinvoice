import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function Products() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            Three Products &bull; One Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Financing Solutions
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Whether you're a buyer, seller, or financier, CredInvoice has the right solution
            to optimize your working capital and strengthen your supply chain.
          </p>
        </div>
      </section>

      {/* Products Overview */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Dynamic Discounting */}
            <Link to="/products/dynamic-discounting" className="group">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition h-full">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl mb-6">
                  💰
                </div>
                <div className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2">Self-Funded</div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition">Dynamic Discounting</h2>
                <p className="text-slate-400 mb-6">
                  Buyers pay suppliers early from their own treasury and earn attractive discounts.
                  Optimize your cash while strengthening supplier relationships.
                </p>
                <ul className="space-y-3 mb-6">
                  {['Flexible discount terms', 'AI-powered invoice extraction', 'Simple 3-step workflow', 'No third-party financing'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="text-blue-400 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-700/50">
                  <span className="text-blue-400 group-hover:translate-x-2 transition inline-flex items-center gap-2">
                    Learn more &rarr;
                  </span>
                </div>
              </div>
            </Link>

            {/* Invoice Financing */}
            <Link to="/products/invoice-financing" className="group">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition relative h-full lg:-mt-4 lg:scale-105 shadow-xl shadow-emerald-500/10">
                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-300 text-xs font-medium">
                  Popular
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl mb-6">
                  📋
                </div>
                <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">GST-Verified</div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition">Invoice Financing</h2>
                <p className="text-slate-400 mb-6">
                  Upload GST invoices and receive competitive bids from financiers.
                  Get quick working capital with transparent, risk-based pricing.
                </p>
                <ul className="space-y-3 mb-6">
                  {['GST/e-Invoice validation', 'Multiple financier bids', 'Competitive rates', 'No collateral required'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-700/50">
                  <span className="text-emerald-400 group-hover:translate-x-2 transition inline-flex items-center gap-2">
                    Learn more &rarr;
                  </span>
                </div>
              </div>
            </Link>

            {/* Early Payment Program */}
            <div className="group">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-3xl p-8 border border-purple-500/20 h-full">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-3xl mb-6">
                  🏦
                </div>
                <div className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">Financier-Funded</div>
                <h2 className="text-2xl font-bold mb-3">Early Payment Program</h2>
                <p className="text-slate-400 mb-6">
                  Suppliers get paid early by banks/NBFCs while buyers pay on the original due date.
                  Combining the best of both worlds.
                </p>
                <ul className="space-y-3 mb-6">
                  {['No buyer cash outflow', 'Supplier gets immediate payment', 'Financiers earn returns', 'Three-party contract'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-700/50">
                  <span className="text-slate-500 text-sm">
                    Combines Dynamic Discounting + Invoice Financing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare Our Products</h2>
            <p className="text-slate-400">Find the right solution for your business needs</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-blue-400 font-semibold">Dynamic Discounting</th>
                  <th className="text-center py-4 px-4 text-emerald-400 font-semibold">Invoice Financing</th>
                  <th className="text-center py-4 px-4 text-purple-400 font-semibold">Early Payment Program</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Who Funds', dd: 'Buyer', if: 'Financiers', epp: 'Financiers' },
                  { feature: 'Best For', dd: 'Cash-rich Buyers', if: 'MSMEs/Suppliers', epp: 'All Parties' },
                  { feature: 'Buyer Cash Impact', dd: 'Uses Treasury', if: 'None', epp: 'None' },
                  { feature: 'Supplier Benefit', dd: 'Early Payment', if: 'Quick Financing', epp: 'Early Payment' },
                  { feature: 'Contract Type', dd: '2-Party', if: '2-Party', epp: '3-Party' },
                  { feature: 'GST Verification', dd: 'Optional', if: 'Required', epp: 'Required' },
                  { feature: 'Financing Cost', dd: 'Discount to Buyer', if: 'Interest to Financier', epp: 'Split Cost' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-300">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-slate-400">{row.dd}</td>
                    <td className="py-4 px-4 text-center text-slate-400">{row.if}</td>
                    <td className="py-4 px-4 text-center text-slate-400">{row.epp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Who Is It For */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Who Benefits?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center text-4xl">
                🏢
              </div>
              <h3 className="text-xl font-semibold mb-3">Large Enterprises</h3>
              <p className="text-slate-400 mb-4">
                Optimize treasury returns, strengthen supplier relationships,
                and build a more resilient supply chain.
              </p>
              <div className="text-sm text-slate-500">
                Best Products: Dynamic Discounting, Early Payment Program
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl">
                🏭
              </div>
              <h3 className="text-xl font-semibold mb-3">MSMEs & Suppliers</h3>
              <p className="text-slate-400 mb-4">
                Get paid in days instead of months. Access affordable working capital
                without collateral requirements.
              </p>
              <div className="text-sm text-slate-500">
                Best Products: Invoice Financing, Early Payment Program
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center text-4xl">
                🏦
              </div>
              <h3 className="text-xl font-semibold mb-3">Banks & NBFCs</h3>
              <p className="text-slate-400 mb-4">
                Access verified invoice financing opportunities with transparent risk data
                and short-term deployment cycles.
              </p>
              <div className="text-sm text-slate-500">
                Best Products: Invoice Financing, Early Payment Program
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-cyan-500/20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of businesses optimizing their supply chain finance with CredInvoice.
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
