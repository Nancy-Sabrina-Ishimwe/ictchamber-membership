import { useNavigate } from "react-router-dom";
import { Calendar, Download, Printer, FileDown, ChevronDown, Filter, LayoutGrid, FileChartColumnIncreasing } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ================= DATA ================= */

const chartData = [
  { month: "Oct", a: 260, b: 80, c: 160, d: 120, e: 60 },
  { month: "Nov", a: 220, b: 180, c: 170, d: 140, e: 130 },
  { month: "Dec", a: 240, b: 160, c: 180, d: 200, e: 80 },
  { month: "Jan", a: 300, b: 140, c: 240, d: 170, e: 90 },
  { month: "Feb", a: 230, b: 150, c: 160, d: 180, e: 110 },
  { month: "Mar", a: 320, b: 280, c: 300, d: 200, e: 120 },
];

const tableData = [
  {
    name: "B2B Linkages",
    total: 830,
    completed: 690,
    pending: 140,
    avg: "1.8 Days",
    satisfaction: "94%",
  },
  {
    name: "Advisory Support",
    total: 460,
    completed: 380,
    pending: 80,
    avg: "3.2 Days",
    satisfaction: "89%",
  },
  {
    name: "Training Requests",
    total: 350,
    completed: 210,
    pending: 140,
    avg: "4.5 Days",
    satisfaction: "98%",
  },
  {
    name: "Market Research",
    total: 202,
    completed: 140,
    pending: 62,
    avg: "5.1 Days",
    satisfaction: "85%",
  },
  {
    name: "Policy Advocacy",
    total: 95,
    completed: 85,
    pending: 10,
    avg: "12.0 Days",
    satisfaction: "91%",
  },
];

/* ================= PAGE ================= */

export default function ReportTwo() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-full space-y-5 overflow-x-hidden">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex bg-white border border-gray-200 rounded-md p-1 w-full sm:w-auto">
          <button
            onClick={() => navigate("/admin/reports")}
            className="flex-1 sm:flex-none px-3 py-2 text-gray-500 rounded-md text-xs inline-flex items-center justify-center gap-1.5 hover:text-gray-700"
          >
            <LayoutGrid size={12} className="text-gray-400" />
            Overview
          </button>

          <button className="flex-1 sm:flex-none px-3 py-2 bg-yellow-500 text-black rounded-md text-xs inline-flex items-center justify-center gap-1.5 font-medium">
            <FileChartColumnIncreasing size={12} className="text-yellow-900" />
            Service usage
          </button>
        </div>

        <div className="flex flex-wrap gap-2 min-w-0 w-full sm:w-auto">
          <Btn icon={<FileDown size={14} />} label="Export Excel" />
          <Btn icon={<Download size={14} />} label="Export PDF" />
          <Btn icon={<Printer size={14} />} label="Print" />
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <FilterBtn label="Last 6 Months" icon={<Calendar size={14} />} />
        <FilterBtn label="All Service Types" icon={<Filter size={14} />} />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <Card title="Total Requests" value="1,842" sub="+14.5% vs last period" />
        <Card title="Delivered Services" value="1,420" sub="77% completion rate" />
        <Card title="Unused" value="422" sub="-5% vs last period" muted />
        <Card title="Avg. Response" value="2.4 Days" sub="Target: < 3 Days" />
        <Card title="Top Service" value="Advocacy" sub="45% of total volume" />
      </div>

      {/* CHART */}
      <div className="bg-white p-4 sm:p-6 rounded-md border border-gray-200 overflow-hidden">
        <h3 className="font-semibold">Requests by Service Type (Oct–Mar)</h3>
        <p className="text-xs text-gray-400 mb-4">Monthly volume</p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <Tooltip />

            <Bar dataKey="a" fill="#EAB308" />
            <Bar dataKey="b" fill="#CBD5F5" />
            <Bar dataKey="c" fill="#0F2A44" />
            <Bar dataKey="d" fill="#F97316" />
            <Bar dataKey="e" fill="#7DD3FC" />
          </BarChart>
        </ResponsiveContainer>

        {/* LEGEND */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs sm:text-sm text-gray-600">
          <Legend color="#EAB308" label="Advocacy" />
          <Legend color="#CBD5F5" label="Access to Markets" />
          <Legend color="#0F2A44" label="Access to Finance" />
          <Legend color="#F97316" label="Capacity Building" />
          <Legend color="#7DD3FC" label="Joint Project Dev" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 sm:p-6 rounded-md border border-gray-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
          <div>
            <h3 className="font-semibold">Service Performance Details</h3>
            <p className="text-xs text-gray-400">
              Comprehensive breakdown of all requested services.
            </p>
          </div>

          <input
            placeholder="Search services..."
            className="border px-3 py-2 rounded-md text-sm w-full sm:w-auto"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left py-2">SERVICE TYPE</th>
                <th>TOTAL</th>
                <th>COMPLETED</th>
                <th>PENDING</th>
                <th>AVG</th>
                <th>SATISFACTION</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((item, i) => (
                <tr key={i} className="border-t text-center">
                  <td className="text-left py-3">{item.name}</td>
                  <td>{item.total}</td>
                  <td>{item.completed}</td>
                  <td>{item.pending}</td>
                  <td>{item.avg}</td>
                  <td>{item.satisfaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Btn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-md text-xs bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">
      {icon}
      {label}
    </button>
  );
}

function FilterBtn({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-md text-sm bg-white w-full sm:w-auto sm:min-w-[130px] justify-between">
      <span className="inline-flex items-center gap-2 text-gray-700 min-w-0">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />
    </button>
  );
}

function Card({
  title,
  value,
  sub,
  muted,
}: {
  title: string;
  value: string;
  sub: string;
  muted?: boolean;
}) {
  return (
    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm min-h-[112px]">
      <p className="text-xs text-gray-500 truncate">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1 break-words leading-tight">{value}</h3>
      <p className={`text-xs mt-4 sm:mt-6 break-words ${muted ? "text-gray-400" : "text-gray-700"}`}>{sub}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="break-words">{label}</span>
    </div>
  );
}