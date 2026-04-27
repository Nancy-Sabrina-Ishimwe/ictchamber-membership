import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { usePortalStore } from '../../../store/portalStore';
import { TIER_LABELS } from '../../../types/portal';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    path: '/member/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    path: '/member/requests',
    label: 'My Requests',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7"/>
      </svg>
    ),
  },
  {
    path: '/member/profile',
    label: 'My Profile',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    path: '/member/benefits',
    label: 'My Benefits',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    ),
  },
  {
    path: '/member/payments',
    label: 'Payments',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const location = useLocation();
  const { member } = usePortalStore();

  return (
    <aside className="w-[250px] h-screen flex-shrink-0 bg-[#000000] overflow-hidden flex flex-col">
      {/* Avatar + company */}
      <div className="px-5 pt-3 pb-6 flex flex-col items-center text-center border-b border-white/10">
        <div className="w-16 h-16 rounded-full bg-gray-600 mb-3 overflow-hidden flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <p className="text-white font-bold text-sm leading-tight">{member.companyName}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          Represented by{' '}
          <span className="text-white font-semibold">{member.representedBy}</span>
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-hidden">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[#EAB308] text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/8',
                  ].join(' ')}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Current Tier badge */}
      <div className="px-4 pb-6">
        <div className="border border-[#EF9F27]/40 rounded-sm p-3 bg-[#FEF3C7]/5">
          <p className="text-[#EF9F27] text-[10px] font-bold tracking-widest uppercase mb-1">Current Tier</p>
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm">{TIER_LABELS[member.tier]}</span>
            <svg className="w-4 h-4 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar: React.FC<{ title: string; onToggleSidebar: () => void }> = ({ title, onToggleSidebar }) => {
  const { notifications } = usePortalStore();
  const [search, setSearch] = useState('');

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-sm hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search portal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#EF9F27]/40 focus:border-[#EF9F27] w-48 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-sm hover:bg-gray-100 transition-colors">
          <Bell className="h-4.5 w-4.5 text-gray-600" strokeWidth={2} />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};

// ─── Portal Layout ────────────────────────────────────────────────────────────
interface PortalLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ title, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar menu"
          />
          <div className="relative z-10 h-full w-[250px]">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={title} onToggleSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
