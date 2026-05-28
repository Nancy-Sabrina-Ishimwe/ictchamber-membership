import React from 'react';
import { Link } from 'react-router-dom';

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2H21l-6.572 7.51L22.157 22H16.1l-4.744-6.22L5.91 22H3.15l7.03-8.03L2 2h6.21l4.29 5.67L18.244 2Zm-.967 18h1.527L7.38 3.895H5.74L17.277 20Z" />
  </svg>
);
const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1s2.49 1.12 2.49 2.5ZM.5 8h4V23h-4V8Zm7 0h3.83v2.05h.05c.53-1.01 1.83-2.08 3.77-2.08 4.03 0 4.77 2.65 4.77 6.09V23h-4v-7.86c0-1.88-.03-4.3-2.62-4.3-2.63 0-3.04 2.05-3.04 4.17V23h-4V8Z" />
  </svg>
);
const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm8.5 1.8h-8.5A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Zm5.35-2.24a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
  </svg>
);
const YoutubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-4.8ZM9.6 15.2V8.8L15.8 12l-6.2 3.2Z" />
  </svg>
);
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4V11H8v3h2.1v8h3.4Z" />
  </svg>
);

const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/rwictchamber', Icon: XIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/rwanda-ict-chamber', Icon: LinkedinIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/rwictchamber250/', Icon: InstagramIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@rwandaictchamber1847', Icon: YoutubeIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/Fictchamberrw', Icon: FacebookIcon },
];

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
              +250 793 902 451
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              info@ictchamber.rw
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Connect With Us</h4>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit Rwanda ICT Chamber on ${social.label}`}
                className="w-8 h-8 rounded-sm border border-gray-700 hover:border-[#EF9F27] flex items-center justify-center text-gray-400 hover:text-[#EF9F27] transition-colors text-xs font-bold"
              >
                <social.Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-gray-600 text-xs">© 2026 Rwanda ICT Chamber Membership. All rights reserved.</p>
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
