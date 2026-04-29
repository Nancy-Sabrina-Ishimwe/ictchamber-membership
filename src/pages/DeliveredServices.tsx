import { Search, Filter, Plus, Building2, CalendarDays, Eye, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [statusFilter, setStatusFilter] = useState<"All" | Service["status"]>("All");
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
          additionalNotes?: string | null;
        }>;
      }>("/service-requests/delivered");

      const mapped: Service[] = (response.data.data ?? []).map((item) => ({
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
        date: item.deliveryDate ? formatDate(item.deliveryDate) : "-",
        status: "Completed",
        notes: item.additionalNotes ?? "",
      }));
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

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      if (statusFilter !== "All" && service.status !== statusFilter) return false;
      if (!query) return true;
      return `${service.name} ${service.company} ${service.code}`.toLowerCase().includes(query);
    });
  }, [services, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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

      {/* SEARCH + FILTER */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center border border-gray-200 rounded px-3 py-2 w-full sm:max-w-md">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search services or companies..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="ml-2 outline-none text-sm w-full bg-transparent"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            setStatusFilter((prev) =>
              prev === "All" ? "Completed" : prev === "Completed" ? "In Progress" : prev === "In Progress" ? "Pending Review" : "All",
            )
          }
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
        >
          <Filter size={16} />
          Filter ({statusFilter})
        </button>
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