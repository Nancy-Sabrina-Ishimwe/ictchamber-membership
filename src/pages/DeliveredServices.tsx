import { Building2, CalendarDays, ChevronDown, Eye, Layers, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import ServiceRecordModal, { type ServiceRecordFormValue } from "../components/ServiceRecordModal";
import { api } from "../lib/api";

/* ================= TYPES ================= */

type Service = {
  id: string;
  name: string;
  code: string;
  company: string;
  companies: string[];
  deliveredServices: string[];
  date: string;
  /** Parsed delivery moment for range filters; null when unknown */
  deliveryTimestamp: number | null;
  category: string | null;
  subtype: string | null;
  status: "Completed" | "In Progress" | "Pending Review";
  notes?: string;
};

/* ================= PAGE ================= */

export default function DeliveredServices() {
  const [openRecordModal, setOpenRecordModal] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [subtypeFilter, setSubtypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 7;

  const fetchDeliveredServices = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get<{
        data?: Array<{
          id: number;
          requestTitle: string;
          serviceCategory?: { categoryName?: string | null } | null;
          serviceSubtype?: { name?: string | null } | null;
          benefittingMember?: { companyName?: string | null } | null;
          servicesDelivered?: string | null;
          deliveryDate?: string | null;
          deliveredAt?: string | null;
          additionalNotes?: string | null;
        }>;
      }>("/service-requests/delivered");

      const mapped: Service[] = (response.data.data ?? []).map((item) => {
        const rawIso = item.deliveryDate ?? item.deliveredAt ?? null;
        const parsed = rawIso ? new Date(rawIso).getTime() : NaN;
        const categoryName =
          typeof item.serviceCategory?.categoryName === "string"
            ? item.serviceCategory.categoryName.trim()
            : null;
        const subtypeName =
          typeof item.serviceSubtype?.name === "string" ? item.serviceSubtype.name.trim() : null;
        return {
          id: String(item.id),
          name: item.requestTitle || item.servicesDelivered || "Untitled Service",
          code: `SRV-${String(item.id).padStart(6, "0")}`,
          company: item.benefittingMember?.companyName ?? "Unknown Company",
          companies: item.benefittingMember?.companyName ? [item.benefittingMember.companyName] : [],
          deliveredServices: item.servicesDelivered
            ? item.servicesDelivered
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean)
            : item.requestTitle
              ? [item.requestTitle]
              : [],
          date: rawIso ? formatDate(rawIso) : "-",
          deliveryTimestamp: Number.isFinite(parsed) ? parsed : null,
          category: categoryName?.length ? categoryName : null,
          subtype: subtypeName?.length ? subtypeName : null,
          status: "Completed",
          notes: item.additionalNotes ?? "",
        };
      });
      setServices(mapped);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load delivered services.");
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDeliveredServices();
  }, []);

  const saveAddedRecord = async (record: ServiceRecordFormValue) => {
    try {
      setError(null);
      const companies = record.companies?.length ? record.companies : [record.company];
      await Promise.all(
        companies.map((companyName) =>
          api.post("/service-requests/delivered", {
            requestTitle: record.deliveredServices.join(", ") || record.name,
            servicesDelivered: record.deliveredServices.join(", ") || record.name,
            companyName,
            deliveryDate: new Date(record.date).toISOString(),
            additionalNotes: record.notes ?? "",
          }),
        ),
      );
      await fetchDeliveredServices();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to create delivered service record.";
      setError(message);
      throw new Error(message);
    }
  };

  const saveEditedRecord = async (record: ServiceRecordFormValue) => {
    if (!editingService) return;
    try {
      setError(null);
      await api.put(`/service-requests/delivered/${editingService.id}`, {
        requestTitle: record.deliveredServices.join(", ") || record.name,
        servicesDelivered: record.deliveredServices.join(", ") || record.name,
        companyName: record.companies?.[0] ?? record.company,
        deliveryDate: new Date(record.date).toISOString(),
        additionalNotes: record.notes ?? "",
      });
      setEditingService(null);
      await fetchDeliveredServices();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to update delivered service record.";
      setError(message);
      throw new Error(message);
    }
  };

  const deleteRecord = (service: Service) => {
    void (async () => {
      const confirmed = window.confirm(`Delete "${service.name}"?`);
      if (!confirmed) return;
      try {
        setError(null);
        await api.delete(`/service-requests/delivered/${service.id}`);
        await fetchDeliveredServices();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "Failed to delete delivered service record.");
      }
    })();
  };

  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      if (s.company) set.add(s.company);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [services]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      if (s.category) set.add(s.category);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [services]);

  const subtypeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      if (!s.subtype) continue;
      if (categoryFilter !== "all" && s.category !== categoryFilter) continue;
      set.add(s.subtype);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [services, categoryFilter]);

  const rangeStartMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const rangeEndMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      if (companyFilter !== "all" && service.company !== companyFilter) return false;
      if (categoryFilter !== "all" && service.category !== categoryFilter) return false;
      if (subtypeFilter !== "all" && service.subtype !== subtypeFilter) return false;

      if (rangeStartMs !== null || rangeEndMs !== null) {
        if (service.deliveryTimestamp === null) return false;
        if (rangeStartMs !== null && service.deliveryTimestamp < rangeStartMs) return false;
        if (rangeEndMs !== null && service.deliveryTimestamp > rangeEndMs) return false;
      }

      if (!query) return true;
      const haystack = [
        service.name,
        service.company,
        service.code,
        service.notes,
        service.category,
        service.subtype,
        ...service.deliveredServices,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [
    services,
    searchQuery,
    companyFilter,
    categoryFilter,
    subtypeFilter,
    rangeStartMs,
    rangeEndMs,
  ]);

  const filterBarActive =
    searchQuery.trim() !== "" ||
    companyFilter !== "all" ||
    categoryFilter !== "all" ||
    subtypeFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setCompanyFilter("all");
    setCategoryFilter("all");
    setSubtypeFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setSubtypeFilter("all");
  }, [categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, companyFilter, categoryFilter, subtypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Delivered Services</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            View and manage previously documented service fulfillments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenRecordModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 transition-colors px-4 py-2 rounded-md text-sm font-medium"
        >
          <Plus size={16} />
          Add Record
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Layers size={17} className="text-gray-400 flex-shrink-0" aria-hidden />
            <span>Filter records</span>
            {filterBarActive ? (
              <span className="text-xs font-normal text-gray-500">
                ({filteredServices.length} of {services.length})
              </span>
            ) : null}
          </div>
          {filterBarActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1.5 px-2 -mx-2 sm:mx-0 rounded-md hover:bg-gray-50"
            >
              <X size={15} className="text-gray-400" aria-hidden />
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" aria-hidden />
          <input
            type="search"
            placeholder="Search title, beneficiary, notes, category, service type..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="outline-none text-sm w-full min-w-0 bg-transparent placeholder:text-gray-400"
            aria-label="Search delivered services"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <FilterSelect
            label="Beneficiary company"
            value={companyFilter}
            onChange={setCompanyFilter}
            placeholder="All companies"
            icon={<Building2 size={14} className="text-gray-400" />}
          >
            {companyOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="All categories"
          >
            {categoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Service type"
            value={subtypeFilter}
            onChange={setSubtypeFilter}
            placeholder="All types"
          >
            {subtypeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </FilterSelect>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-gray-500">Delivered from</span>
            <label className="relative flex items-center rounded-md border border-gray-200 bg-white">
              <CalendarDays size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" aria-hidden />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="w-full rounded-md bg-transparent py-2 pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-yellow-400/80 focus:border-yellow-400"
                aria-label="Delivery date from"
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-gray-500">Delivered to</span>
            <label className="relative flex items-center rounded-md border border-gray-200 bg-white">
              <CalendarDays size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" aria-hidden />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="w-full rounded-md bg-transparent py-2 pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-yellow-400/80 focus:border-yellow-400"
                aria-label="Delivery date to"
              />
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">Loading delivered services...</div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}

      {/* DATA */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredServices.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              {services.length === 0
                ? "No delivered service records yet."
                : "No records match your filters. Adjust filters or tap Clear filters."}
            </div>
          ) : null}
          {paginatedServices.map((s) => (
            <div key={s.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 break-words">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.code}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center text-gray-500 flex-shrink-0">
                  <Building2 size={14} />
                </div>
                <span className="break-words">{s.company}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CalendarDays size={14} className="text-gray-400" />
                <span>{s.date}</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={`View ${s.name}`}
                  onClick={() => setViewingService(s)}
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={`Edit ${s.name}`}
                  onClick={() => setEditingService(s)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => deleteRecord(s)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[33%]" />
              <col className="w-[26%]" />
              <col className="w-[16%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
            </colgroup>
            {/* HEAD */}
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-4 text-left">SERVICE NAME</th>
                <th className="p-4 text-left">BENEFICIARY COMPANY</th>
                <th className="p-4 text-left">DATE DELIVERED</th>
                <th className="p-4 text-left">STATUS</th>
                <th className="p-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                    {services.length === 0
                      ? "No delivered service records yet."
                      : "No records match your filters. Adjust filters or use Clear filters."}
                  </td>
                </tr>
              ) : null}
              {paginatedServices.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">

                  {/* SERVICE */}
                  <td className="p-4">
                    <p className="font-medium text-gray-900 break-words">{s.name}</p>
                    <p className="text-xs text-gray-400 break-all">{s.code}</p>
                  </td>

                  {/* COMPANY */}
                  <td className="p-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 flex-shrink-0">
                        <Building2 size={14} />
                      </div>
                      <span className="break-words">{s.company}</span>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-400" />
                      {s.date}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <StatusBadge status={s.status} />
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={`View ${s.name}`}
                        onClick={() => setViewingService(s)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={`Edit ${s.name}`}
                        onClick={() => setEditingService(s)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Delete ${s.name}`}
                        onClick={() => deleteRecord(s)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-gray-500 border-t border-gray-100">
          <p>
            Showing {filteredServices.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + paginatedServices.length, filteredServices.length)} of {filteredServices.length} results
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {openRecordModal && (
        <ServiceRecordModal
          mode="add"
          onClose={() => setOpenRecordModal(false)}
          onSave={saveAddedRecord}
        />
      )}
      {viewingService && (
        <ServiceRecordModal
          mode="view"
          initialRecord={viewingService}
          onClose={() => setViewingService(null)}
        />
      )}
      {editingService && (
        <ServiceRecordModal
          mode="edit"
          initialRecord={editingService}
          onSave={saveEditedRecord}
          onClose={() => setEditingService(null)}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  icon,
  disabled,
  hint,
  children,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  icon?: ReactNode;
  disabled?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-1.5 min-w-0">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 pointer-events-none">{icon}</span>
        ) : null}
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`w-full appearance-none rounded-md border border-gray-200 bg-white py-2 pr-9 text-sm text-gray-900 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/80 disabled:cursor-not-allowed disabled:opacity-50 ${icon ? "pl-8" : "pl-2.5"}`}
        >
          <option value="all">{placeholder}</option>
          {children}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          aria-hidden
        />
      </div>
      {hint ? <p className="text-[11px] leading-snug text-gray-400">{hint}</p> : null}
    </div>
  );
}

/* ================= STATUS ================= */

function StatusBadge({ status }: { status: Service["status"] }) {
  let style = "";

  if (status === "Completed") {
    style = "bg-green-100 text-green-600";
  } else if (status === "In Progress") {
    style = "bg-orange-100 text-orange-600";
  } else {
    style = "bg-gray-200 text-gray-600";
  }

  return (
    <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}