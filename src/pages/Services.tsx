import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  UserPlus2,
  Activity,
  Users,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type TrendItem = {
  month: string;
  requested: number;
  delivered: number;
};

type ActivityItem = {
  id: number;
  title: string;
  company: string;
  time: string;
  icon: "delivered" | "request" | "member" | "maintenance";
};

type ServicesAnalyticsResponse = {
  success: boolean;
  data: {
    summary: {
      totalMembers: number;
      pendingRequests: number;
      deliveredServices: number;
      activeServices: number;
    };
    trendsLastSixMonths: TrendItem[];
    recentActivity: Array<{
      id: number;
      title: string;
      company: string;
      status: "REQUESTED" | "DELIVERED";
      createdAt: string;
      deliveredAt: string | null;
      updatedAt: string;
    }>;
  };
};

export default function DeliveredServices() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalMembers: 0,
    pendingRequests: 0,
    deliveredServices: 0,
    activeServices: 0,
  });
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const response = await api.get<ServicesAnalyticsResponse>("/analytics/services/superadmin");
        const payload = response.data.data;
        setSummary(payload.summary);
        setTrendData(payload.trendsLastSixMonths);
        setActivities(
          payload.recentActivity.map((activity) => ({
            id: activity.id,
            title: activity.title,
            company: activity.company,
            time: formatRelativeTime(activity.deliveredAt ?? activity.updatedAt ?? activity.createdAt),
            icon: activity.status === "DELIVERED" ? "delivered" : "request",
          })),
        );
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load services analytics.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAnalytics();
  }, []);

  const stats = useMemo(
    () => [
      { title: "Total Members", value: summary.totalMembers.toLocaleString(), delta: "Current total", positive: true, icon: Users },
      { title: "Pending Requests", value: summary.pendingRequests.toLocaleString(), delta: "Awaiting delivery", positive: false, icon: ClipboardCheck },
      { title: "Services Delivered", value: summary.deliveredServices.toLocaleString(), delta: "Completed requests", positive: true, icon: CheckCircle2 },
      { title: "Active Services", value: summary.activeServices.toLocaleString(), delta: "Registered service types", positive: true, icon: Activity },
    ],
    [summary],
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Here&apos;s a summary of your service management activities.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-xs sm:text-sm bg-white hover:bg-gray-50 transition-colors">
            <Calendar size={14} />
            Last 30 Days
          </button>
          <button
            onClick={() => navigate("/admin/services/delivered")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md px-3 py-2 text-xs sm:text-sm bg-yellow-500 hover:bg-yellow-400 font-medium transition-colors"
          >
            Delivered Services
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-7 bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Service Delivery Trends</h3>
          <p className="text-xs text-gray-500 mt-1">Requests vs. Deliveries over the last 6 months.</p>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} width={28} />
                <Tooltip />
                <Bar dataKey="requested" fill="#EAB308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="#0F2A56" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />Requested</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0F2A56]" />Delivered</span>
          </div>
        </div>

        <div className="xl:col-span-5 bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-xs text-gray-500 mt-1">Latest actions across the platform.</p>
          <div className="mt-3 space-y-2.5">
            {isLoading && activities.length === 0 ? (
              <p className="text-xs text-gray-500">Loading activity...</p>
            ) : null}
            {!isLoading && activities.length === 0 ? (
              <p className="text-xs text-gray-500">No recent service activity found.</p>
            ) : null}
            {activities.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  delta,
  positive,
  icon: Icon,
}: {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-gray-600">{title}</p>
        <span className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-[#0F2A56]">
          <Icon size={14} />
        </span>
      </div>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
      <p className={`text-[11px] mt-1 ${positive ? "text-green-600" : "text-red-500"}`}>
        {positive ? "↗" : "↘"} {delta}
      </p>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const iconMap = {
    delivered: <CheckCircle2 size={13} className="text-[#0F2A56]" />,
    request: <ClipboardCheck size={13} className="text-orange-500" />,
    member: <UserPlus2 size={13} className="text-gray-400" />,
    maintenance: <Activity size={13} className="text-gray-400" />,
  };

  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        {iconMap[item.icon]}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-900 break-words">{item.title}</p>
        <p className="text-xs text-gray-500 truncate">{item.company}</p>
        <p className="text-[11px] text-gray-400 mt-1">{item.time}</p>
      </div>
    </div>
  );
}

function formatRelativeTime(dateLike: string) {
  const timestamp = new Date(dateLike);
  if (Number.isNaN(timestamp.getTime())) return "Unknown time";

  const diffMs = Date.now() - timestamp.getTime();
  const hourMs = 1000 * 60 * 60;
  const dayMs = hourMs * 24;

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${minutes} min ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(diffMs / dayMs);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}