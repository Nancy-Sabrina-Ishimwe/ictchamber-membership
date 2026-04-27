import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../../components/membership/portal/PortalLayout';
import { StatusBadge } from '../../../components/membership/portal/PortalUI';
import { usePortalStore } from '../../../store/portalStore';

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
}> = ({ label, value, suffix, icon, iconBg }) => (
  <div className="bg-white rounded-sm border border-gray-100 p-4 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-none">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}
      </p>
    </div>
  </div>
);

// ─── Activity icon by type ────────────────────────────────────────────────────
const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons: Record<string, React.ReactNode> = {
    request: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    payment: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
    benefit: (
      <svg className="w-4 h-4 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    ),
    document: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    ),
  };
  return (
    <div className="w-7 h-7 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
      {icons[type] ?? icons.request}
    </div>
  );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────
const QuickAction: React.FC<{
  label: string;
  to: string;
  primary?: boolean;
  icon: React.ReactNode;
}> = ({ label, to, primary, icon }) => (
  <Link
    to={to}
    className={[
      'flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium transition-all duration-150',
      primary
        ? 'bg-[#EF9F27] hover:bg-[#d98e1e] text-white'
        : 'bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50',
    ].join(' ')}
  >
    <div className="flex items-center gap-2.5">
      <span className={primary ? 'text-white' : 'text-gray-500'}>{icon}</span>
      {label}
    </div>
    <svg className={`w-4 h-4 ${primary ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
    </svg>
  </Link>
);

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { member, activity, requests, setShowNewRequestModal } = usePortalStore();
  const [dateFilter] = useState('YTD (Jan - Jul)');

  const openCount = requests.filter((r) => r.status === 'in_progress' || r.status === 'pending').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  return (
    <PortalLayout title="Dashboard">
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl font-bold text-gray-900">Welcome to your dashboard</h2>
        <p className="text-gray-500 text-xs mt-0.5">Manage your membership and service requests.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 bg-white border border-gray-100 rounded-sm px-3.5 py-2">
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          Filter
        </button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 border border-gray-200 rounded-sm px-2.5 py-1.5 hover:border-gray-300 transition-colors">
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {dateFilter}
          </button>
          <button className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 border border-gray-200 rounded-sm px-2.5 py-1.5 hover:border-gray-300 transition-colors">
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Select Date
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        <StatCard
          label="Open Requests"
          value={openCount}
          icon={
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
          iconBg="bg-green-50"
        />
        <StatCard
          label="Membership Expiry"
          value={member.daysToExpiry}
          suffix="Days"
          icon={
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          }
          iconBg="bg-red-50"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4">
        {/* Recent Activity */}
        <div className="bg-white rounded-sm border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <Link to="/requests" className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-2.5 py-1 rounded-sm transition-colors">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <ActivityIcon type={item.type} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                  </div>
                </div>
                <div className="self-start sm:self-auto">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-sm border border-gray-100 p-3.5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Quick Actions</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium bg-[#EF9F27] hover:bg-[#d98e1e] text-white transition-all duration-150"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Request Service
                </div>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <QuickAction
                label="View Benefits"
                to="/benefits"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                }
              />
              <QuickAction
                label="Pay / Renew Membership"
                to="/payments"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                }
              />
            </div>
          </div>

          {/* Profile & Settings */}
          <div className="bg-white rounded-sm border border-gray-100 p-3.5">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Profile & Settings</p>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/profile" className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-sm border border-gray-100 hover:border-[#EF9F27]/40 hover:bg-amber-50/20 transition-all group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#EF9F27] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="text-[11px] text-gray-600 group-hover:text-gray-900">Edit Profile</span>
              </Link>
              <Link to="/payments" className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-sm border border-gray-100 hover:border-[#EF9F27]/40 hover:bg-amber-50/20 transition-all group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#EF9F27] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                <span className="text-[11px] text-gray-600 group-hover:text-gray-900">Payments</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
