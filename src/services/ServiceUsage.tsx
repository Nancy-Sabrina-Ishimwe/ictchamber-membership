import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function ReportTwo() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Member Directory</h2>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate("/reports")}
          className="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-600"
        >
          Overview
        </button>

        <button className="px-4 py-2 rounded-md text-sm bg-yellow-500 text-black">
          Service usage
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm">
          <Calendar size={16} />
          Last 6 Months
        </button>

        <button className="border px-3 py-2 rounded-md text-sm">
          All Service Types
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-5 gap-4">
        <Card title="Total Requests" value="1,842" />
        <Card title="Delivered Services" value="1,420" />
        <Card title="Unused" value="422" />
        <Card title="Avg. Response" value="2.4 Days" />
        <Card title="Top Service" value="Advocacy" />
      </div>

      {/* PLACEHOLDER FOR CHART */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-semibold">Requests by Service Type</h3>
        <p className="text-gray-400 text-sm">Chart goes here</p>
      </div>
    </div>
  );
}

/* SMALL */

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );
}