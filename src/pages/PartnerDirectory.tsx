import { Search, Download, RefreshCw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Partner = {
  id: number;
  name: string;
  contactName: string;
  contactEmail: string;
  program: string;
  status: "Incoming" | "Ongoing" | "Complete";
  timeframe: string;
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
};

type PartnersApiResponse = {
  success: boolean;
  count: number;
  data: PartnerApiItem[];
};

type ServiceSubtypeApiItem = {
  id: number;
  name: string;
  serviceId: number;
};

type ServiceSubtypeResponse = {
  success: boolean;
  data: ServiceSubtypeApiItem;
  message?: string;
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

function toPartner(apiItem: PartnerApiItem): Partner {
  return {
    id: apiItem.id,
    name: apiItem.partnerName,
    contactName: apiItem.contactNumber || "-",
    contactEmail: apiItem.email,
    program: apiItem.partnershipProgram,
    status: mapStatus(apiItem.programStatus),
    timeframe: `${apiItem.fromYear} - ${apiItem.toYear}`,
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

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, programFilter, timeframeFilter]);

  const viewSubtype = async (id: number) => {
    try {
      const response = await api.get<ServiceSubtypeResponse>(`/service-subtypes/${id}`);
      window.alert(`Subtype #${id}: ${response.data.data.name}`);
    } catch (viewError) {
      setError(viewError instanceof Error ? viewError.message : "Failed to fetch service subtype.");
    }
  };

  const updateSubtype = async (id: number) => {
    try {
      const current = await api.get<ServiceSubtypeResponse>(`/service-subtypes/${id}`);
      const currentName = current.data.data.name;
      const currentServiceId = current.data.data.serviceId;
      const nextName = window.prompt("Subtype name", currentName);
      if (!nextName) return;
      await api.put<ServiceSubtypeResponse>(`/service-subtypes/${id}`, { name: nextName, serviceId: currentServiceId });
      window.alert("Service subtype updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update service subtype.");
    }
  };

  const deleteSubtype = async (id: number) => {
    const confirmed = window.confirm(`Delete service subtype with id ${id}?`);
    if (!confirmed) return;
    try {
      await api.delete(`/service-subtypes/${id}`);
      window.alert("Service subtype deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete service subtype.");
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
                <button className="text-gray-400 hover:text-gray-600" onClick={() => void viewSubtype(p.id)}><Eye size={14} /></button>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => void updateSubtype(p.id)}><Pencil size={14} /></button>
                <button className="text-gray-400 hover:text-red-500" onClick={() => void deleteSubtype(p.id)}><Trash2 size={14} /></button>
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
                <th className="px-4 py-3"><input type="checkbox" className="rounded" /></th>
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
                  <td className="px-4 py-4"><input type="checkbox" className="rounded" /></td>
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
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => void viewSubtype(p.id)}><Eye size={14} /></button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => void updateSubtype(p.id)}><Pencil size={14} /></button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => void deleteSubtype(p.id)}><Trash2 size={14} /></button>
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
    </div>
  );
}