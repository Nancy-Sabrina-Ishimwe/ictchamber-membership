import {
  Users, UserCheck, UserX, DollarSign,
  Filter, Download, Mail, Calendar, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from "recharts";

// ─── Data ───────────────────────────────────────────────────────────────────
const revenueData = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 41000 },
  { month: "Mar", revenue: 37000 },
  { month: "Apr", revenue: 48000 },
  { month: "May", revenue: 45000 },
  { month: "Jun", revenue: 62000 },
  { month: "Jul", revenue: 57000 },
];

const membershipData = [
  { month: "Jan", new: 48, renewed: 132 },
  { month: "Feb", new: 55, renewed: 138 },
  { month: "Mar", new: 60, renewed: 125 },
  { month: "Apr", new: 52, renewed: 145 },
  { month: "May", new: 70, renewed: 155 },
  { month: "Jun", new: 65, renewed: 172 },
  { month: "Jul", new: 80, renewed: 180 },
];

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

const stats = {
  totalOrganizations: "2,845",
  activeMembers: "2,103",
  inactiveMembers: "42",
  renewalDue: "9",
};

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
function RevenueTooltip({
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
        <p className="text-yellow-600">${payload[0].value.toLocaleString()}</p>
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
          title="Total Organizations"
          value={stats.totalOrganizations}
        />
        <StatCard
          icon={<UserCheck size={22} className="text-green-600" />}
          iconBg="bg-green-100"
          title="Active Members"
          value={stats.activeMembers}
        />
        <StatCard
          icon={<UserX size={22} className="text-red-500" />}
          iconBg="bg-red-100"
          title="Inactive Members"
          value={stats.inactiveMembers}
        />
        <StatCard
          icon={<DollarSign size={22} className="text-yellow-600" />}
          iconBg="bg-yellow-100"
          title="Renewal Due"
          value={stats.renewalDue}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Revenue Growth</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 mb-3">Monthly revenue collection (YTD)</p>
          <div className="-ml-2 sm:-ml-1">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart
              data={revenueData}
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
                tickFormatter={(v) => `$${v / 1000}k`}
                width={34}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: "#f9f9f9" }} />
              <Bar dataKey="revenue" fill="#EAB308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Area Chart */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Membership Trends</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 mb-3">New vs Renewed members</p>
          <div className="-ml-2 sm:-ml-1">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart
              data={membershipData}
              margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
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
                    {v === "new" ? "New Members" : "Renewed"}
                  </span>
                )}
              />
              <Area type="monotone" dataKey="renewed" name="renewed" stroke="#22c55e" strokeWidth={2} fill="url(#colorRenewed)" />
              <Area type="monotone" dataKey="new"     name="new"     stroke="#3b82f6" strokeWidth={2} fill="url(#colorNew)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
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