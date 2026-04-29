import React, { useEffect, useMemo, useState } from 'react';
import { PortalLayout } from '../../../components/membership/portal/PortalLayout';
import { StatusBadge } from '../../../components/membership/portal/PortalUI';
import type { RequestStatus } from '../../../types/portal';
import { api } from '../../../lib/api';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
  { value: 'pending', label: 'Pending' },
];

export const RequestsPage: React.FC = () => {
  const [services, setServices] = useState<Array<{ id: number; serviceName: string }>>([]);
  const [serviceSubtypes, setServiceSubtypes] = useState<Array<{ id: number; name: string; serviceId: number }>>([]);
  const [requests, setRequests] = useState<Array<{
    id: string;
    requestId: string;
    title: string;
    category: string;
    submittedDate: string;
    submittedAt: string;
    status: RequestStatus;
    assignedOfficer: string;
    serviceCategoryId: number;
    serviceSubtypeId: number;
    detailedDescription: string;
    preferredContactMethod: string;
    preferredDeliveryDate: string;
    priorityLevel: string;
  }>>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    serviceCategoryId: '',
    serviceSubtypeId: '',
    requestTitle: '',
    detailedDescription: '',
    preferredContactMethod: 'Email',
    preferredDeliveryDate: '',
    priorityLevel: 'MEDIUM',
  });
  const [selectedRequest, setSelectedRequest] = useState<{
    id: string;
    requestId: string;
    title: string;
    category: string;
    submittedDate: string;
    submittedAt: string;
    status: RequestStatus;
    assignedOfficer: string;
    serviceCategoryId: number;
    serviceSubtypeId: number;
    detailedDescription: string;
    preferredContactMethod: string;
    preferredDeliveryDate: string;
    priorityLevel: string;
  } | null>(null);
  const [editingRequest, setEditingRequest] = useState<{
    id: string;
    requestId: string;
    title: string;
    category: string;
    submittedDate: string;
    submittedAt: string;
    status: RequestStatus;
    assignedOfficer: string;
    serviceCategoryId: number;
    serviceSubtypeId: number;
    detailedDescription: string;
    preferredContactMethod: string;
    preferredDeliveryDate: string;
    priorityLevel: string;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    requestTitle: '',
    serviceCategoryId: '',
    serviceSubtypeId: '',
    detailedDescription: '',
    preferredContactMethod: 'Email',
    preferredDeliveryDate: '',
    priorityLevel: 'MEDIUM',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const [mineResponse, optionsResponse] = await Promise.all([
          api.get<{
            success: boolean;
            data: Array<{
              id: number;
              requestTitle: string;
              status: 'REQUESTED' | 'DELIVERED';
              createdAt: string;
              serviceCategory: { id: number; categoryName: string };
              serviceSubtype: { id: number; name: string };
              benefittingMember?: { companyName: string } | null;
            }>;
          }>('/service-requests/mine'),
          api.get<{
            success: boolean;
            data: {
              services: Array<{ id: number; serviceName: string }>;
              subtypes: Array<{ id: number; name: string; serviceId: number }>;
            };
          }>('/service-requests/options'),
        ]);

        setServices(mineOrEmpty(optionsResponse.data.data?.services));
        setServiceSubtypes(
          mineOrEmpty(optionsResponse.data.data?.subtypes).map((item) => ({
            id: item.id,
            name: item.name,
            serviceId: item.serviceId,
          })),
        );
        setRequests(
          mineOrEmpty(mineResponse.data.data).map((item) => ({
            id: String(item.id),
            requestId: `REQ-${item.id}`,
            title: item.requestTitle,
            category: `${item.serviceCategory.categoryName} / ${item.serviceSubtype.name}`,
            submittedAt: item.createdAt,
            submittedDate: new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date(item.createdAt)),
            status: item.status === 'DELIVERED' ? 'completed' : 'pending',
            assignedOfficer: item.benefittingMember?.companyName ?? 'Pending Assignment',
            serviceCategoryId: item.serviceCategory.id,
            serviceSubtypeId: item.serviceSubtype.id,
            detailedDescription: '',
            preferredContactMethod: 'Email',
            preferredDeliveryDate: '',
            priorityLevel: 'MEDIUM',
          })),
        );
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load request form options.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  const categoryOptions = useMemo(
    () => services.map((service) => ({ id: service.id, label: service.serviceName })),
    [services],
  );

  const subtypeOptions = useMemo(() => {
    const selectedCategoryId = Number(form.serviceCategoryId);
    return serviceSubtypes
      .filter((item) => (selectedCategoryId ? item.serviceId === selectedCategoryId : true))
      .map((item) => ({ id: item.id, label: item.name }));
  }, [serviceSubtypes, form.serviceCategoryId]);

  const submitNewRequest = async () => {
    if (
      !form.serviceCategoryId ||
      !form.serviceSubtypeId ||
      !form.requestTitle.trim() ||
      !form.detailedDescription.trim() ||
      !form.preferredDeliveryDate
    ) {
      setError('Please fill all required fields for the new request.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const payload: {
        serviceCategoryId: number;
        serviceSubtypeId: number;
        requestTitle: string;
        detailedDescription: string;
        preferredContactMethod: string;
        preferredDeliveryDate: string;
        priorityLevel: string;
      } = {
        serviceCategoryId: Number(form.serviceCategoryId),
        serviceSubtypeId: Number(form.serviceSubtypeId),
        requestTitle: form.requestTitle.trim(),
        detailedDescription: form.detailedDescription.trim(),
        preferredContactMethod: form.preferredContactMethod,
        preferredDeliveryDate: new Date(form.preferredDeliveryDate).toISOString(),
        priorityLevel: form.priorityLevel,
      };

      const response = await api.post<{
        success: boolean;
        data: {
          id: number;
          requestTitle: string;
          createdAt: string;
          status: 'REQUESTED' | 'DELIVERED';
          serviceCategory: { id: number; categoryName: string };
          serviceSubtype: { id: number; name: string };
        };
      }>('/service-requests', payload);

      const created = response.data.data;
      setRequests((prev) => [
        {
          id: String(created.id),
          requestId: `REQ-${created.id}`,
          title: created.requestTitle,
          category: `${created.serviceCategory.categoryName} / ${created.serviceSubtype.name}`,
          submittedAt: created.createdAt,
          submittedDate: new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(created.createdAt)),
          status: created.status === 'DELIVERED' ? 'completed' : 'pending',
          assignedOfficer: 'Pending Assignment',
          serviceCategoryId: created.serviceCategory.id,
          serviceSubtypeId: created.serviceSubtype.id,
          detailedDescription: form.detailedDescription.trim(),
          preferredContactMethod: form.preferredContactMethod,
          preferredDeliveryDate: form.preferredDeliveryDate,
          priorityLevel: form.priorityLevel,
        },
        ...prev,
      ]);
      setForm({
        serviceCategoryId: '',
        serviceSubtypeId: '',
        requestTitle: '',
        detailedDescription: '',
        preferredContactMethod: 'Email',
        preferredDeliveryDate: '',
        priorityLevel: 'MEDIUM',
      });
      setShowNewForm(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit service request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.requestId.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || r.status === statusFilter;
      const submittedAtDate = new Date(r.submittedAt);
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;
      const matchFrom = !fromDate || submittedAtDate >= fromDate;
      const matchTo = !toDate || submittedAtDate <= toDate;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [requests, search, statusFilter, dateFrom, dateTo]);

  const startEditRequest = (req: {
    id: string;
    requestId: string;
    title: string;
    category: string;
    submittedDate: string;
    submittedAt: string;
    status: RequestStatus;
    assignedOfficer: string;
    serviceCategoryId: number;
    serviceSubtypeId: number;
    detailedDescription: string;
    preferredContactMethod: string;
    preferredDeliveryDate: string;
    priorityLevel: string;
  }) => {
    setEditingRequest(req);
    setEditForm({
      requestTitle: req.title,
      serviceCategoryId: String(req.serviceCategoryId),
      serviceSubtypeId: String(req.serviceSubtypeId),
      detailedDescription: req.detailedDescription,
      preferredContactMethod: req.preferredContactMethod,
      preferredDeliveryDate: req.preferredDeliveryDate,
      priorityLevel: req.priorityLevel,
    });
  };

  const saveEditRequest = () => {
    if (!editingRequest) return;
    const category = services.find((service) => service.id === Number(editForm.serviceCategoryId));
    const subtype = serviceSubtypes.find((item) => item.id === Number(editForm.serviceSubtypeId));
    setRequests((prev) =>
      prev.map((item) =>
        item.id === editingRequest.id
          ? {
              ...item,
              title: editForm.requestTitle.trim() || item.title,
              serviceCategoryId: Number(editForm.serviceCategoryId) || item.serviceCategoryId,
              serviceSubtypeId: Number(editForm.serviceSubtypeId) || item.serviceSubtypeId,
              category: category && subtype ? `${category.serviceName} / ${subtype.name}` : item.category,
              detailedDescription: editForm.detailedDescription.trim(),
              preferredContactMethod: editForm.preferredContactMethod,
              preferredDeliveryDate: editForm.preferredDeliveryDate,
              priorityLevel: editForm.priorityLevel,
            }
          : item,
      ),
    );
    setEditingRequest(null);
  };

  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((item) => item.id !== id));
    if (selectedRequest?.id === id) setSelectedRequest(null);
    if (editingRequest?.id === id) setEditingRequest(null);
  };

  return (
    <PortalLayout title="Request Services">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Service Requests</h2>
          <p className="text-gray-500 text-xs mt-0.5">Track and manage your submitted requests for ICT Chamber services.</p>
        </div>
        <button
          onClick={() => setShowNewForm((prev) => !prev)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#EF9F27] hover:bg-[#d98e1e] text-white text-sm font-semibold rounded-sm transition-all active:scale-[0.98] flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          {showNewForm ? 'Close Form' : 'New Request'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {showNewForm ? (
        <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Submit New Service Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Category *</label>
              <select
                value={form.serviceCategoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, serviceCategoryId: event.target.value, serviceSubtypeId: '' }))}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Subtype *</label>
              <select
                value={form.serviceSubtypeId}
                onChange={(event) => setForm((prev) => ({ ...prev, serviceSubtypeId: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              >
                <option value="">Select subtype</option>
                {subtypeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500">Request Title *</label>
              <input
                value={form.requestTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, requestTitle: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
                placeholder="Enter request title"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500">Detailed Description *</label>
              <textarea
                value={form.detailedDescription}
                onChange={(event) => setForm((prev) => ({ ...prev, detailedDescription: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm min-h-[90px]"
                placeholder="Describe what you need"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Preferred Contact Method *</label>
              <select
                value={form.preferredContactMethod}
                onChange={(event) => setForm((prev) => ({ ...prev, preferredContactMethod: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              >
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Preferred Delivery Date *</label>
              <input
                type="date"
                value={form.preferredDeliveryDate}
                onChange={(event) => setForm((prev) => ({ ...prev, preferredDeliveryDate: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Priority *</label>
              <select
                value={form.priorityLevel}
                onChange={(event) => setForm((prev) => ({ ...prev, priorityLevel: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => void submitNewRequest()}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-sm bg-[#EF9F27] hover:bg-[#d98e1e] text-white text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
          {categoryOptions.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              No category/subtype options loaded. Please verify access to `/api/service-requests/options`.
            </p>
          ) : null}
        </div>
      ) : null}

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

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDateRange((prev) => !prev)}
            className="flex items-center gap-2 text-xs border border-gray-200 rounded-sm bg-white px-3 py-2 hover:border-gray-300 transition-colors text-gray-600"
          >
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Date Range
          </button>
          {showDateRange ? (
            <div className="absolute right-0 z-20 mt-2 w-[280px] rounded-sm border border-gray-200 bg-white p-3 shadow-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">Filter by date</p>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-[11px] text-gray-500">
                  From
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="mt-1 w-full rounded-sm border border-gray-200 px-2 py-1.5 text-xs"
                  />
                </label>
                <label className="text-[11px] text-gray-500">
                  To
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="mt-1 w-full rounded-sm border border-gray-200 px-2 py-1.5 text-xs"
                  />
                </label>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="rounded-sm border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowDateRange(false)}
                  className="rounded-sm bg-[#EF9F27] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#d98e1e]"
                >
                  Apply
                </button>
              </div>
            </div>
          ) : null}
        </div>
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
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading requests...</div>
        ) : null}
        {!isLoading && filtered.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p className="text-sm text-gray-400">No requests found</p>
          </div>
        ) : !isLoading ? (
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                        title="View request"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditRequest(req)}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                        title="Edit request"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.586 3.586a2 2 0 112.828 2.828L12 13.828l-4 1 1-4 7.586-7.242z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRequest(req.id)}
                        className="rounded-md p-1 text-red-500 hover:bg-red-50"
                        title="Delete request"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8m-6-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z"/>
                        </svg>
                      </button>
                    </div>
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
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View request"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditRequest(req)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit request"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.586 3.586a2 2 0 112.828 2.828L12 13.828l-4 1 1-4 7.586-7.242z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRequest(req.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete request"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8m-6-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {selectedRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedRequest(null)}>
          <div className="w-full max-w-md rounded-sm bg-white border border-gray-200 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Request Details</h3>
              <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedRequest(null)}>✕</button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <p><span className="text-gray-500">Request ID:</span> <span className="font-medium text-gray-900">{selectedRequest.requestId}</span></p>
              <p><span className="text-gray-500">Title:</span> <span className="font-medium text-gray-900">{selectedRequest.title}</span></p>
              <p><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-900">{selectedRequest.category}</span></p>
              <p><span className="text-gray-500">Submitted:</span> <span className="font-medium text-gray-900">{selectedRequest.submittedDate}</span></p>
              <p><span className="text-gray-500">Assigned Officer:</span> <span className="font-medium text-gray-900">{selectedRequest.assignedOfficer}</span></p>
              <p><span className="text-gray-500">Preferred Contact:</span> <span className="font-medium text-gray-900">{selectedRequest.preferredContactMethod}</span></p>
              <p><span className="text-gray-500">Preferred Delivery:</span> <span className="font-medium text-gray-900">{selectedRequest.preferredDeliveryDate || '-'}</span></p>
              <p><span className="text-gray-500">Priority:</span> <span className="font-medium text-gray-900">{selectedRequest.priorityLevel}</span></p>
              {selectedRequest.detailedDescription ? (
                <div>
                  <p className="text-gray-500">Description:</p>
                  <p className="font-medium text-gray-900">{selectedRequest.detailedDescription}</p>
                </div>
              ) : null}
              <div className="pt-1">
                <StatusBadge status={selectedRequest.status as RequestStatus} />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
              <button type="button" className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50" onClick={() => setSelectedRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditingRequest(null)}>
          <div className="w-full max-w-lg rounded-sm bg-white border border-gray-200 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Edit Request</h3>
              <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => setEditingRequest(null)}>✕</button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Category *</label>
                <select
                  value={editForm.serviceCategoryId}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      serviceCategoryId: event.target.value,
                      serviceSubtypeId: '',
                    }))
                  }
                  className="mt-1 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Subtype *</label>
                <select
                  value={editForm.serviceSubtypeId}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, serviceSubtypeId: event.target.value }))}
                  className="mt-1 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select subtype</option>
                  {serviceSubtypes
                    .filter((item) =>
                      editForm.serviceCategoryId ? item.serviceId === Number(editForm.serviceCategoryId) : true,
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500">Request Title *</label>
                <input
                  value={editForm.requestTitle}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, requestTitle: event.target.value }))}
                  className="mt-1 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Enter request title"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500">Detailed Description *</label>
                <textarea
                  value={editForm.detailedDescription}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, detailedDescription: event.target.value }))}
                  className="mt-1 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm min-h-[90px]"
                  placeholder="Describe what you need"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Preferred Contact Method *</label>
                <select
                  value={editForm.preferredContactMethod}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, preferredContactMethod: event.target.value }))}
                  className="mt-1 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Preferred Delivery Date *</label>
                <input
                  type="date"
                  value={editForm.preferredDeliveryDate}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, preferredDeliveryDate: event.target.value }))}
                  className="mt-1 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Priority *</label>
                <select
                  value={editForm.priorityLevel}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, priorityLevel: event.target.value }))}
                  className="mt-1 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRequest(null)}
                className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditRequest}
                className="rounded-sm bg-[#EF9F27] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#d98e1e]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PortalLayout>
  );
};

function mineOrEmpty<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}
