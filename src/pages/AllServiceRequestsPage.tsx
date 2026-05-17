import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Ellipsis,
  Eye,
  Layers,
  MessageSquareText,
  Search,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FeedbackRatingBadge } from "../components/feedback/FeedbackRatingBadge";
import { ServiceFeedbackDetailModal } from "../components/feedback/ServiceFeedbackDetailModal";
import { api } from "../lib/api";
import { ROUTES } from "../constants/app";
import type { ServiceFeedbackRating } from "../types/feedback";
import type { ServiceFeedbackRecord } from "../types/feedback";

type RequestStatus = "REQUESTED" | "DELIVERED";

type ServiceRequestRow = {
  id: number;
  code: string;
  title: string;
  company: string;
  requesterEmail: string;
  benefittingMemberId: number | null;
  benefittingCompany: string | null;
  requesterId: number;
  category: string;
  subtype: string;
  status: RequestStatus;
  priority: string;
  preferredContactMethod: string;
  preferredDeliveryDate: string;
  createdAt: string;
  createdTimestamp: number;
  deliveredAt: string | null;
  deliveredTimestamp: number | null;
  detailedDescription: string;
  feedbackRating: ServiceFeedbackRating | null;
  feedbackComment: string | null;
  feedbackSubmittedAt: string | null;
};

type StatusFilter = "all" | RequestStatus;

const PAGE_SIZE = 10;

export default function AllServiceRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingRequest, setViewingRequest] = useState<ServiceRequestRow | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState<ServiceRequestRow | null>(null);
  const [deliveringRequestId, setDeliveringRequestId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get<{
        data?: Array<{
          id: number;
          requestTitle: string;
          detailedDescription: string;
          preferredContactMethod: string;
          priorityLevel: string;
          preferredDeliveryDate: string;
          status: RequestStatus;
          createdAt: string;
          deliveredAt?: string | null;
          deliveryDate?: string | null;
          feedbackRating?: ServiceFeedbackRating | null;
          feedbackComment?: string | null;
          feedbackSubmittedAt?: string | null;
          requester?: { id?: number; email?: string | null; companyName?: string | null } | null;
          benefittingMember?: { id?: number; companyName?: string | null } | null;
          serviceCategory?: { categoryName?: string | null } | null;
          serviceSubtype?: { name?: string | null } | null;
        }>;
      }>("/service-requests/all");

      setRequests(
        (response.data.data ?? []).map((item) => {
          const createdAt = item.createdAt;
          const createdTimestamp = new Date(createdAt).getTime();
          const deliveredRaw = item.deliveredAt ?? item.deliveryDate ?? null;
          const deliveredTimestamp = deliveredRaw ? new Date(deliveredRaw).getTime() : null;
          return {
            id: item.id,
            code: `SRV-${String(item.id).padStart(6, "0")}`,
            title: item.requestTitle,
            company: item.requester?.companyName ?? "Unknown Company",
            requesterEmail: item.requester?.email ?? "",
            requesterId: item.requester?.id ?? 0,
            benefittingMemberId: item.benefittingMember?.id ?? null,
            benefittingCompany: item.benefittingMember?.companyName ?? null,
            category: item.serviceCategory?.categoryName ?? "—",
            subtype: item.serviceSubtype?.name ?? "—",
            status: item.status,
            priority: item.priorityLevel,
            preferredContactMethod: item.preferredContactMethod,
            preferredDeliveryDate: item.preferredDeliveryDate,
            createdAt,
            createdTimestamp: Number.isFinite(createdTimestamp) ? createdTimestamp : 0,
            deliveredAt: deliveredRaw,
            deliveredTimestamp: deliveredTimestamp && Number.isFinite(deliveredTimestamp) ? deliveredTimestamp : null,
            detailedDescription: item.detailedDescription ?? "",
            feedbackRating: item.feedbackRating ?? null,
            feedbackComment: item.feedbackComment ?? null,
            feedbackSubmittedAt: item.feedbackSubmittedAt ?? null,
          };
        }),
      );
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load service requests.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const summary = useMemo(() => {
    const requested = requests.filter((item) => item.status === "REQUESTED").length;
    const delivered = requests.filter((item) => item.status === "DELIVERED").length;
    return { total: requests.length, requested, delivered };
  }, [requests]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [
        item.title,
        item.code,
        item.company,
        item.requesterEmail,
        item.category,
        item.subtype,
        item.priority,
        item.benefittingCompany,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requests, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleMarkDelivered = async (item: ServiceRequestRow) => {
    const benefittingMemberId = item.benefittingMemberId ?? item.requesterId;
    if (!benefittingMemberId) {
      setError("Cannot mark as delivered: request has no member on record.");
      return;
    }
    try {
      setDeliveringRequestId(item.id);
      setError(null);
      await api.put(`/service-requests/${item.id}/deliver`, {
        benefittingMemberId,
        servicesDelivered: item.title,
        initialService: item.title,
        deliveryDate: new Date().toISOString(),
        additionalNotes: "",
      });
      await fetchRequests();
    } catch (deliverError) {
      setError(deliverError instanceof Error ? deliverError.message : "Failed to mark service as delivered.");
    } finally {
      setDeliveringRequestId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={ROUTES.ADMIN_SERVICES}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Services
          </Link>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900">All Service Requests</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete list of member service requests — pending and delivered.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN_SERVICES_DELIVERED)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Delivered Services
        </button>
      </div>

      {!isLoading && requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard label="Total requests" value={summary.total} />
          <SummaryCard label="Pending delivery" value={summary.requested} tone="amber" />
          <SummaryCard label="Delivered" value={summary.delivered} tone="navy" />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}

      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Layers size={17} className="text-gray-400" />
          Filter requests
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, company, category, ID..."
            className="outline-none text-sm w-full bg-transparent placeholder:text-gray-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-xl">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            placeholder="All statuses"
          >
            <option value="REQUESTED">Pending delivery</option>
            <option value="DELIVERED">Delivered</option>
          </FilterSelect>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading service requests...</div>
        ) : null}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-4 text-left">REQUEST</th>
                <th className="p-4 text-left">COMPANY</th>
                <th className="p-4 text-left">CATEGORY</th>
                <th className="p-4 text-left">SUBMITTED</th>
                <th className="p-4 text-left">STATUS</th>
                <th className="p-4 text-left">FEEDBACK</th>
                <th className="p-4 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                    {requests.length === 0 ? "No service requests yet." : "No requests match your filters."}
                  </td>
                </tr>
              ) : null}
              {paginated.map((item) => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/80">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.code}</p>
                  </td>
                  <td className="p-4 text-gray-700">{item.company}</td>
                  <td className="p-4">
                    <p className="text-gray-700">{item.category}</p>
                    <p className="text-xs text-gray-400">{item.subtype}</p>
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-gray-400" />
                      {formatDateLabel(item.createdAt)}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-4">
                    {item.status === "DELIVERED" ? (
                      item.feedbackRating ? (
                        <FeedbackRatingBadge rating={item.feedbackRating} />
                      ) : (
                        <span className="text-xs text-gray-400">Awaiting</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <RowActions
                      item={item}
                      delivering={deliveringRequestId === item.id}
                      onView={() => setViewingRequest(item)}
                      onViewFeedback={() => setViewingFeedback(item)}
                      onMarkDelivered={() => void handleMarkDelivered(item)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {!isLoading && paginated.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              {requests.length === 0 ? "No service requests yet." : "No requests match your filters."}
            </div>
          ) : null}
          {paginated.map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.code} · {item.company}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-gray-500">{item.category} · {item.subtype}</p>
              <RowActions
                item={item}
                delivering={deliveringRequestId === item.id}
                onView={() => setViewingRequest(item)}
                onViewFeedback={() => setViewingFeedback(item)}
                onMarkDelivered={() => void handleMarkDelivered(item)}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-4 text-xs sm:text-sm text-gray-500 border-t border-gray-100">
          <p>
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + paginated.length, filtered.length)} of {filtered.length} results
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {viewingRequest ? (
        <ServiceRequestDetailModal item={viewingRequest} onClose={() => setViewingRequest(null)} />
      ) : null}
      {viewingFeedback ? (
        <ServiceFeedbackDetailModal
          record={toFeedbackRecord(viewingFeedback)}
          onClose={() => setViewingFeedback(null)}
        />
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "amber" | "navy";
}) {
  const styles =
    tone === "amber"
      ? "border-amber-200 bg-amber-50/50"
      : tone === "navy"
        ? "border-[#0F2A56]/20 bg-[#0F2A56]/5"
        : "border-gray-200 bg-white";
  const valueStyles = tone === "amber" ? "text-amber-800" : tone === "navy" ? "text-[#0F2A56]" : "text-gray-900";

  return (
    <div className={`rounded-md border px-4 py-3 shadow-sm ${styles}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueStyles}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#0F2A56]/10 px-2.5 py-1 text-xs font-medium text-[#0F2A56]">
        <CheckCircle2 size={12} />
        Delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <ClipboardList size={12} />
      Pending
    </span>
  );
}

function RowActions({
  item,
  delivering,
  onView,
  onViewFeedback,
  onMarkDelivered,
}: {
  item: ServiceRequestRow;
  delivering: boolean;
  onView: () => void;
  onViewFeedback: () => void;
  onMarkDelivered: () => void;
}) {
  const canDeliver = item.status === "REQUESTED" && Boolean(item.requesterId);

  return (
    <details className="relative inline-block">
      <summary
        className="list-none cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 inline-flex [&::-webkit-details-marker]:hidden"
        aria-label={`Actions for ${item.title}`}
      >
        <Ellipsis size={18} />
      </summary>
      <div className="absolute right-0 top-full mt-1 z-20 min-w-[11rem] rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
          onClick={(event) => {
            event.preventDefault();
            closeMenu(event.currentTarget);
            onView();
          }}
        >
          <Eye size={14} />
          View details
        </button>
        {item.status === "DELIVERED" ? (
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
            onClick={(event) => {
              event.preventDefault();
              closeMenu(event.currentTarget);
              onViewFeedback();
            }}
          >
            <MessageSquareText size={14} />
            Member feedback
          </button>
        ) : null}
        {canDeliver ? (
          <button
            type="button"
            disabled={delivering}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={(event) => {
              event.preventDefault();
              closeMenu(event.currentTarget);
              onMarkDelivered();
            }}
          >
            <CheckCircle2 size={14} />
            {delivering ? "Marking…" : "Mark as delivered"}
          </button>
        ) : null}
      </div>
    </details>
  );
}

function ServiceRequestDetailModal({ item, onClose }: { item: ServiceRequestRow; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Service request</h3>
            <p className="text-xs text-gray-500 mt-0.5">{item.code}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-4 text-sm text-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {item.priority} priority
            </span>
          </div>
          <Field label="Title" value={item.title} />
          <Field label="Requesting company" value={item.company} />
          {item.requesterEmail ? <Field label="Requester email" value={item.requesterEmail} /> : null}
          {item.benefittingCompany && item.benefittingCompany !== item.company ? (
            <Field label="Benefitting member" value={item.benefittingCompany} />
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" value={item.category} />
            <Field label="Subtype" value={item.subtype} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preferred delivery" value={formatDateLabel(item.preferredDeliveryDate)} />
            <Field label="Submitted" value={formatDateLabel(item.createdAt)} />
          </div>
          {item.deliveredAt ? <Field label="Delivered" value={formatDateLabel(item.deliveredAt)} /> : null}
          <Field label="Preferred contact" value={item.preferredContactMethod} />
          <Field label="Description" value={item.detailedDescription || "—"} multiline />
          {item.feedbackRating ? (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Member feedback</p>
              <FeedbackRatingBadge rating={item.feedbackRating} size="md" />
              {item.feedbackComment ? (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.feedbackComment}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-0.5 text-gray-900 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  children: ReactNode;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2 pl-2.5 pr-9 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/80"
        >
          <option value="all">{placeholder}</option>
          {children}
        </select>
        <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
      </div>
    </div>
  );
}

function closeMenu(trigger: HTMLElement) {
  const root = trigger.closest("details");
  if (root) root.open = false;
}

function formatDateLabel(dateLike: string) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function toFeedbackRecord(item: ServiceRequestRow): ServiceFeedbackRecord {
  return {
    requestId: item.code,
    requestTitle: item.title,
    companyName: item.benefittingCompany ?? item.company,
    category: item.category,
    subtype: item.subtype,
    deliveryDate: item.deliveredAt,
    rating: item.feedbackRating,
    description: null,
    comment: item.feedbackComment,
    submittedAt: item.feedbackSubmittedAt,
  };
}
