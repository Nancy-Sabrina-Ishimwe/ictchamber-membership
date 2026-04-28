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
  id: number;
  company: string;
  initials: string;
  color: string;
  action: string;
  date: string;
  amount: string;
  status: ActivityStatus;
};

const activities: ActivityItem[] = [
  { id: 101, company: "TechVision Rwanda",      initials: "TV", color: "#1a1a2e", action: "Membership Renewed", date: "Today, 10:23 AM",     amount: "$500", status: "Success" },
  { id: 102, company: "Kigali Cloud Solutions",  initials: "KC", color: "#e91e63", action: "New Registration",   date: "Today, 09:15 AM",     amount: "-",    status: "Pending" },
  { id: 103, company: "Rwanda AgriTech",         initials: "RA", color: "#4caf50", action: "Payment Failed",     date: "Yesterday, 14:45 PM", amount: "$250", status: "Failed"  },
  { id: 104, company: "FinServe Africa",         initials: "FA", color: "#2196f3", action: "Profile Updated",    date: "Yesterday, 11:30 AM", amount: "-",    status: "Info"    },
  { id: 105, company: "EduConnect Ltd",          initials: "EC", color: "#9e9e9e", action: "Membership Expired", date: "Oct 24, 2023",        amount: "-",    status: "Warning" },
];

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
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [requestTrend, setRequestTrend] = useState<RequestsByMonth[]>([]);
  const [partnerTrend, setPartnerTrend] = useState<RequestsByMonth[]>([]);
  const [averageDeliveryDays, setAverageDeliveryDays] = useState(0);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);

      try {
        const [dashboardRes, serviceRequestsRes, partnersRes] = await Promise.all([
          api.get<DashboardAnalyticsResponse>("/analytics/dashboard"),
          api.get<ServiceRequestsAnalyticsResponse>("/analytics/service-requests"),
          api.get<PartnersAnalyticsResponse>("/analytics/partners"),
        ]);

        setSummary(dashboardRes.data.data.summary);
        setRequestTrend(serviceRequestsRes.data.data.requestsLastSixMonths ?? []);
        setPartnerTrend(partnersRes.data.data.partnersLastSixMonths ?? []);
        setAverageDeliveryDays(serviceRequestsRes.data.data.averageDeliveryDays ?? 0);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load analytics data.";
        setAnalyticsError(message);
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

  const serviceRequestChartData = useMemo(
    () =>
      requestTrend.map((item) => ({
        month: item.month.slice(5),
        requests: item.count,
      })),
    [requestTrend],
  );

  const partnersChartData = useMemo(
    () =>
      partnerTrend.map((item) => ({
        month: item.month.slice(5),
        partners: item.count,
      })),
    [partnerTrend],
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hello, Admin 👋</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Here is what's happening with the Membership today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
            <Mail size={15} className="text-gray-500" /> Bulk Message
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
            <Download size={15} className="text-gray-500" /> Export
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm px-3 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <Filter size={14} /> Filter
        </button>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
            <Calendar size={14} /> YTD (Jan - Jul)
          </button>
          <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
            <Calendar size={14} /> Select Date
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
      </div>

      {analyticsError ? (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-3 text-sm">
          Could not load analytics: {analyticsError}
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Service Requests</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 mb-3">
            Last 6 months ({averageDeliveryDays} avg delivery days)
          </p>
          <div className="-ml-2 sm:-ml-1">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart
              data={serviceRequestChartData}
              barSize={24}
              margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                width={34}
              />
              <Tooltip content={<CountTooltip />} cursor={{ fill: "#f9f9f9" }} />
              <Bar dataKey="requests" fill="#EAB308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Area Chart */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Partner Growth</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 mb-3">Partners created in last 6 months</p>
          <div className="-ml-2 sm:-ml-1">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart
              data={partnersChartData}
              margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRenewed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                width={30}
              />
              <Tooltip content={<MemberTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => (
                  <span className="text-xs text-gray-600">
                    {v === "partners" ? "Partners" : v}
                  </span>
                )}
              />
              <Area type="monotone" dataKey="partners" name="partners" stroke="#22c55e" strokeWidth={2} fill="url(#colorRenewed)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isLoadingAnalytics ? (
        <p className="text-sm text-gray-500">Loading analytics...</p>
      ) : null}

      {/* Recent Activity */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-gray-500" />
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Recent Activity</h3>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {activities.map((item) => (
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
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-xs font-semibold text-gray-400 tracking-wider">COMPANY / MEMBER</th>
                <th className="text-left py-3 text-xs font-semibold text-gray-400 tracking-wider">ACTION</th>
                <th className="text-left py-3 text-xs font-semibold text-gray-400 tracking-wider">DATE & TIME</th>
                <th className="text-left py-3 text-xs font-semibold text-gray-400 tracking-wider">AMOUNT</th>
                <th className="text-right py-3 text-xs font-semibold text-gray-400 tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activities.map((item) => (
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
                  <td className="py-4 font-semibold text-gray-800">{item.amount}</td>
                  <td className="py-4 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}