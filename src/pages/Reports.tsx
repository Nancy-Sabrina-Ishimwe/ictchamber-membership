import { useState } from "react";
import {
  Users,
  UserPlus,
  Clock,
  Wallet,
  Calendar,
  FileDown,
  Printer,
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

/* COLORS (MATCH FIGMA) */
const COLORS = ["#0F2A44", "#EAB308", "#CBD5F5", "#F97316"];

/* DATA */
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

const categoryData = [
  { name: "Platinum", value: 450 },
  { name: "Gold", value: 320 },
  { name: "Silver", value: 250 },
  { name: "Bronze", value: 220 },
];

const clusterData = [
  { name: "Fintech", value: 142 },
  { name: "AI", value: 64 },
  { name: "E-commerce", value: 115 },
  { name: "Infrastructure", value: 87 },
];

const typeData = [
  { name: "Commercial", value: 50 },
  { name: "Partners", value: 20 },
  { name: "Business", value: 45 },
  { name: "Associated", value: 25 },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Member Directory</h2>

        <div className="flex gap-2">
          <Button icon={<FileDown size={16} />} label="Export Excel" />
          <Button icon={<FileDown size={16} />} label="Export PDF" />
          <Button icon={<Printer size={16} />} label="Print" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
        <Tab active={activeTab === "services"} onClick={() => setActiveTab("services")} label="Service usage" />
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center border">

        <div className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm text-gray-600">
          <Calendar size={16} />
          YTD (Jan - Dec)
        </div>

        <select className="border px-3 py-2 rounded-md text-sm text-gray-600">
          <option>Select Membership type</option>
        </select>

        <select className="border px-3 py-2 rounded-md text-sm text-gray-600">
          <option>Select Cluster</option>
        </select>

        <button className="ml-auto bg-[#0F2A44] text-white px-4 py-2 rounded-md text-sm">
          Apply Filters
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Members" value="1,240" change="+12%" icon={<Users />} />
        <StatCard title="Pending Applications" value="32" change="14 require review" icon={<UserPlus />} />
        <StatCard title="Renewals Due" value="18" change="5 overdue" icon={<Clock />} />
        <StatCard title="Membership Revenue" value="45,200 RWF" change="+8.4%" icon={<Wallet />} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-3 gap-6">

        {/* LINE */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold text-gray-800">Revenue Growth</h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly breakdown of membership fee collection.
          </p>

          <ResponsiveContainer width="100%" height={250}>
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

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Members by Cluster" data={clusterData} />
        <ChartCard title="Members by Type" data={typeData} />
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Button({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
      {icon} {label}
    </button>
  );
}

function Tab({ active, label, onClick }: any) {
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

function StatCard({ title, value, change, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        <p className="text-xs text-gray-400">{change}</p>
      </div>

      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

function ChartCard({ title, data }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={90} dataKey="value">
            {data.map((_: any, i: number) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm space-y-2">
        {data.map((item: any, i: number) => (
          <div key={i} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}