import { useNavigate } from "react-router-dom";
import {
  
  Users,
  UserPlus,
  Clock,
  Wallet,
  Download,
  Printer,
  FileDown,
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
type PieItem = {
  name: string;
  value: number;
  percent?: string;
};

/* ================= DATA ================= */

const revenueData = [
  { month: "Jan", value: 6 },
  { month: "Feb", value: 7 },
  { month: "Mar", value: 6 },
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

const categoryData: PieItem[] = [
  { name: "Platinum", value: 450 },
  { name: "Gold", value: 320 },
  { name: "Silver", value: 250 },
  { name: "Bronze", value: 220 },
];

const clusterData: PieItem[] = [
  { name: "Fintech", value: 142, percent: "16.0%" },
  { name: "Drones and Robotics", value: 38, percent: "4.3%" },
  { name: "Infrastructure and connectivity", value: 87, percent: "9.8%" },
  { name: "Artificial intelligence", value: 64, percent: "7.2%" },
  { name: "E-commerce and e-Services", value: 115, percent: "13.0%" },
  { name: "IT Hardware and Solutions", value: 92, percent: "10.4%" },
  { name: "Multimedia and Digital agents", value: 53, percent: "6.0%" },
];

const typeData: PieItem[] = [
  { name: "Commercial Company", value: 50 },
  { name: "Program Partners", value: 20 },
  { name: "Multiple Business", value: 45 },
  { name: "Program", value: 13 },
  { name: "Associated", value: 25 },
  { name: "Individual Professional", value: 8 },
];

const COLORS = [
  "#0F2A44",
  "#EAB308",
  "#94A3B8",
  "#F97316",
  "#6366F1",
  "#22C55E",
  "#EC4899",
];

/* ================= PAGE ================= */

export default function Reports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Member Directory</h2>
          <p className="text-gray-500 text-sm">
            Key metrics and trends for membership and financials.
          </p>
        </div>

        <div className="flex gap-2">
          <Btn icon={<FileDown size={16} />} label="Export Excel" />
          <Btn icon={<Download size={16} />} label="Export PDF" />
          <Btn icon={<Printer size={16} />} label="Print" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-yellow-500 text-black rounded-md text-sm">
          Overview
        </button>

        <button
          onClick={() => navigate("/reports/service-usage")}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm"
        >
          Service usage
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl border flex items-center gap-3">
        <FilterBox label="Date Range" value="YTD (Jan - Dec)" />
        <FilterBox label="Membership Type" value="Select Membership type" />
        <FilterBox label="Membership Clusters" value="Select Cluster" />

        <button className="ml-auto bg-[#0F2A44] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
          Apply Filters
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Members" value="1,240" icon={<Users />} sub="+12%" />
        <StatCard title="Pending Applications" value="32" icon={<UserPlus />} />
        <StatCard title="Renewals Due" value="18" icon={<Clock />} sub="-5%" />
        <StatCard title="Membership Revenue" value="45,200 RWF" icon={<Wallet />} sub="+8.4%" />
      </div>

      {/* TOP CHART */}
      <div className="grid grid-cols-3 gap-6">

        {/* LINE */}
        <div className="col-span-2 bg-white p-6 rounded-xl border">
          <h3 className="font-semibold mb-1">Revenue Growth</h3>
          <p className="text-xs text-gray-400 mb-4">
            Monthly breakdown of membership fee collection.
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <Tooltip />
              <Line dataKey="value" stroke="#0F2A44" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CATEGORY */}
        <PieSimple title="Members by Category" data={categoryData} />
      </div>


      <div className="grid grid-cols-2 gap-6">
        <PieDetailed title="Members by Cluster" data={clusterData} />
        <PieSimple title="Members by Type" data={typeData} />
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Btn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm bg-white">
      {icon}
      {label}
    </button>
  );
}

function FilterBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="border px-3 py-2 rounded-md">{value}</div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {sub && <p className="text-xs text-green-500">{sub}</p>}
      </div>

      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

/* ===== CLUSTER (WITH %) ===== */
function PieDetailed({ title, data }: { title: string; data: PieItem[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border">

      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">Distribution by cluster</p>

      <div className="flex items-center gap-6">

        {/* CHART */}
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} innerRadius={60} outerRadius={90} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="w-1/2 space-y-3 text-sm">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-center">

              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>

              <div className="flex gap-4 text-gray-600">
                <span>{item.value}</span>
                <span className="text-gray-400">{item.percent}</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ===== TYPE (NO %) ===== */
function PieSimple({ title, data }: { title: string; data: PieItem[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border">

      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">
        Current distribution of active members.
      </p>

      <div className="flex items-center gap-6">

        {/* CHART */}
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} innerRadius={60} outerRadius={90} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="w-1/2 space-y-3 text-sm">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-center">

              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>

              <span className="text-gray-600">{item.value}</span>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}