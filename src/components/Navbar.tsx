import React, { useState, useEffect } from 'react';
import { ShreeLogo } from './ShreeLogo';

interface NavbarProps {
  onOpenBooking: (preferredService?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Journey', href: '#approach' },
    { label: 'About', href: '#about' },
    { label: 'Specialists', href: '#specialists' },
    { label: 'Resources', href: '#resources' }
  ];

  const mobileNavLinks = [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#services' },
    { label: 'Our Approach', href: '#approach' },
    { label: 'About', href: '#about' },
    { label: 'Specialists', href: '#specialists' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#f7f4ec]/85 backdrop-blur-[18px] border-b border-[#123f48]/10 shadow-[0_4px_24px_rgba(11,48,55,0.05)] py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* LEFT: SHREE Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-[#d9ae4a] rounded-lg"
            aria-label="SHREE Homepage"
          >
            <ShreeLogo variant="navbar" theme="dark" />
          </a>

          {/* CENTER: Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-medium font-body text-[#12333a]/85"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative py-1 hover:text-[#0b3037] transition-colors whitespace-nowrap group focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#d9ae4a] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* RIGHT: Deep Teal Pill Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-bold font-heading text-[#f7f4ec] bg-[#0b3037] hover:bg-[#123f48] active:scale-[0.98] rounded-full transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
            >
              Book Appointment
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#0b3037] hover:bg-black/5 rounded-lg focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN MOBILE OVERLAY (Section 11) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0b3037] text-[#f7f4ec] flex flex-col justify-between p-8 md:hidden overflow-y-auto"
          aria-label="Mobile Navigation Menu"
        >
          {/* Top Bar with Logo & Close */}
          <div className="flex items-center justify-between pb-6 border-b border-[#f7f4ec]/15">
            <ShreeLogo variant="navbar" theme="light" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-[#123f48] flex items-center justify-center text-[#f7f4ec] text-lg font-bold"
              aria-label="Close Mobile Navigation"
            >
              ✕
            </button>
          </div>

          {/* Sequential Staggered Navigation Links */}
          <nav className="my-auto py-10 flex flex-col space-y-6">
            {mobileNavLinks.map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-[#f7f4ec] hover:text-[#d9ae4a] transition-all transform duration-300"
                style={{
                  transitionDelay: `${idx * 70}ms`
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Bottom Cream Action Button & Decorative Gold/Green Flourish */}
          <div className="pt-6 border-t border-[#f7f4ec]/15">
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-[#d9ae4a]">
              <span className="w-2 h-2 rounded-full bg-[#6c9f36]" />
              <span>CARE · PATH · RECOVERY</span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-4 text-base font-heading font-bold text-center text-[#0b3037] bg-[#f7f4ec] hover:bg-[#eee9dc] rounded-full shadow-xl transition-transform active:scale-98"
            >
              Book Appointment →
            </button>
          </div>
        </div>
      )}
    </>
  );
};
