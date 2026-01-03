import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Products', href: '/products' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
  ];

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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`transition ${
                location.pathname === link.href || location.pathname.startsWith(link.href + '/')
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
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

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block text-slate-400 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="block text-slate-400 hover:text-white transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Dynamic Discounting', href: '/products/dynamic-discounting' },
      { label: 'Invoice Financing', href: '/products/invoice-financing' },
      { label: 'Pricing', href: '/pricing' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: 'mailto:contact@credinvoice.com' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  };

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
              Supply Chain Finance for a Self-Reliant India. Built in India
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/credinvoice" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition text-sm">
                X
              </a>
              <a href="https://linkedin.com/company/credinvoice" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition text-sm">
                in
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('mailto:') ? (
                      <a href={link.href} className="text-slate-400 hover:text-white transition text-sm">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-slate-400 hover:text-white transition text-sm">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} CredInvoice Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            MSME Invoice Financing &bull; Dynamic Discounting Platform &bull; GST Invoice Financing
          </p>
        </div>
      </div>
    </footer>
  );
}
