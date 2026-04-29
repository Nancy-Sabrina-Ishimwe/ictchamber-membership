import { Search, Download, RefreshCw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";

type Partner = {
  id: number;
  name: string;
  contactName: string;
  contactEmail: string;
  program: string;
  status: "Incoming" | "Ongoing" | "Complete";
  timeframe: string;
  contactNumber: string;
  fromYear: number;
  toYear: number;
  fromDate: string;
  toDate: string;
  programStatus: "ONGOING" | "INCOMING" | "COMPLETED";
};

type PartnerApiItem = {
  id: number;
  partnerName: string;
  contactNumber: string;
  email: string;
  partnershipProgram: string;
  programStatus: "ONGOING" | "INCOMING" | "COMPLETED";
  fromYear: number;
  toYear: number;
  fromDate?: string | null;
  toDate?: string | null;
};

type PartnersApiResponse = {
  success: boolean;
  count: number;
  data: PartnerApiItem[];
};

const statusStyles = {
  Incoming: "text-yellow-500 font-semibold",
  Ongoing:  "text-gray-800 font-semibold",
  Complete: "text-gray-400",
};

function mapStatus(status: PartnerApiItem["programStatus"]): Partner["status"] {
  if (status === "INCOMING") return "Incoming";
  if (status === "COMPLETED") return "Complete";
  return "Ongoing";
}

function mapStatusToApi(status: Partner["status"]): PartnerApiItem["programStatus"] {
  if (status === "Incoming") return "INCOMING";
  if (status === "Complete") return "COMPLETED";
  return "ONGOING";
}

function validateTimeframeForStatus(
  status: Partner["status"],
  fromYear: number,
  toYear: number,
): string | null {
  if (fromYear > toYear) return "From date cannot be later than To date.";
  const currentYear = new Date().getFullYear();
  if (status === "Complete" && (fromYear === currentYear || toYear === currentYear)) {
    return `For Complete status, current year (${currentYear}) is not allowed in timeframe.`;
  }
  return null;
}

function formatDateLabel(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function toPartner(apiItem: PartnerApiItem): Partner {
  return {
    id: apiItem.id,
    name: apiItem.partnerName,
    contactName: apiItem.contactNumber || "-",
    contactEmail: apiItem.email,
    program: apiItem.partnershipProgram,
    status: mapStatus(apiItem.programStatus),
    timeframe: `${apiItem.fromYear} - ${apiItem.toYear}`,
    contactNumber: apiItem.contactNumber,
    fromYear: apiItem.fromYear,
    toYear: apiItem.toYear,
    fromDate: apiItem.fromDate ? apiItem.fromDate.slice(0, 10) : `${apiItem.fromYear}-01-01`,
    toDate: apiItem.toDate ? apiItem.toDate.slice(0, 10) : `${apiItem.toYear}-12-31`,
    programStatus: apiItem.programStatus,
  };
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none pl-3 pr-7 py-2 border border-gray-200 rounded-md text-xs text-gray-500 bg-white focus:outline-none w-full"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function PartnerDirectory() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewPartner, setViewPartner] = useState<Partner | null>(null);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contactName: "",
    contactEmail: "",
    program: "",
    status: "Incoming" as Partner["status"],
    fromDate: "",
    toDate: "",
  });
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const pageSize = 10;

  const fetchPartners = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get<PartnersApiResponse>("/partners");
      const mapped = (response.data.data ?? []).map(toPartner);
      setPartners(mapped);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load partners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPartners();
  }, []);

  const programOptions = useMemo(() => Array.from(new Set(partners.map((partner) => partner.program))).sort(), [partners]);
  const timeframeOptions = useMemo(() => Array.from(new Set(partners.map((partner) => partner.timeframe))).sort(), [partners]);

  const filteredPartners = useMemo(() => {
    const query = search.trim().toLowerCase();
    return partners.filter((partner) => {
      if (statusFilter && partner.status !== statusFilter) return false;
      if (programFilter && partner.program !== programFilter) return false;
      if (timeframeFilter && partner.timeframe !== timeframeFilter) return false;
      if (!query) return true;
      return `${partner.name} ${partner.program} ${partner.contactEmail}`.toLowerCase().includes(query);
    });
  }, [partners, search, statusFilter, programFilter, timeframeFilter]);

  const total = filteredPartners.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = filteredPartners.slice(start, end);
  const pageItemIds = pageItems.map((item) => item.id);
  const selectedVisibleCount = pageItemIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = pageItemIds.length > 0 && selectedVisibleCount === pageItemIds.length;
  const partiallySelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, programFilter, timeframeFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = partiallySelected;
  }, [partiallySelected]);

  useEffect(() => {
    if (!viewPartner && !editPartner) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [viewPartner, editPartner]);

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageItemIds.includes(id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageItemIds])));
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const openEditModal = (partner: Partner) => {
    setEditPartner(partner);
    setEditForm({
      name: partner.name,
      contactName: partner.contactName,
      contactEmail: partner.contactEmail,
      program: partner.program,
      status: partner.status,
      fromDate: partner.fromDate || `${partner.fromYear}-01-01`,
      toDate: partner.toDate || `${partner.toYear}-12-31`,
    });
  };

  const savePartnerEdit = async () => {
    if (!editPartner) return;
    try {
      const parsedFrom = editForm.fromDate ? new Date(editForm.fromDate) : null;
      const parsedTo = editForm.toDate ? new Date(editForm.toDate) : null;
      const fromYear =
        parsedFrom && !Number.isNaN(parsedFrom.getTime()) ? parsedFrom.getFullYear() : editPartner.fromYear;
      const toYear =
        parsedTo && !Number.isNaN(parsedTo.getTime()) ? parsedTo.getFullYear() : editPartner.toYear;
      const timeframeError = validateTimeframeForStatus(editForm.status, fromYear, toYear);
      if (timeframeError) {
        setError(timeframeError);
        return;
      }

      const payload = {
        partnerName: editForm.name.trim() || editPartner.name,
        contactNumber: editForm.contactName.trim() || editPartner.contactNumber,
        email: editForm.contactEmail.trim() || editPartner.contactEmail,
        partnershipProgram: editForm.program.trim() || editPartner.program,
        programStatus: mapStatusToApi(editForm.status),
        fromDate: editForm.fromDate,
        toDate: editForm.toDate,
        fromYear,
        toYear,
      };

      const response = await api.put<{ success: boolean; data: PartnerApiItem }>(`/partners/${editPartner.id}`, payload);
      setPartners((prev) =>
        prev.map((item) =>
          item.id === editPartner.id
            ? {
                ...toPartner(response.data.data),
                fromDate: editForm.fromDate || `${fromYear}-01-01`,
                toDate: editForm.toDate || `${toYear}-12-31`,
              }
            : item,
        ),
      );
      setEditPartner(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update partner.");
    }
  };

  const deletePartner = async (id: number) => {
    const confirmed = window.confirm(`Delete partner with id ${id}?`);
    if (!confirmed) return;
    try {
      await api.delete(`/partners/${id}`);
      setPartners((prev) => prev.filter((partner) => partner.id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete partner.");
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Partner Directory</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Manage external partners, affiliated programs, and synchronization with central dashboards.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-md bg-white text-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-black rounded-md text-xs font-semibold transition-colors whitespace-nowrap">
            <RefreshCw size={13} /> Bulk Sync (All)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 flex-1 min-w-[160px]">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search by Partner Name or Program..."
            className="outline-none text-xs w-full bg-transparent placeholder-gray-400"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <FilterSelect label="Status" value={statusFilter} options={["Incoming", "Ongoing", "Complete"]} onChange={setStatusFilter} />
        <FilterSelect label="Program" value={programFilter} options={programOptions} onChange={setProgramFilter} />
        <FilterSelect label="Timeframe" value={timeframeFilter} options={timeframeOptions} onChange={setTimeframeFilter} />
      </div>
      {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div> : null}

      {/* Table */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {isLoading ? <p className="p-3 text-xs text-gray-500">Loading partners...</p> : null}
          {!isLoading && pageItems.length === 0 ? <p className="p-3 text-xs text-gray-500">No partners found.</p> : null}
          {pageItems.map((p) => (
            <div key={p.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                <span className={`text-xs ${statusStyles[p.status]}`}>{p.status}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">{p.contactName}</p>
                <p className="text-xs text-gray-400">{p.contactEmail}</p>
              </div>
              <div className="flex justify-between text-xs">
                <div><p className="text-gray-400">Program</p><p className="text-gray-700">{p.program}</p></div>
                <div className="text-right"><p className="text-gray-400">Timeframe</p><p className="text-gray-400">{p.timeframe}</p></div>
              </div>
              <div className="flex gap-3 pt-1">
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setViewPartner(p)}><Eye size={14} /></button>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => openEditModal(p)}><Pencil size={14} /></button>
                <button className="text-gray-400 hover:text-red-500" onClick={() => void deletePartner(p.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table — no min-w, columns share space naturally */}
        <div className="hidden lg:block">
          <table className="w-full text-xs table-fixed">
            <colgroup>
              <col className="w-8" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[24%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="rounded"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible partners"
                  />
                </th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Partner Name</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Contact</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Program</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Timeframe</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-4 text-center text-xs text-gray-500" colSpan={7}>
                    Loading partners...
                  </td>
                </tr>
              ) : null}
              {!isLoading && pageItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-center text-xs text-gray-500" colSpan={7}>
                    No partners found.
                  </td>
                </tr>
              ) : null}
              {pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelectOne(p.id)}
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td className="px-3 py-4 font-medium text-gray-800">{p.name}</td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-gray-800 truncate">{p.contactName}</p>
                    <p className="text-gray-400 truncate mt-0.5">{p.contactEmail}</p>
                  </td>
                  <td className="px-3 py-4 text-gray-600">{p.program}</td>
                  <td className={`px-3 py-4 ${statusStyles[p.status]}`}>{p.status}</td>
                  <td className="px-3 py-4 text-gray-400">{p.timeframe}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setViewPartner(p)}><Eye size={14} /></button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => openEditModal(p)}><Pencil size={14} /></button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => void deletePartner(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <p>
            Showing <span className="font-semibold text-gray-700">{total === 0 ? 0 : start + 1}</span> to{" "}
            <span className="font-semibold text-gray-700">{end}</span> of <span className="font-semibold text-gray-700">{total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={12} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                  n === safePage ? "bg-yellow-400 text-black font-semibold" : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewPartner ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setViewPartner(null)}>
          <div className="w-full max-w-md rounded-md border border-gray-200 bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Partner Details</h3>
              <button type="button" onClick={() => setViewPartner(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-2 p-4 text-sm">
              <p><span className="text-gray-500">Partner Name:</span> <span className="font-medium text-gray-900">{viewPartner.name}</span></p>
              <p><span className="text-gray-500">Contact:</span> <span className="font-medium text-gray-900">{viewPartner.contactName}</span></p>
              <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{viewPartner.contactEmail}</span></p>
              <p><span className="text-gray-500">Program:</span> <span className="font-medium text-gray-900">{viewPartner.program}</span></p>
              <p><span className="text-gray-500">Status:</span> <span className={`font-medium text-gray-900 ${statusStyles[viewPartner.status]}`}>{viewPartner.status}</span></p>
              <p>
                <span className="text-gray-500">Timeframe:</span>{" "}
                <span className="font-medium text-gray-900">
                  {formatDateLabel(viewPartner.fromDate)} - {formatDateLabel(viewPartner.toDate)}
                </span>
              </p>
            </div>
            <div className="flex justify-end border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setViewPartner(null)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      , document.body) : null}

      {/* Edit Modal */}
      {editPartner ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditPartner(null)}>
          <div className="w-full max-w-lg rounded-md border border-gray-200 bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Edit Partner</h3>
              <button type="button" onClick={() => setEditPartner(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500">Partner Name</label>
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Contact Name</label>
                <input
                  value={editForm.contactName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, contactName: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Contact Email</label>
                <input
                  value={editForm.contactEmail}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Program</label>
                <input
                  value={editForm.program}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, program: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select
                  value={editForm.status}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value as Partner["status"] }))}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="Incoming">Incoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500">Timeframe</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={editForm.fromDate}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, fromDate: event.target.value }))}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={editForm.toDate}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, toDate: event.target.value }))}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setEditPartner(null)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePartnerEdit}
                className="rounded-md bg-[#EF9F27] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#d99b22]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      , document.body) : null}
    </div>
  );
}
