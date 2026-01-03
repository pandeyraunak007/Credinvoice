import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('buyer');

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Pay only for what you use. No hidden fees, no surprises.
            Start free and scale as you grow.
          </p>
        </div>
      </section>

      {/* Role Selector */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-800/50 rounded-2xl p-1.5 border border-slate-700/50">
              {[
                { id: 'buyer', label: 'For Buyers', icon: '🏢' },
                { id: 'seller', label: 'For Sellers', icon: '🏭' },
                { id: 'financier', label: 'For Financiers', icon: '🏦' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'buyer' && <BuyerPricing />}
          {activeTab === 'seller' && <SellerPricing />}
          {activeTab === 'financier' && <FinancierPricing />}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">All Plans Include</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤖', title: 'AI Invoice Extraction', desc: 'Automatic data extraction from PDFs and images' },
              { icon: '🔒', title: 'Bank-Grade Security', desc: 'AES-256 encryption and SOC 2 compliance' },
              { icon: '📊', title: 'Real-Time Dashboard', desc: 'Track all transactions and analytics' },
              { icon: '📧', title: 'Email Notifications', desc: 'Instant alerts for all activities' },
              { icon: '📱', title: 'Mobile Responsive', desc: 'Access from any device, anywhere' },
              { icon: '📄', title: 'Auto Contracts', desc: 'Legal agreements generated automatically' },
              { icon: '🔗', title: 'API Access', desc: 'Integrate with your existing systems' },
              { icon: '💬', title: 'Email Support', desc: 'Get help when you need it' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans start with a free tier that allows you to explore the platform. Upgrade when you\'re ready to scale.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept bank transfers, UPI, and card payments. For enterprise plans, we can set up invoiced billing.',
              },
              {
                q: 'Can I change plans later?',
                a: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect from the next billing cycle.',
              },
              {
                q: 'Are there any hidden fees?',
                a: 'No. The pricing shown includes all platform fees. Transaction fees are separate and clearly displayed before each transaction.',
              },
              {
                q: 'What about financing costs?',
                a: 'Financing costs (interest, discounts) are determined by the market through competitive bidding. Platform fees are separate from financing costs.',
              },
              {
                q: 'Do you offer custom enterprise pricing?',
                a: 'Yes. For high-volume users or specific requirements, contact us for a customized pricing package.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-cyan-500/20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Start free and upgrade as your business grows.
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-100 transition"
              >
                Start Free
              </Link>
              <a
                href="mailto:sales@credinvoice.com"
                className="px-8 py-4 rounded-xl text-lg font-medium border border-slate-600 hover:bg-slate-800/50 transition"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function BuyerPricing() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <PricingCard
        title="Starter"
        price="Free"
        period=""
        description="For businesses getting started with supply chain finance"
        features={[
          'Up to 10 invoices/month',
          'AI invoice extraction',
          'Basic analytics',
          'Email support',
          '1 user',
        ]}
        cta="Get Started"
        popular={false}
      />
      <PricingCard
        title="Growth"
        price="Rs.4,999"
        period="/month"
        description="For growing businesses with regular financing needs"
        features={[
          'Up to 100 invoices/month',
          'Advanced analytics',
          'Priority support',
          'API access',
          'Up to 5 users',
          'ERP integrations',
        ]}
        cta="Start Free Trial"
        popular={true}
      />
      <PricingCard
        title="Enterprise"
        price="Custom"
        period=""
        description="For large enterprises with high volume requirements"
        features={[
          'Unlimited invoices',
          'Dedicated account manager',
          'Custom integrations',
          'SLA guarantees',
          'Unlimited users',
          'On-premise option',
          'Custom workflows',
        ]}
        cta="Contact Sales"
        popular={false}
      />
    </div>
  );
}

function SellerPricing() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <PricingCard
        title="Starter"
        price="Free"
        period=""
        description="For MSMEs exploring invoice financing"
        features={[
          'Up to 5 invoices/month',
          'Access to all financiers',
          'Basic dashboard',
          'Email support',
          '1 user',
        ]}
        cta="Get Started"
        popular={false}
      />
      <PricingCard
        title="Growth"
        price="Rs.2,499"
        period="/month"
        description="For businesses with regular financing needs"
        features={[
          'Up to 50 invoices/month',
          'Priority bid matching',
          'Advanced analytics',
          'Priority support',
          'Up to 3 users',
          'Bulk upload',
        ]}
        cta="Start Free Trial"
        popular={true}
      />
      <PricingCard
        title="Scale"
        price="Rs.7,999"
        period="/month"
        description="For high-growth businesses"
        features={[
          'Unlimited invoices',
          'Dedicated relationship manager',
          'API access',
          'Custom reporting',
          'Unlimited users',
          'ERP integrations',
        ]}
        cta="Contact Sales"
        popular={false}
      />
    </div>
  );
}

function FinancierPricing() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <PricingCard
        title="Basic"
        price="Free"
        period=""
        description="For financiers exploring the platform"
        features={[
          'Access to marketplace',
          'Up to 10 bids/month',
          'Basic due diligence data',
          'Email support',
          '1 user',
        ]}
        cta="Get Started"
        popular={false}
      />
      <PricingCard
        title="Professional"
        price="Rs.9,999"
        period="/month"
        description="For active financiers"
        features={[
          'Unlimited bids',
          'Advanced risk analytics',
          'Priority deal flow',
          'API access',
          'Up to 5 users',
          'Custom alerts',
        ]}
        cta="Start Free Trial"
        popular={true}
      />
      <PricingCard
        title="Institutional"
        price="Custom"
        period=""
        description="For banks and large NBFCs"
        features={[
          'White-label option',
          'Dedicated API infrastructure',
          'Custom integrations',
          'Dedicated support',
          'Unlimited users',
          'Regulatory reporting',
          'On-premise deployment',
        ]}
        cta="Contact Sales"
        popular={false}
      />
    </div>
  );
}

function PricingCard({ title, price, period, description, features, cta, popular }) {
  return (
    <div className={`relative bg-slate-800/30 rounded-3xl p-8 border ${
      popular ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-slate-700/50'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-slate-400">{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-300">
            <span className="text-emerald-400 mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to={cta === 'Contact Sales' ? '#' : '/register'}
        onClick={cta === 'Contact Sales' ? (e) => { e.preventDefault(); window.location.href = 'mailto:sales@credinvoice.com'; } : undefined}
        className={`block w-full py-3 rounded-xl font-medium text-center transition ${
          popular
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90'
            : 'bg-slate-700 hover:bg-slate-600'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
