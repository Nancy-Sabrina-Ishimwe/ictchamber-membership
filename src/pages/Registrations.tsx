import { Download, Search, Filter, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type RegistrationItem = {
  id: string;
  appCode: string;
  companyName: string;
  location: string;
  submittedOn: string;
  cluster: string;
};

type MemberApiItem = {
  id: number;
  companyName: string;
  active: boolean;
  cluster?: { clusterName: string } | null;
  address?: string | null;
  selectedTier?: { tierName: string } | null;
  subscriptions?: Array<{ startDate: string }>;
};

type MembersApiResponse = {
  success: boolean;
  count: number;
  data: MemberApiItem[];
};

function formatDate(raw?: string) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function mapRegistration(item: MemberApiItem): RegistrationItem {
  return {
    id: String(item.id),
    appCode: `APP-${String(item.id).padStart(6, "0")}`,
    companyName: item.companyName,
    location: item.address ?? "-",
    submittedOn: formatDate(item.subscriptions?.[0]?.startDate),
    cluster: item.cluster?.clusterName ?? "-",
  };
}

export default function Registrations() {
  const [search, setSearch] = useState("");
  const [openPreviewId, setOpenPreviewId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<MembersApiResponse>("/members");
        const mapped = (response.data.data ?? [])
          .filter((member) => !member.active || !member.selectedTier)
          .map(mapRegistration);
        setRegistrations(mapped);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load registrations.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRegistrations();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return registrations;
    return registrations.filter((item) =>
      [item.companyName, item.location, item.appCode, item.cluster].join(" ").toLowerCase().includes(query),
    );
  }, [search, registrations]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Review and manage incoming membership applications.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by company, CEO, or TIN..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50"
            aria-label="Filter registrations"
          >
            <Filter size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-md border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
            Loading registrations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
            No registrations found for this search.
          </div>
        ) : (
          filtered.map((item) => {
            const expanded = openPreviewId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-md border border-gray-200 bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 ring-1 ring-gray-200" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900">{item.companyName}</p>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                          {item.appCode}
                        </span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-gray-500">
                        <MapPin size={13} />
                        {item.location}
                        <span className="mx-1 text-gray-300">•</span>
                        Submitted: {item.submittedOn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {item.cluster}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenPreviewId((prev) => (prev === item.id ? null : item.id))}
                      className="inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#9A6C00] hover:bg-[#FDE68A]"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenPreviewId((prev) => (prev === item.id ? null : item.id))}
                      className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                      aria-label={`Toggle ${item.companyName} preview`}
                    >
                      <ChevronDown size={16} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <div className="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                    Registration preview for <span className="font-semibold text-gray-800">{item.companyName}</span>.
                    Review details and approve/reject workflow can be connected here.
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

