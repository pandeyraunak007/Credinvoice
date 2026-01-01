import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <WhyCredInvoice />
      <ProductsSection />
      <HowItWorksFlow />
      <AISection />
      <StakeholderBenefits />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}

// ============ NAVBAR ============
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
            C
          </div>
          <span className="text-xl font-bold">CredInvoice</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#products" className="text-slate-400 hover:text-white transition">Products</a>
          <a href="#how-it-works" className="text-slate-400 hover:text-white transition">How It Works</a>
          <a href="#security" className="text-slate-400 hover:text-white transition">Security</a>
          <a href="#" className="text-slate-400 hover:text-white transition">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-400 hover:text-white transition hidden sm:block">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ============ HERO SECTION ============
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8">
            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">NEW</span>
            <span className="text-sm text-slate-300">Powering Atmanirbhar Bharat 2047</span>
            <span className="text-slate-500">&rarr;</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Turn Invoices into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              Instant Cash
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4">
            Help your suppliers get paid early, improve cash flow across your supply chain,
            and close the <span className="text-white font-semibold">Rs.300B+ MSME credit gap</span>—without complexity.
          </p>

          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10">
            Transparently. Securely. Built for India.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-xl text-lg font-medium hover:shadow-xl hover:shadow-cyan-500/25 transition-all inline-flex items-center justify-center"
            >
              Get Early Access
              <span className="ml-2 group-hover:translate-x-1 inline-block transition">&rarr;</span>
            </Link>
            <button className="px-8 py-4 rounded-xl text-lg font-medium border border-slate-700 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2">
              <span className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-cyan-400">&#9654;</span>
              </span>
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: 'Rs.500Cr+', label: 'Invoice Processed' },
              { value: 'T+1', label: 'Disbursement' },
              { value: '10K+', label: 'MSMEs Served' },
              { value: '2.5%', label: 'Starting Rate' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ TRUST BAR ============
function TrustBar() {
  return (
    <section className="py-8 px-6 border-y border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-16">
        {[
          { icon: '🏛️', label: 'RBI-Aligned' },
          { icon: '📋', label: 'GST-Ready' },
          { icon: '🔒', label: 'Bank-Grade Security' },
          { icon: '✅', label: 'AML Compliant' },
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-2 text-slate-400">
            <span className="text-xl">{badge.icon}</span>
            <span className="text-sm font-medium">{badge.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============ WHY CREDINVOICE ============
function WhyCredInvoice() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Backbone of India
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            MSMEs face 60–120 day payment cycles. Buyers miss early-payment savings.
            Financiers struggle with verified opportunities. We fix this.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '⚡', title: 'Faster Capital', desc: 'T+1 disbursement for MSMEs needing quick working capital', color: 'cyan' },
            { icon: '🤝', title: 'Stronger Relationships', desc: 'Build trust with suppliers through reliable early payments', color: 'emerald' },
            { icon: '📉', title: 'Lower Costs', desc: 'Competitive bidding ensures the best rates for everyone', color: 'blue' },
            { icon: '🔍', title: 'Full Transparency', desc: 'End-to-end visibility across invoices, bids & payments', color: 'purple' },
          ].map((item, i) => (
            <div key={i} className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ PRODUCTS SECTION ============
function ProductsSection() {
  return (
    <section id="products" className="py-20 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
            Three Products &bull; One Platform
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Financing Options
          </h2>
          <p className="text-slate-400 text-lg">
            Choose what works best for your business
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product 1 */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl mb-6">
              💰
            </div>
            <div className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2">Self-Funded</div>
            <h3 className="text-2xl font-bold mb-3">Dynamic Discounting</h3>
            <p className="text-slate-400 mb-6">
              Buyers pay suppliers early from their own treasury and earn attractive discounts.
            </p>
            <ul className="space-y-3 mb-6">
              {['Flexible discounting (fixed or sliding)', 'AI-extracted invoices in seconds', 'Simple 3-step workflow'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-slate-700/50">
              <span className="text-xs text-slate-500">Best for:</span>
              <p className="text-sm text-slate-300 mt-1">Enterprises optimizing working capital</p>
            </div>
          </div>

          {/* Product 2 - Featured */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-3xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition relative lg:-mt-4 lg:mb-0 lg:scale-105 shadow-xl shadow-purple-500/10">
            <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-xs font-medium">
              Popular
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl mb-6">
              🏦
            </div>
            <div className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">Financier-Funded</div>
            <h3 className="text-2xl font-bold mb-3">Early Payment Program</h3>
            <p className="text-slate-400 mb-6">
              Suppliers get paid early by banks/NBFCs while buyers pay later—on the original due date.
            </p>
            <ul className="space-y-3 mb-6">
              {['Multiple financiers compete for best rate', 'No cash outflow for buyers', 'Low-risk returns for financiers'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-purple-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-slate-700/50">
              <span className="text-xs text-slate-500">Best for:</span>
              <p className="text-sm text-slate-300 mt-1">Buyers wanting early-pay benefits without cash strain</p>
            </div>
          </div>

          {/* Product 3 */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl mb-6">
              📋
            </div>
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">GST-Verified</div>
            <h3 className="text-2xl font-bold mb-3">Invoice Financing</h3>
            <p className="text-slate-400 mb-6">
              Upload a GST invoice and receive bids from financiers based on verified receivables.
            </p>
            <ul className="space-y-3 mb-6">
              {['Risk-based transparent pricing', 'GST/e-Invoice validation ready', 'Quick working capital'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-slate-700/50">
              <span className="text-xs text-slate-500">Best for:</span>
              <p className="text-sm text-slate-300 mt-1">MSMEs seeking fast, collateral-light financing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ HOW IT WORKS - INTERACTIVE FLOW ============
function HowItWorksFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [flowType, setFlowType] = useState('self-funded');

  const selfFundedSteps = [
    { actor: 'buyer', icon: '📤', title: 'Upload Invoice', desc: 'Buyer uploads invoice with AI extraction' },
    { actor: 'system', icon: '🤖', title: 'AI Processing', desc: 'Auto-extract data in <30 seconds' },
    { actor: 'seller', icon: '✅', title: 'Seller Accepts', desc: 'Reviews and accepts discount offer' },
    { actor: 'buyer', icon: '💰', title: 'Payment Sent', desc: 'Buyer transfers discounted amount' },
    { actor: 'contract', icon: '📄', title: 'Contract Generated', desc: '2-party agreement auto-created' },
  ];

  const financierSteps = [
    { actor: 'buyer', icon: '📤', title: 'Upload Invoice', desc: 'Buyer uploads invoice with discount terms' },
    { actor: 'seller', icon: '✅', title: 'Seller Accepts', desc: 'Accepts early payment offer' },
    { actor: 'buyer', icon: '📢', title: 'Open Bidding', desc: 'Sent to financier marketplace' },
    { actor: 'financier', icon: '🏦', title: 'Bids Received', desc: 'Financiers compete with rates' },
    { actor: 'buyer', icon: '🤝', title: 'Accept Best Bid', desc: 'Buyer selects winning offer' },
    { actor: 'financier', icon: '💸', title: 'Funds Disbursed', desc: 'T+1 payment to seller' },
    { actor: 'contract', icon: '📄', title: 'Contract Generated', desc: '3-party agreement created' },
  ];

  const steps = flowType === 'self-funded' ? selfFundedSteps : financierSteps;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  useEffect(() => {
    setActiveStep(0);
  }, [flowType]);

  const actorColors = {
    buyer: { bg: 'bg-blue-500', light: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    seller: { bg: 'bg-emerald-500', light: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    financier: { bg: 'bg-orange-500', light: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
    system: { bg: 'bg-cyan-500', light: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    contract: { bg: 'bg-purple-500', light: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  };

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Works
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            End-to-end visibility. No manual follow-ups.
          </p>
        </div>

        {/* Flow Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-800/50 rounded-2xl p-1.5 border border-slate-700/50">
            <button
              onClick={() => setFlowType('self-funded')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                flowType === 'self-funded'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💰 Self-Funded Flow
            </button>
            <button
              onClick={() => setFlowType('financier')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                flowType === 'financier'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏦 Financier-Funded Flow
            </button>
          </div>
        </div>

        {/* Actor Legend */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          {['buyer', 'seller', ...(flowType === 'financier' ? ['financier'] : []), 'system'].map((actor) => (
            <div key={actor} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${actorColors[actor].bg}`}></div>
              <span className="text-sm text-slate-400 capitalize">{actor}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-10 left-0 right-0 h-1 bg-slate-800 rounded-full mx-8">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="relative flex justify-between px-4">
            {steps.map((step, index) => {
              const colors = actorColors[step.actor];
              const isActive = index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => { setActiveStep(index); setIsPlaying(false); }}
                  style={{ width: `${100 / steps.length}%` }}
                >
                  {/* Node */}
                  <div className={`
                    relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl
                    transition-all duration-300 border-2
                    ${isActive
                      ? `${colors.light} ${colors.border} shadow-lg`
                      : 'bg-slate-800/50 border-slate-700'
                    }
                    ${isCurrent ? 'scale-110 ring-4 ring-white/10' : 'group-hover:scale-105'}
                  `}>
                    {step.icon}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping"></div>
                    )}
                  </div>

                  {/* Label */}
                  <div className={`mt-4 text-center transition-colors ${isActive ? 'text-white' : 'text-slate-600'}`}>
                    <p className="text-xs md:text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-1 hidden md:block max-w-20">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Card */}
        <div className="mt-12 flex justify-center">
          <div className={`
            bg-slate-800/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 border max-w-xl w-full
            ${actorColors[steps[activeStep].actor].border}
          `}>
            <div className="flex items-start gap-4 md:gap-6">
              <div className={`
                w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl flex-shrink-0
                ${actorColors[steps[activeStep].actor].light}
              `}>
                {steps[activeStep].icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-500">Step {activeStep + 1} of {steps.length}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${actorColors[steps[activeStep].actor].light} ${actorColors[steps[activeStep].actor].text} capitalize`}>
                    {steps[activeStep].actor}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">{steps[activeStep].title}</h3>
                <p className="text-slate-400">{steps[activeStep].desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setActiveStep(prev => prev > 0 ? prev - 1 : steps.length - 1)}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition"
          >
            &larr;
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 h-10 rounded-xl flex items-center justify-center gap-2 transition ${
              isPlaying ? 'bg-slate-800 border border-slate-700' : 'bg-cyan-600'
            }`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => setActiveStep(prev => (prev + 1) % steps.length)}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition"
          >
            &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}

// ============ AI SECTION ============
function AISection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-6">
              🤖 AI-Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Invoice Extraction That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Just Works
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Upload a PDF or image. Our AI does the rest. Less paperwork, faster decisions, fewer errors.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { value: '85%+', label: 'Field Extraction Accuracy' },
                { value: '<30s', label: 'Processing Time' },
                { value: 'Auto', label: 'GSTIN Validation' },
                { value: '24/7', label: 'Always Available' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">📄</div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                  <span className="text-cyan-400 animate-pulse">&rarr;</span>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-cyan-500/30">
                  <div className="text-xs text-cyan-400 mb-3">✓ Extracted Data</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Invoice #', value: 'INV-2025-001' },
                      { label: 'Amount', value: 'Rs.4,50,000' },
                      { label: 'Seller GSTIN', value: '27AAAC***' },
                      { label: 'Due Date', value: '15 Mar 2025' },
                    ].map((field, i) => (
                      <div key={i}>
                        <div className="text-slate-500 text-xs">{field.label}</div>
                        <div className="text-white font-medium">{field.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ STAKEHOLDER BENEFITS ============
function StakeholderBenefits() {
  const [activeTab, setActiveTab] = useState(0);

  const stakeholders = [
    {
      id: 'buyers',
      label: 'For Buyers',
      icon: '🏢',
      title: 'Large Enterprises',
      benefits: [
        'Capture early-payment discounts',
        'Improve supplier loyalty & retention',
        'Centralize invoice and financing workflows',
        'Real-time visibility into payables',
      ],
    },
    {
      id: 'sellers',
      label: 'For Sellers',
      icon: '🏭',
      title: 'MSMEs',
      benefits: [
        'Get paid in days, not months',
        'Compare bids and choose the best rate',
        'Predictable, digital cash flows',
        'No collateral required',
      ],
    },
    {
      id: 'financiers',
      label: 'For Financiers',
      icon: '🏦',
      title: 'Banks & NBFCs',
      benefits: [
        'Access verified invoices at scale',
        'Transparent risk signals and KYC',
        'Short-term, low-risk lending',
        'Digital-first operations',
      ],
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Every Stakeholder
          </h2>
          <p className="text-slate-400 text-lg">
            Whether you're a buyer, seller, or financier—CredInvoice works for you
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-800/50 rounded-2xl p-1.5 border border-slate-700/50">
            {stakeholders.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === i
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-800/10 rounded-3xl p-8 md:p-12 border border-slate-700/50">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">{stakeholders[activeTab].icon}</span>
            <h3 className="text-2xl font-bold">{stakeholders[activeTab].title}</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {stakeholders[activeTab].benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <span className="text-emerald-400 text-lg">✓</span>
                <span className="text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ SECURITY SECTION ============
function SecuritySection() {
  return (
    <section id="security" className="py-20 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Security, Compliance &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Trust
            </span>
          </h2>
          <p className="text-slate-400 text-lg">Your data is safe with us. Always.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🔐', title: 'Bank-Grade Security', desc: 'Your data is protected with the same security standards used by leading banks' },
            { icon: '🏛️', title: 'RBI-Aligned', desc: 'Built following Reserve Bank of India guidelines and best practices' },
            { icon: '📋', title: 'GST Compliant', desc: 'Seamlessly integrated with GST and e-Invoice systems' },
            { icon: '✅', title: 'Verified Partners', desc: 'All financiers and businesses are thoroughly verified before onboarding' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CTA SECTION ============
function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl p-12 md:p-16 border border-cyan-500/20 overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to modernize your supply chain finance?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Empowering 1 million MSMEs with instant access to working capital by 2028
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                to="/register"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-100 transition shadow-xl inline-block"
              >
                Get Early Access
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl text-lg font-medium border border-slate-600 hover:bg-slate-800/50 transition inline-block"
              >
                Schedule a Demo
              </Link>
            </div>

            <p className="text-slate-500 text-sm">
              Or write to us at{' '}
              <a href="mailto:contact@credinvoice.com" className="text-cyan-400 hover:underline">
                contact@credinvoice.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                C
              </div>
              <span className="text-xl font-bold">CredInvoice</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs mb-4">
              Supply Chain Finance for a Self-Reliant India. Built in India 🇮🇳
            </p>
            <div className="flex gap-4">
              {['X', 'in', '▶'].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition text-sm">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Product', links: ['Dynamic Discounting', 'Invoice Financing', 'API Docs'] },
            { title: 'Company', links: ['About Us', 'Careers', 'Blog'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-slate-400 hover:text-white transition text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; 2025 CredInvoice Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            MSME Invoice Financing &bull; Dynamic Discounting Platform &bull; GST Invoice Financing
          </p>
        </div>
      </div>
    </footer>
  );
}
