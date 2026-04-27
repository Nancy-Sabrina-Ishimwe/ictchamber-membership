import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  LayoutGrid,
  FileChartColumnIncreasing,
  Users,
  UserPlus,
  Clock,
  Wallet,
  Download,
  Printer,
  FileDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [clusterFilterOpen, setClusterFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [clusterSearch, setClusterSearch] = useState("");
  const typeRef = useRef<HTMLDivElement | null>(null);
  const clusterRef = useRef<HTMLDivElement | null>(null);

  const typeOptions = ["Platinum", "Gold", "Silver", "Bronze"];
  const clusterOptions = [
    "FinTech",
    "Drones and Robotics",
    "Infrastructure and Connectivity",
    "Artificial Intelligence",
    "Hubs, Incubators and Capacity Building",
    "AgriTech",
    "E-commerce and E-services",
    "IT Hardware and Solutions",
    "Multimedia and Digital Agents",
    "EdTech",
    "HealthTech",
  ];

  const filteredClusters = useMemo(
    () =>
      clusterOptions.filter((cluster) =>
        cluster.toLowerCase().includes(clusterSearch.toLowerCase())
      ),
    [clusterSearch]
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (typeRef.current && !typeRef.current.contains(target)) {
        setTypeFilterOpen(false);
      }
      if (clusterRef.current && !clusterRef.current.contains(target)) {
        setClusterFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex bg-white border border-gray-200 rounded-md p-1 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-3 py-2 bg-yellow-500 text-black rounded-md text-xs inline-flex items-center justify-center gap-1.5 font-medium">
            <LayoutGrid size={12} className="text-yellow-900" />
            Overview
          </button>

          <button
            onClick={() => navigate("/admin/reports/service-usage")}
            className="flex-1 sm:flex-none px-3 py-2 text-gray-500 rounded-md text-xs inline-flex items-center justify-center gap-1.5 hover:text-gray-700"
          >
            <FileChartColumnIncreasing size={12} className="text-gray-400" />
            Service usage
          </button>
        </div>

        <div className="flex flex-wrap gap-2 min-w-0">
          <Btn icon={<FileDown size={14} />} label="Export Excel" />
          <Btn icon={<Download size={14} />} label="Export PDF" />
          <Btn icon={<Printer size={14} />} label="Print" />
        </div>
      </div>

      <p className="text-xs text-gray-500">Key metrics and trends for membership and financials.</p>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-md border flex flex-col lg:flex-row lg:items-end gap-3 relative min-w-0">
        <FilterBox label="Date Range" value="YTD (Jan - Dec)" />

        <div className="relative w-full lg:w-auto" ref={typeRef}>
          <FilterTrigger
            label="Membership Type"
            value={selectedType ?? "All Types"}
            onClick={() => {
              setTypeFilterOpen((prev) => !prev);
              setClusterFilterOpen(false);
            }}
          />
          {typeFilterOpen && (
            <FilterDropdown title="STATUS FILTER">
              {typeOptions.map((type) => (
                <RadioRow
                  key={type}
                  label={type}
                  name="membership-type"
                  checked={selectedType === type}
                  onChange={() => setSelectedType(type)}
                />
              ))}
            </FilterDropdown>
          )}
        </div>

        <div className="relative w-full lg:w-auto" ref={clusterRef}>
          <FilterTrigger
            label="Membership Clusters"
            value={selectedCluster ?? "All Clusters"}
            onClick={() => {
              setClusterFilterOpen((prev) => !prev);
              setTypeFilterOpen(false);
            }}
          />
          {clusterFilterOpen && (
            <FilterDropdown title="STATUS FILTER">
              <div className="flex items-center border border-gray-200 rounded-md px-2 py-2 mb-2 text-sm">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  placeholder="Search clusters..."
                  value={clusterSearch}
                  onChange={(event) => setClusterSearch(event.target.value)}
                  className="ml-2 outline-none w-full bg-transparent"
                />
              </div>
              {filteredClusters.map((cluster) => (
                <RadioRow
                  key={cluster}
                  label={cluster}
                  name="membership-cluster"
                  checked={selectedCluster === cluster}
                  onChange={() => setSelectedCluster(cluster)}
                />
              ))}
            </FilterDropdown>
          )}
        </div>

        <button className="w-full lg:w-auto lg:ml-auto bg-[#0F2A44] text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2">
          Apply Filters
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Members" value="1,240" icon={<Users />} sub="+12%" />
        <StatCard title="Pending Applications" value="32" icon={<UserPlus />} />
        <StatCard title="Renewals Due" value="18" icon={<Clock />} sub="-5%" />
        <StatCard title="Membership Revenue" value="45,200 RWF" icon={<Wallet />} sub="+8.4%" />
      </div>

      {/* TOP CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">

        {/* LINE */}
        <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">
          <h3 className="font-semibold mb-1">Revenue Growth</h3>
          <p className="text-xs text-gray-400 mb-4">
            Monthly breakdown of membership fee collection.
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={36}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                ticks={[0.1, 1, 10, 20, 30]}
                domain={[0, 30]}
                tickFormatter={(v) => {
                  if (v === 0.1) return "100 K";
                  if (v === 1) return "1 M";
                  return `${v}M`;
                }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0F2A44"
                strokeWidth={2}
                dot={{ r: 3, fill: "#0F2A44", stroke: "#ffffff", strokeWidth: 1 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CATEGORY */}
        <MembersByCategoryCard data={categoryData} />
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <PieDetailed title="Members by Cluster" data={clusterData} />
        <PieSimple title="Members by Type" data={typeData} />
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Btn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-md text-xs bg-white whitespace-nowrap">
      {icon}
      {label}
    </button>
  );
}

function FilterBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col text-sm w-full lg:w-auto">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="border px-3 py-2 rounded-md truncate">{value}</div>
    </div>
  );
}

function FilterTrigger({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col text-sm w-full min-w-0 lg:w-[170px]">
      <span className="text-gray-500 text-xs mb-1">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className="border border-gray-200 px-3 py-2 rounded-md text-left flex items-center justify-between gap-2 bg-white"
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
    </div>
  );
}

function FilterDropdown({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute z-30 mt-1 w-full lg:w-[230px] max-w-[calc(100vw-2rem)] lg:max-w-none lg:left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-2 max-h-72 overflow-y-auto">
      <p className="text-[10px] font-semibold text-gray-500 px-1 mb-2 tracking-wide">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function RadioRow({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 py-1 px-1 rounded hover:bg-gray-50 cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
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
    <div className="bg-white p-5 rounded-md border flex justify-between items-start">
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
    <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">

      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">Distribution by cluster</p>

      <div className="flex flex-col lg:flex-row items-center gap-4 min-w-0">

        {/* CHART */}
        <div className="w-full lg:w-[42%]">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={data} innerRadius={52} outerRadius={78} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="w-full lg:w-[58%] space-y-3 text-sm min-w-0">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-start gap-2">

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-gray-700 break-words whitespace-normal leading-snug">{item.name}</span>
              </div>

              <div className="flex gap-4 text-gray-600 justify-end flex-shrink-0">
                <span className="font-medium text-gray-700">{item.value}</span>
                <span className="text-gray-400 w-10 text-right">{item.percent}</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function MembersByCategoryCard({ data }: { data: PieItem[] }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">
      <h3 className="font-semibold">Members by Category</h3>
      <p className="text-xs text-gray-400 mb-3">Current distribution of active members.</p>

      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie data={data} innerRadius={40} outerRadius={60} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2 text-sm mt-1 min-w-0">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-gray-700 min-w-0 flex-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="break-words whitespace-normal leading-snug">{item.name}</span>
            </span>
            <span className="font-medium text-gray-700 flex-shrink-0">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== TYPE (NO %) ===== */
function PieSimple({ title, data }: { title: string; data: PieItem[] }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">

      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">
        Current distribution of active members.
      </p>

      <div className="flex flex-col items-center gap-3 min-w-0">

        {/* CHART */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={data} innerRadius={38} outerRadius={62} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="w-full space-y-2.5 text-sm min-w-0">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-start gap-2">

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-gray-700 break-words whitespace-normal leading-snug">{item.name}</span>
              </div>

              <span className="text-gray-700 font-medium flex-shrink-0">{item.value}</span>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}