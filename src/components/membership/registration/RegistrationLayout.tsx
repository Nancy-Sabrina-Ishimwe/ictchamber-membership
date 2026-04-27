import React from 'react';
import { Link } from 'react-router-dom';

// ─── RegistrationBanner ──────────────────────────────────────────────────────
export const RegistrationBanner: React.FC = () => (
  <div
    className="relative mb-8 overflow-hidden rounded-sm border border-black/30"
    style={{ background: 'linear-gradient(135deg, #171717 0%, #111111 55%, #1e1e1e 100%)' }}
  >
    {/* Subtle grid texture */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px),
                          repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)`,
      }}
    />
    <div className="relative flex items-center gap-8 px-8 py-6 md:px-10 md:py-7">
      {/* Logo */}
      <div className="flex-shrink-0">
        <img
          src="/ict_chamber_logo-removebg-preview.png"
          alt="ICT Chamber"
          className="h-[120px] w-auto object-contain md:h-[132px]"
        />
      </div>

      {/* Divider */}
      <div className="h-20 w-px self-center bg-white/15" />

      {/* Title */}
      <div className="flex-1">
        <h1
          className="font-black leading-none tracking-tight"
          style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            color: '#F2C94C',
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
          }}
        >
          Official Membership
        </h1>
        <h1
          className="font-black leading-none tracking-tight"
          style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            color: '#F2C94C',
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
          }}
        >
          Registration Form
        </h1>
      </div>
    </div>
  </div>
);

// ─── RegistrationFooter ──────────────────────────────────────────────────────
export const RegistrationFooter: React.FC = () => (
  <footer className="mt-16" style={{ background: '#111111' }}>
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/ict_chamber_logo-removebg-preview.png"
              alt="ICT Chamber Logo"
              className="h-8 w-8 rounded-sm object-contain"
            />
            <div>
              <p className="text-white text-xs font-bold leading-tight">Rwanda ICT Chamber</p>
              <p className="text-white text-xs font-bold leading-tight">Membership</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Empowering the ICT ecosystem in Rwanda through collaboration, advocacy, and capacity building. Join us to shape the digital future.
          </p>
        </div>

        {/* Registration */}
        <div>
          <h4 className="text-[#EF9F27] text-sm font-semibold mb-4">Registration</h4>
          <ul className="space-y-2">
            {['Member Benefits', 'Service Catalog', 'Apply Now'].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors flex items-center gap-1.5">
                  <span className="text-gray-600">›</span> {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Kigali, Rwanda ICT Innovation Center
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              +250 788 000 000
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              membership@ictchamber.rw
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Connect With Us</h4>
          <div className="flex gap-3">
            {['f', 't', 'in'].map((s) => (
              <a key={s} href="#"
                className="w-8 h-8 rounded-sm border border-gray-700 hover:border-[#EF9F27] flex items-center justify-center text-gray-400 hover:text-[#EF9F27] transition-colors text-xs font-bold"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-gray-600 text-xs">© 2026 Rwanda ICT Chamber Membership. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

// ─── Top Nav ─────────────────────────────────────────────────────────────────
export const RegistrationNav: React.FC = () => (
  <nav className="bg-black px-6 py-4 flex items-center justify-between sticky left-5 top-0 z-40">
    <Link to="/member/register" className="flex items-center gap-3" aria-label="Go to registration">
      <img
        src="/ict_chamber_logo-removebg-preview.png"
        alt="ICT Chamber"
        className="h-10 w-10 rounded-sm object-contain"
      />
    </Link>
    <Link
      to="/member/membership-catalog"
      className="bg-[#EF9F27] hover:bg-[#d98e1e] text-white text-sm font-semibold px-6 py-2.5 rounded-sm transition-colors"
    >
      Membership Catalog
    </Link>
  </nav>
);
