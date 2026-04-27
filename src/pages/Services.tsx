import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  UserPlus2,
  Activity,
  Users,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";

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

const stats = [
  { title: "Total Members", value: "1,248", delta: "12% from last month", positive: true, icon: Users },
  { title: "Pending Requests", value: "42", delta: "5% from last week", positive: false, icon: ClipboardCheck },
  { title: "Services Delivered", value: "892", delta: "18% from last month", positive: true, icon: CheckCircle2 },
  { title: "Active Services", value: "156", delta: "2% from last week", positive: true, icon: Activity },
];

const trendData: TrendItem[] = [
  { month: "Jan", requested: 23, delivered: 30 },
  { month: "Feb", requested: 52, delivered: 40 },
  { month: "Mar", requested: 48, delivered: 52 },
  { month: "Apr", requested: 61, delivered: 50 },
  { month: "May", requested: 55, delivered: 58 },
  { month: "Jun", requested: 67, delivered: 78 },
];

const activities: ActivityItem[] = [
  { id: 1, title: "Service Delivered", company: "Acme Corp", time: "2 hours ago", icon: "delivered" },
  { id: 2, title: "New Request", company: "Globex Inc", time: "4 hours ago", icon: "request" },
  { id: 3, title: "New Member Added", company: "Stark Industries", time: "Yesterday", icon: "member" },
  { id: 4, title: "Service Delivered", company: "Wayne Enterprises", time: "Yesterday", icon: "delivered" },
  { id: 5, title: "System Maintenance", company: "Server #4", time: "2 days ago", icon: "maintenance" },
];

export default function DeliveredServices() {
  const navigate = useNavigate();

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