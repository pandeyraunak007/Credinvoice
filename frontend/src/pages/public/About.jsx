import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function About() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering India's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              MSME Revolution
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            We're building the financial infrastructure that helps small businesses thrive,
            large enterprises optimize, and financiers find verified opportunities.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-6">
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Closing the Rs.300B+ MSME Credit Gap
              </h2>
              <p className="text-slate-400 text-lg mb-6">
                India's MSMEs are the backbone of the economy, contributing over 30% to GDP and employing
                110+ million people. Yet, they face a massive credit gap that stunts their growth potential.
              </p>
              <p className="text-slate-400 text-lg mb-6">
                Traditional financing is slow, collateral-heavy, and inaccessible. Payment cycles of 60-120 days
                strangle cash flow. We're changing this.
              </p>
              <p className="text-slate-300 text-lg font-medium">
                CredInvoice unlocks trapped working capital by turning unpaid invoices into instant liquidity—
                transparently, securely, and at scale.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '63M+', label: 'MSMEs in India', color: 'cyan' },
                { value: 'Rs.300B+', label: 'Credit Gap', color: 'orange' },
                { value: '60-120', label: 'Days Payment Cycle', color: 'red' },
                { value: '30%', label: 'GDP Contribution', color: 'emerald' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 text-center">
                  <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Vision for 2028</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Empowering 1 million MSMEs with instant access to working capital
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🚀',
                title: 'Atmanirbhar Bharat',
                desc: 'Supporting India\'s vision of self-reliance by strengthening the MSME ecosystem that forms the foundation of our economy.',
              },
              {
                icon: '🌐',
                title: 'Digital-First Finance',
                desc: 'Leveraging AI, automation, and transparent marketplaces to make supply chain finance accessible to all.',
              },
              {
                icon: '🤝',
                title: 'Trust & Transparency',
                desc: 'Building a platform where every transaction is verified, every rate is competitive, and every party benefits.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'Transparency', desc: 'Clear pricing, visible processes, no hidden fees' },
              { icon: '⚡', title: 'Speed', desc: 'T+1 disbursements, instant invoice processing' },
              { icon: '🔒', title: 'Security', desc: 'Bank-grade protection for all transactions' },
              { icon: '🎯', title: 'Simplicity', desc: 'Complex finance made accessible to everyone' },
            ].map((value, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-slate-400 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who We Serve</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🏭',
                title: 'MSMEs & Suppliers',
                color: 'emerald',
                benefits: [
                  'Convert receivables to instant cash',
                  'No collateral requirements',
                  'Competitive financing rates',
                  'Predictable cash flows',
                ],
              },
              {
                icon: '🏢',
                title: 'Large Enterprises',
                color: 'blue',
                benefits: [
                  'Strengthen supplier relationships',
                  'Earn early-payment discounts',
                  'Centralized invoice management',
                  'ESG-friendly supply chains',
                ],
              },
              {
                icon: '🏦',
                title: 'Banks & NBFCs',
                color: 'purple',
                benefits: [
                  'Access verified invoice opportunities',
                  'Transparent risk assessment',
                  'Short-term, low-risk lending',
                  'Digital-first operations',
                ],
              },
            ].map((stakeholder, i) => (
              <div key={i} className={`bg-gradient-to-br from-${stakeholder.color}-500/10 to-transparent rounded-2xl p-8 border border-${stakeholder.color}-500/20`}>
                <div className="text-4xl mb-4">{stakeholder.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{stakeholder.title}</h3>
                <ul className="space-y-3">
                  {stakeholder.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-300">
                      <span className={`text-${stakeholder.color}-400`}>✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Compliance</h2>
            <p className="text-slate-400 text-lg">
              Aligned with Indian regulatory frameworks and global best practices
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: '🏛️', label: 'RBI Guidelines' },
              { icon: '📋', label: 'GST Compliant' },
              { icon: '🔒', label: 'ISO 27001 Standards' },
              { icon: '✅', label: 'AML/KYC Verified' },
              { icon: '📄', label: 'e-Invoice Ready' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800/30 rounded-xl px-6 py-4 border border-slate-700/50">
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-slate-300 font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-cyan-500/20 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Be part of India's supply chain finance transformation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-100 transition"
              >
                Get Started
              </Link>
              <a
                href="mailto:contact@credinvoice.com"
                className="px-8 py-4 rounded-xl text-lg font-medium border border-slate-600 hover:bg-slate-800/50 transition"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
