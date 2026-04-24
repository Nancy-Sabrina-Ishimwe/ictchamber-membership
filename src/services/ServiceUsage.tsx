import { useNavigate } from "react-router-dom";
import { Calendar, Download, Printer, FileDown } from "lucide-react";
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
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Member Directory</h2>

        <div className="flex gap-2">
          <Btn icon={<FileDown size={16} />} label="Export PDF" />
          <Btn icon={<Download size={16} />} label="Export Excel" />
          <Btn icon={<Printer size={16} />} label="Print" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate("/reports")}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm"
        >
          Overview
        </button>

        <button className="px-4 py-2 bg-yellow-500 text-black rounded-md text-sm">
          Service usage
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl border flex gap-3 items-center">
        <Filter label="Last 6 Months" icon={<Calendar size={16} />} />
        <Filter label="All Service Types" />

        <button className="ml-auto bg-[#0F2A44] text-white px-4 py-2 rounded-md text-sm">
          Apply Filters
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-5 gap-4">
        <Card title="Total Requests" value="1,842" sub="+14.5%" />
        <Card title="Delivered Services" value="1,420" sub="77%" />
        <Card title="Unused" value="422" sub="-5%" />
        <Card title="Avg. Response" value="2.4 Days" sub="Target < 3 Days" />
        <Card title="Top Service" value="Advocacy" sub="45% of total" />
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="font-semibold">Requests by Service Type (Oct–Mar)</h3>
        <p className="text-xs text-gray-400 mb-4">Monthly volume</p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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
        <div className="flex gap-6 mt-4 text-sm text-gray-600">
          <Legend color="#EAB308" label="Advocacy" />
          <Legend color="#CBD5F5" label="Access to Markets" />
          <Legend color="#0F2A44" label="Access to Finance" />
          <Legend color="#F97316" label="Capacity Building" />
          <Legend color="#7DD3FC" label="Joint Project Dev" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold">Service Performance Details</h3>
            <p className="text-xs text-gray-400">
              Comprehensive breakdown of all requested services.
            </p>
          </div>

          <input
            placeholder="Search services..."
            className="border px-3 py-2 rounded-md text-sm"
          />
        </div>

        <table className="w-full text-sm">
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
  );
}

/* ================= SMALL COMPONENTS ================= */

function Btn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm bg-white">
      {icon}
      {label}
    </button>
  );
}

function Filter({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm">
      {icon}
      {label}
    </button>
  );
}

function Card({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}