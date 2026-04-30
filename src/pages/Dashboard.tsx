import {
  Users, UserCheck, UserX, DollarSign,
  Filter, Download, Mail, Calendar, Activity
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

type DashboardSummary = {
  totalMembers: number;
  activeMembers: number;
  totalPartners: number;
  requestedServices: number;
  deliveredServices: number;
  highPriorityPending: number;
  deliveryRate: number;
  totalClusters: number;
  totalSubclusters: number;
};

type MembershipTier = {
  tierId: number;
  tierName: string;
  membersCount: number;
};

type DashboardAnalyticsResponse = {
  success: boolean;
  data: {
    summary: DashboardSummary;
    membershipByTier: MembershipTier[];
  };
};

type RequestsByMonth = {
  month: string;
  count: number;
};

type ServiceRequestsAnalyticsResponse = {
  success: boolean;
  data: {
    statusBreakdown: unknown[];
    topCategories: unknown[];
    averageDeliveryDays: number;
    requestsLastSixMonths: RequestsByMonth[];
  };
};

type PartnersAnalyticsResponse = {
  success: boolean;
  data: {
    totalsByStatus: {
      ongoing: number;
      incoming: number;
      completed: number;
    };
    partnersLastSixMonths: RequestsByMonth[];
  };
};

const emptySummary: DashboardSummary = {
  totalMembers: 0,
  activeMembers: 0,
  totalPartners: 0,
  requestedServices: 0,
  deliveredServices: 0,
  highPriorityPending: 0,
  deliveryRate: 0,
  totalClusters: 0,
  totalSubclusters: 0,
};

type ActivityItem = {
  id: string;
  company: string;
  initials: string;
  color: string;
  action: string;
  date: string;
  rawDate?: string;
  status: ActivityStatus;
};

type RecentActivityResponse = {
  success: boolean;
  count: number;
  data: Array<{
    type: string;
    date: string;
    title: string;
    description: string;
    metadata?: Record<string, unknown>;
  }>;
};

const activityStatusByType: Record<string, ActivityStatus> = {
  SERVICE_REQUEST_SUBMITTED: "Pending",
  SERVICE_REQUEST_DELIVERED: "Success",
  MEMBERSHIP_SUBSCRIPTION_UPDATED: "Success",
  PARTNER_PROGRAM_UPDATED: "Info",
};

const activityColorByType: Record<string, string> = {
  SERVICE_REQUEST_SUBMITTED: "#f59e0b",
  SERVICE_REQUEST_DELIVERED: "#22c55e",
  MEMBERSHIP_SUBSCRIPTION_UPDATED: "#1a1a2e",
  PARTNER_PROGRAM_UPDATED: "#2196f3",
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "NA";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function formatActivityDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// ─── Skeleton components ─────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4 flex flex-col gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-md bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-7 bg-gray-200 rounded w-14" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse pt-1">
      <div className="h-4 bg-gray-200 rounded w-32 mb-1.5" />
      <div className="h-3 bg-gray-200 rounded w-48 mb-4" />
      <div className="h-[170px] bg-gray-100 rounded-md" />
    </div>
  );
}

function ActivityCardSkeleton() {
  return (
    <div className="rounded-md border border-gray-100 p-3 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </td>
      <td className="py-4"><div className="h-3 bg-gray-200 rounded w-28" /></td>
      <td className="py-4"><div className="h-3 bg-gray-200 rounded w-24" /></td>
      <td className="py-4 text-right"><div className="h-5 bg-gray-200 rounded-full w-16 ml-auto" /></td>
    </tr>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
const statusStyles = {
  Success: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed:  "bg-red-100 text-red-700",
  Info:    "bg-blue-100 text-blue-700",
  Warning: "bg-orange-100 text-orange-700",
};

type ActivityStatus = keyof typeof statusStyles;

function StatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon,
  title,
  value,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-md flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

// ─── Custom Tooltips ─────────────────────────────────────────────────────────
function CountTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-yellow-600">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
}

function MemberTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [requestTrend, setRequestTrend] = useState<RequestsByMonth[]>([]);
  const [partnerTrend, setPartnerTrend] = useState<RequestsByMonth[]>([]);
  const [averageDeliveryDays, setAverageDeliveryDays] = useState(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<"ytd" | "last30" | "last90" | "last6m">("ytd");
  const [selectedDate, setSelectedDate] = useState("");
  const [activityStatusFilter, setActivityStatusFilter] = useState<"all" | ActivityStatus>("all");
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 5;

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);

      try {
        const [dashboardRes, serviceRequestsRes, partnersRes, recentActivityRes] = await Promise.all([
          api.get<DashboardAnalyticsResponse>("/analytics/dashboard"),
          api.get<ServiceRequestsAnalyticsResponse>("/analytics/service-requests"),
          api.get<PartnersAnalyticsResponse>("/analytics/partners"),
          api.get<RecentActivityResponse>("/analytics/recent-activity"),
        ]);

        setSummary(dashboardRes.data.data.summary);
        setRequestTrend(serviceRequestsRes.data.data.requestsLastSixMonths ?? []);
        setPartnerTrend(partnersRes.data.data.partnersLastSixMonths ?? []);
        setAverageDeliveryDays(serviceRequestsRes.data.data.averageDeliveryDays ?? 0);
        const mappedActivities: ActivityItem[] = (recentActivityRes.data.data ?? []).map((item, index) => ({
          id: String(item.metadata?.requestId ?? item.metadata?.partnerId ?? item.metadata?.subscriptionId ?? `${item.date}-${index}`),
          company: item.title,
          initials: getInitials(item.title),
          color: activityColorByType[item.type] ?? "#6b7280",
          action: item.description,
          date: formatActivityDate(item.date),
          rawDate: item.date,
          status: activityStatusByType[item.type] ?? "Info",
        }));
        setRecentActivities(mappedActivities);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load analytics data.";
        setAnalyticsError(message);
        setRecentActivities([]);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    void fetchAnalytics();
  }, []);

  const inactiveMembers = useMemo(
    () => Math.max(summary.totalMembers - summary.activeMembers, 0),
    [summary.activeMembers, summary.totalMembers],
  );

  const periodStartDate = useMemo(() => {
    const now = new Date();
    if (periodFilter === "last30") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
    if (periodFilter === "last90") {
      const d = new Date(now);
      d.setDate(d.getDate() - 90);
      return d;
    }
    if (periodFilter === "last6m") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 5, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return new Date(now.getFullYear(), 0, 1);
  }, [periodFilter]);

  const filteredRequestTrend = useMemo(() => {
    const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
    return requestTrend.filter((item) => {
      const [year, month] = item.month.split("-").map(Number);
      if (!year || !month) return false;
      const monthDate = new Date(year, month - 1, 1);
      const inPeriod = monthDate >= periodStartDate;
      const matchesDate =
        !selected ||
        (monthDate.getFullYear() === selected.getFullYear() && monthDate.getMonth() === selected.getMonth());
      return inPeriod && matchesDate;
    });
  }, [periodStartDate, requestTrend, selectedDate]);

  const filteredPartnerTrend = useMemo(() => {
    const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
    return partnerTrend.filter((item) => {
      const [year, month] = item.month.split("-").map(Number);
      if (!year || !month) return false;
      const monthDate = new Date(year, month - 1, 1);
      const inPeriod = monthDate >= periodStartDate;
      const matchesDate =
        !selected ||
        (monthDate.getFullYear() === selected.getFullYear() && monthDate.getMonth() === selected.getMonth());
      return inPeriod && matchesDate;
    });
  }, [periodStartDate, partnerTrend, selectedDate]);

  const serviceRequestChartData = useMemo(
    () =>
      filteredRequestTrend.map((item) => ({
        month: item.month.slice(5),
        requests: item.count,
      })),
    [filteredRequestTrend],
  );

  const partnersChartData = useMemo(
    () =>
      filteredPartnerTrend.map((item) => ({
        month: item.month.slice(5),
        partners: item.count,
      })),
    [filteredPartnerTrend],
  );

  const filteredActivities = useMemo(() => {
    const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
    return recentActivities.filter((item) => {
      const statusMatch = activityStatusFilter === "all" || item.status === activityStatusFilter;
      if (!statusMatch) return false;
      if (!selected) return true;
      if (!item.rawDate) return true;
      const activityDate = new Date(item.rawDate);
      return (
        activityDate.getFullYear() === selected.getFullYear() &&
        activityDate.getMonth() === selected.getMonth() &&
        activityDate.getDate() === selected.getDate()
      );
    });
  }, [activityStatusFilter, recentActivities, selectedDate]);

  useEffect(() => {
    setActivityPage(1);
  }, [activityStatusFilter, selectedDate]);

  const activityTotalPages = Math.max(1, Math.ceil(filteredActivities.length / activityPageSize));

  const paginatedActivities = useMemo(() => {
    const start = (activityPage - 1) * activityPageSize;
    return filteredActivities.slice(start, start + activityPageSize);
  }, [activityPage, filteredActivities]);

  const periodLabel = useMemo(() => {
    if (periodFilter === "last30") return "Last 30 days";
    if (periodFilter === "last90") return "Last 90 days";
    if (periodFilter === "last6m") return "Last 6 months";
    return "YTD";
  }, [periodFilter]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hello, {user?.name ?? "Admin"} 👋</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Here is what's happening with the Membership today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/messaging" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
            <Mail size={15} className="text-gray-500" /> Bulk Message
          </Link>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
            <Download size={15} className="text-gray-500" /> Export
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm px-3 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          {/* <button
            type="button"
            onClick={() => setShowFilterMenu((prev) => !prev)}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter size={14} /> Filter
          </button> */}
          {showFilterMenu ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
              <p className="px-1 pb-1 text-[11px] font-semibold text-gray-500">Activity status</p>
              {(["all", "Success", "Pending", "Failed", "Info", "Warning"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setActivityStatusFilter(status);
                    setShowFilterMenu(false);
                  }}
                  className={`block w-full rounded-sm px-2 py-1.5 text-left text-xs ${
                    activityStatusFilter === status ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {status === "all" ? "All statuses" : status}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md">
            <Calendar size={14} />
            <select
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value as "ytd" | "last30" | "last90" | "last6m")}
              className="bg-transparent outline-none"
            >
              <option value="ytd">YTD</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="last6m">Last 6 months</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md">
            <Calendar size={14} />
            <span className="text-gray-500">Select Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="bg-transparent outline-none text-xs sm:text-sm"
            />
          </label>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoadingAnalytics ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={<Users size={22} className="text-blue-600" />}
              iconBg="bg-blue-100"
              title="Total Members"
              value={summary.totalMembers.toLocaleString()}
            />
            <StatCard
              icon={<UserCheck size={22} className="text-green-600" />}
              iconBg="bg-green-100"
              title="Active Members"
              value={summary.activeMembers.toLocaleString()}
            />
            <StatCard
              icon={<UserX size={22} className="text-red-500" />}
              iconBg="bg-red-100"
              title="Inactive Members"
              value={inactiveMembers.toLocaleString()}
            />
            <StatCard
              icon={<DollarSign size={22} className="text-yellow-600" />}
              iconBg="bg-yellow-100"
              title="Total Partners"
              value={summary.totalPartners.toLocaleString()}
            />
          </>
        )}
      </div>

      {analyticsError ? (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-3 text-sm">
          Could not load analytics: {analyticsError}
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Service Requests Bar Chart */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
          {isLoadingAnalytics ? <ChartSkeleton /> : (
            <>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Service Requests</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 mb-3">
                {periodLabel} ({averageDeliveryDays} avg delivery days)
              </p>
              <div className="-ml-2 sm:-ml-1">
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart
                    data={serviceRequestChartData}
                    barSize={24}
                    margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} width={34} />
                    <Tooltip content={<CountTooltip />} cursor={{ fill: "#f9f9f9" }} />
                    <Bar dataKey="requests" fill="#EAB308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Partner Growth Area Chart */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
          {isLoadingAnalytics ? <ChartSkeleton /> : (
            <>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Partner Growth</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 mb-3">Partners created in {periodLabel.toLowerCase()}</p>
              <div className="-ml-2 sm:-ml-1">
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={partnersChartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRenewed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} width={30} />
                    <Tooltip content={<MemberTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => (
                        <span className="text-xs text-gray-600">{v === "partners" ? "Partners" : v}</span>
                      )}
                    />
                    <Area type="monotone" dataKey="partners" name="partners" stroke="#22c55e" strokeWidth={2} fill="url(#colorRenewed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-gray-500" />
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Recent Activity</h3>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {isLoadingAnalytics
            ? Array.from({ length: 3 }).map((_, i) => <ActivityCardSkeleton key={i} />)
            : paginatedActivities.map((item) => (
                <div key={item.id} className="rounded-md border border-gray-100 p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-gray-900">{item.company}</p>
                      <p className="text-xs text-gray-400">ID: #{item.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">{item.action}</p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))
          }
        </div>

        {/* Desktop table */}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-xs font-semibold text-gray-400 tracking-wider">COMPANY / MEMBER</th>
                <th className="text-left py-3 text-xs font-semibold text-gray-400 tracking-wider">ACTION</th>
                <th className="text-left py-3 text-xs font-semibold text-gray-400 tracking-wider">DATE & TIME</th>
                <th className="text-right py-3 text-xs font-semibold text-gray-400 tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoadingAnalytics
                ? Array.from({ length: 4 }).map((_, i) => <ActivityRowSkeleton key={i} />)
                : paginatedActivities.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.company}</p>
                        <p className="text-xs text-gray-400">ID: #{item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-600">{item.action}</td>
                  <td className="py-4 text-gray-500">{item.date}</td>
                  <td className="py-4 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))
              }
            </tbody>
          </table>
        </div>

        {!isLoadingAnalytics && filteredActivities.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Showing {(activityPage - 1) * activityPageSize + 1} to{" "}
              {Math.min(activityPage * activityPageSize, filteredActivities.length)} of {filteredActivities.length} activities
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActivityPage((prev) => Math.max(prev - 1, 1))}
                disabled={activityPage === 1}
                className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: activityTotalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setActivityPage(page)}
                    className={`rounded-md px-2.5 py-1 text-xs ${
                      page === activityPage
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setActivityPage((prev) => Math.min(prev + 1, activityTotalPages))}
                disabled={activityPage === activityTotalPages}
                className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

    </div>
  );
}
