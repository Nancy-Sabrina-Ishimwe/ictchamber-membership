import React, { useState, useMemo } from 'react';
import { PortalLayout } from '../../../components/membership/portal/PortalLayout';
import { StatusBadge } from '../../../components/membership/portal/PortalUI';
import { usePortalStore } from '../../../store/portalStore';
import type { RequestStatus } from '../../../types/portal';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
  { value: 'pending', label: 'Pending' },
];

export const RequestsPage: React.FC = () => {
  const { requests, setShowNewRequestModal } = usePortalStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.requestId.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  return (
    <PortalLayout title="Request Services">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Service Requests</h2>
          <p className="text-gray-500 text-xs mt-0.5">Track and manage your submitted requests for ICT Chamber services.</p>
        </div>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#EF9F27] hover:bg-[#d98e1e] text-white text-sm font-semibold rounded-sm transition-all active:scale-[0.98] flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by ID or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/30 focus:border-[#EF9F27] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-sm bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/30 focus:border-[#EF9F27] transition-colors appearance-none pr-8 cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button className="flex items-center gap-2 text-xs border border-gray-200 rounded-sm bg-white px-3 py-2 hover:border-gray-300 transition-colors text-gray-600">
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Date Range
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[150px_1fr_140px_130px_140px_72px] gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
          {['Request ID', 'Service Details', 'Submitted Date', 'Status', 'Assigned Officer', 'Actions'].map((h) => (
            <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p className="text-sm text-gray-400">No requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((req) => (
              <div key={req.id}>
                <div className="md:hidden px-4 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-gray-500">{req.requestId}</p>
                      <p className="text-xs font-medium text-gray-900 mt-1">{req.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{req.category}</p>
                    </div>
                    <StatusBadge status={req.status as RequestStatus} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{req.submittedDate}</span>
                    <span>{req.assignedOfficer}</span>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-[150px_1fr_140px_130px_140px_72px] gap-3 px-4 py-3 items-center hover:bg-gray-50/50 transition-colors">
                  <span className="text-xs font-mono text-gray-500">{req.requestId}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{req.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{req.category}</p>
                  </div>
                  <span className="text-xs text-gray-500">{req.submittedDate}</span>
                  <StatusBadge status={req.status as RequestStatus} />
                  <span className="text-xs text-gray-700">{req.assignedOfficer}</span>
                  <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
