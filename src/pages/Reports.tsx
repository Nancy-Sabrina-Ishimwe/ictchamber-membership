import { useState } from "react";
import {
  Users,
  UserPlus,
  Clock,
  Wallet,
  Calendar,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

/* ================= TYPES ================= */

type ChartItem = {
  name: string;
  value: number;
};

/* ================= DATA ================= */

const revenueData = [
  { month: "Jan", value: 6 },
  { month: "Feb", value: 7 },
  { month: "Mar", value: 6.5 },
  { month: "Apr", value: 9 },
  { month: "May", value: 11 },
  { month: "Jun", value: 13 },
  { month: "Jul", value: 12 },
  { month: "Aug", value: 14 },
  { month: "Sep", value: 16 },
  { month: "Oct", value: 18 },
  { month: "Nov", value: 20 },
  { month: "Dec", value: 22 },
];

const categoryData: ChartItem[] = [
  { name: "Platinum", value: 450 },
  { name: "Gold", value: 320 },
  { name: "Silver", value: 250 },
  { name: "Bronze", value: 220 },
];

const clusterData: ChartItem[] = [
  { name: "Fintech", value: 142 },
  { name: "Drones", value: 38 },
  { name: "Infrastructure", value: 87 },
  { name: "AI", value: 64 },
  { name: "E-commerce", value: 115 },
];

const typeData: ChartItem[] = [
  { name: "Commercial Company", value: 50 },
  { name: "Program Partners", value: 20 },
  { name: "Multiple Business", value: 45 },
  { name: "Program", value: 13 },
  { name: "Associated", value: 25 },
];

/* COLORS (match design) */
const COLORS = [
  "#0F2A44",
  "#EAB308",
  "#94A3B8",
  "#F97316",
  "#6366F1",
];

/* ================= PAGE ================= */

export default function Reports() {
  const [tab, setTab] = useState<"overview" | "services">("overview");

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Member Directory</h2>
        <p className="text-gray-500 text-sm">
          Key metrics and trends for membership and financials.
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <Tab label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
        <Tab label="Service usage" active={tab === "services"} onClick={() => setTab("services")} />
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-center">
        <div className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm">
          <Calendar size={16} />
          YTD (Jan - Dec)
        </div>

        <select className="border px-3 py-2 rounded-md text-sm">
          <option>Select Membership type</option>
        </select>

        <select className="border px-3 py-2 rounded-md text-sm">
          <option>Select Cluster</option>
        </select>

        <button className="ml-auto bg-[#0F2A44] text-white px-4 py-2 rounded-md text-sm">
          Apply Filters
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Members" value="1,240" change="+12% from last year" icon={<Users size={18} />} />
        <StatCard title="Pending Applications" value="32" change="14 require review" icon={<UserPlus size={18} />} />
        <StatCard title="Renewals Due" value="18" change="5 overdue by 30+ days" icon={<Clock size={18} />} />
        <StatCard title="Membership Revenue" value="45,200 RWF" change="+8.4% vs previous period" icon={<Wallet size={18} />} />
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-3 gap-6">

        {/* LINE CHART */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold">Revenue Growth</h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly breakdown of membership fee collection.
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0F2A44"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ChartCard title="Members by Category" data={categoryData} />
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Members by Cluster" data={clusterData} />
        <ChartCard title="Members by Type" data={typeData} />
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm ${
        active ? "bg-yellow-500 text-black" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-xs text-gray-400">{change}</p>
      </div>

      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

/* 🔥 FIXED CHART CARD (LIKE DESIGN) */
function ChartCard({
  title,
  data,
}: {
  title: string;
  data: ChartItem[];
}) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="font-semibold mb-4">{title}</h3>

      <div className="flex items-center gap-6">

        {/* CHART */}
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="w-1/2 space-y-3 text-sm">
          {data.map((item, i) => {
            const percent = ((item.value / total) * 100).toFixed(1);

            return (
              <div key={item.name} className="flex justify-between items-center">

                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>

                <div className="flex gap-4 text-gray-600">
                  <span>{item.value}</span>
                  <span>{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}