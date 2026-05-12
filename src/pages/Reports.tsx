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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

import { getClustersApi, type ClusterItem } from "../services/authService";
import { getRenewals } from "../services/renewalService";
import {
  getReportsMembersByCluster,
  getReportsMembersByTier,
  getReportsMembershipRevenue,
  getReportsPendingApplicationsSummary,
  getReportsRevenueGrowth,
  getReportsTotalMembers,
  type MembersByClusterItem,
  type MembersByTierItem,
  type ReportsFilterParams,
  type RevenueGrowthPoint,
} from "../services/reportsService";

/* ================= TYPES ================= */
type PieItem = {
  name: string;
  value: number;
  percent?: string;
};

const COLORS = [
  "#0F2A44",
  "#EAB308",
  "#94A3B8",
  "#F97316",
  "#6366F1",
  "#22C55E",
  "#EC4899",
];

function defaultDateRangeLocal(): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  const to = `${y}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const from = `${y}-01-01`;
  return { from, to };
}

function toISODateTimeStart(day: string): string {
  return new Date(`${day}T00:00:00`).toISOString();
}

function toISODateTimeEnd(day: string): string {
  return new Date(`${day}T23:59:59.999`).toISOString();
}

function formatRwf(n: number): string {
  return `${n.toLocaleString()} RWF`;
}

function formatShortNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function formatPercentChange(pct: number | null): string | undefined {
  if (pct === null || Number.isNaN(pct)) return undefined;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

type TierOption = { id: number; name: string };

/* ================= PAGE ================= */

export default function Reports() {
  const navigate = useNavigate();
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [clusterFilterOpen, setClusterFilterOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement | null>(null);
  const clusterRef = useRef<HTMLDivElement | null>(null);

  const defaults = useMemo(() => defaultDateRangeLocal(), []);

  const [draftDateFrom, setDraftDateFrom] = useState(defaults.from);
  const [draftDateTo, setDraftDateTo] = useState(defaults.to);
  const [draftTierId, setDraftTierId] = useState<number | null>(null);
  const [draftClusterId, setDraftClusterId] = useState<number | null>(null);

  const [appliedDateFrom, setAppliedDateFrom] = useState(defaults.from);
  const [appliedDateTo, setAppliedDateTo] = useState(defaults.to);
  const [appliedTierId, setAppliedTierId] = useState<number | null>(null);
  const [appliedClusterId, setAppliedClusterId] = useState<number | null>(null);

  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [tierOptions, setTierOptions] = useState<TierOption[]>([]);
  const [clusterSearch, setClusterSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalMembers, setTotalMembers] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [renewalsDue, setRenewalsDue] = useState(0);
  const [membershipRevenue, setMembershipRevenue] = useState({ total: 0, changePct: null as number | null });
  const [revenueSeries, setRevenueSeries] = useState<RevenueGrowthPoint[]>([]);
  const [clusterPie, setClusterPie] = useState<MembersByClusterItem[]>([]);
  const [tierPie, setTierPie] = useState<MembersByTierItem[]>([]);

  const reportFilters = useMemo((): ReportsFilterParams => {
    return {
      dateFrom: toISODateTimeStart(appliedDateFrom),
      dateTo: toISODateTimeEnd(appliedDateTo),
      tierId: appliedTierId ?? undefined,
      clusterId: appliedClusterId ?? undefined,
      active: true,
      memberPaidInPeriod: false,
    };
  }, [appliedDateFrom, appliedDateTo, appliedTierId, appliedClusterId]);

  const loadMeta = useCallback(async () => {
    try {
      const [clusterList, tierRows] = await Promise.all([
        getClustersApi(),
        getReportsMembersByTier({ active: true, pageSize: 100 }),
      ]);
      setClusters(clusterList);
      const tiers: TierOption[] = [];
      const seen = new Set<number>();
      for (const row of tierRows) {
        if (row.tierId != null && !seen.has(row.tierId)) {
          seen.add(row.tierId);
          tiers.push({ id: row.tierId, name: row.name });
        }
      }
      tiers.sort((a, b) => a.name.localeCompare(b.name));
      setTierOptions(tiers);
    } catch {
      setClusters([]);
      setTierOptions([]);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        membersCount,
        pending,
        revenue,
        growth,
        byCluster,
        byTier,
        renewals,
      ] = await Promise.all([
        getReportsTotalMembers(reportFilters),
        getReportsPendingApplicationsSummary(),
        getReportsMembershipRevenue(reportFilters),
        getReportsRevenueGrowth({
          ...reportFilters,
          granularity: "month",
          page: 1,
          pageSize: 36,
        }),
        getReportsMembersByCluster({ ...reportFilters, pageSize: 500 }),
        getReportsMembersByTier({ ...reportFilters, pageSize: 100 }),
        getRenewals(),
      ]);

      setTotalMembers(membersCount);
      setPendingApplications(pending);
      setMembershipRevenue({ total: revenue.totalRevenue, changePct: revenue.revenueChangePercent });
      setRevenueSeries(growth);
      setClusterPie(byCluster);
      setTierPie(byTier);
      setRenewalsDue(renewals.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [reportFilters]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

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

  const filteredClusters = useMemo(
    () =>
      clusters.filter((c) =>
        c.clusterName.toLowerCase().includes(clusterSearch.toLowerCase()),
      ),
    [clusters, clusterSearch],
  );

  const tierLabel = draftTierId === null ? "All Types" : tierOptions.find((t) => t.id === draftTierId)?.name ?? "All Types";
  const clusterLabel =
    draftClusterId === null
      ? "All Clusters"
      : clusters.find((c) => c.id === draftClusterId)?.clusterName ?? "All Clusters";

  const lineChartData = useMemo(
    () => revenueSeries.map((p) => ({ month: p.label, value: p.value })),
    [revenueSeries],
  );

  const revenueMax = useMemo(() => {
    const m = Math.max(...lineChartData.map((d) => d.value), 0);
    return m <= 0 ? 1 : Math.ceil(m * 1.1);
  }, [lineChartData]);

  const categoryData: PieItem[] = useMemo(
    () => tierPie.map((t) => ({ name: t.name, value: t.value, percent: t.percent })),
    [tierPie],
  );

  const clusterData: PieItem[] = useMemo(
    () => clusterPie.map((c) => ({ name: c.name, value: c.value, percent: c.percent })),
    [clusterPie],
  );

  const revenueSub = formatPercentChange(membershipRevenue.changePct);

  return (
    <div className="space-y-6 overflow-x-hidden">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex bg-white border border-gray-200 rounded-md p-1 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-none px-3 py-2 bg-yellow-500 text-black rounded-md text-xs inline-flex items-center justify-center gap-1.5 font-medium"
          >
            <LayoutGrid size={12} className="text-yellow-900" />
            Overview
          </button>

          <button
            type="button"
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
        <div className="flex flex-col text-sm w-full lg:flex-1 min-w-0">
          <span className="text-gray-400 text-xs mb-1">Date range</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={draftDateFrom}
              onChange={(e) => setDraftDateFrom(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm w-full sm:flex-1 min-w-0"
            />
            <input
              type="date"
              value={draftDateTo}
              onChange={(e) => setDraftDateTo(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm w-full sm:flex-1 min-w-0"
            />
          </div>
        </div>

        <div className="relative w-full lg:w-auto" ref={typeRef}>
          <FilterTrigger
            label="Membership Type"
            value={tierLabel}
            onClick={() => {
              setTypeFilterOpen((prev) => !prev);
              setClusterFilterOpen(false);
            }}
          />
          {typeFilterOpen && (
            <FilterDropdown title="TIER FILTER">
              <RadioRow
                label="All Types"
                name="membership-type"
                checked={draftTierId === null}
                onChange={() => setDraftTierId(null)}
              />
              {tierOptions.map((tier) => (
                <RadioRow
                  key={tier.id}
                  label={tier.name}
                  name="membership-type"
                  checked={draftTierId === tier.id}
                  onChange={() => setDraftTierId(tier.id)}
                />
              ))}
            </FilterDropdown>
          )}
        </div>

        <div className="relative w-full lg:w-auto" ref={clusterRef}>
          <FilterTrigger
            label="Membership Clusters"
            value={clusterLabel}
            onClick={() => {
              setClusterFilterOpen((prev) => !prev);
              setTypeFilterOpen(false);
            }}
          />
          {clusterFilterOpen && (
            <FilterDropdown title="CLUSTER FILTER">
              <div className="flex items-center border border-gray-200 rounded-md px-2 py-2 mb-2 text-sm">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  placeholder="Search clusters..."
                  value={clusterSearch}
                  onChange={(event) => setClusterSearch(event.target.value)}
                  className="ml-2 outline-none w-full bg-transparent"
                />
              </div>
              <RadioRow
                label="All Clusters"
                name="membership-cluster"
                checked={draftClusterId === null}
                onChange={() => setDraftClusterId(null)}
              />
              {filteredClusters.map((cluster) => (
                <RadioRow
                  key={cluster.id}
                  label={cluster.clusterName}
                  name="membership-cluster"
                  checked={draftClusterId === cluster.id}
                  onChange={() => setDraftClusterId(cluster.id)}
                />
              ))}
            </FilterDropdown>
          )}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setAppliedDateFrom(draftDateFrom);
            setAppliedDateTo(draftDateTo);
            setAppliedTierId(draftTierId);
            setAppliedClusterId(draftClusterId);
          }}
          className="w-full lg:w-auto lg:ml-auto bg-[#0F2A44] text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? "Loading…" : "Apply Filters"}
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={loading ? "…" : totalMembers.toLocaleString()}
          icon={<Users />}
        />
        <StatCard
          title="Pending Applications"
          value={loading ? "…" : String(pendingApplications)}
          icon={<UserPlus />}
        />
        <StatCard
          title="Renewals Due"
          value={loading ? "…" : String(renewalsDue)}
          icon={<Clock />}
        />
        <StatCard
          title="Membership Revenue"
          value={loading ? "…" : formatRwf(membershipRevenue.total)}
          icon={<Wallet />}
          sub={revenueSub}
          subVariant={membershipRevenue.changePct != null && membershipRevenue.changePct < 0 ? "down" : "up"}
        />
      </div>

      {/* TOP CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">
          <h3 className="font-semibold mb-1">Revenue Growth</h3>
          <p className="text-xs text-gray-400 mb-4">Monthly breakdown of membership fee collection (paid invoices).</p>

          {lineChartData.length === 0 && !loading ? (
            <p className="text-sm text-gray-500 py-16 text-center">No paid revenue in this date range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineChartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  domain={[0, revenueMax]}
                  tickFormatter={(v) => formatShortNumber(Number(v))}
                />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? [`${value.toLocaleString()} RWF`, "Revenue"] : ["", ""]
                  }
                />
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
          )}
        </div>

        <MembersByCategoryCard data={categoryData} loading={loading} emptyHint="No tier breakdown for this filter." />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <PieDetailed
          title="Members by Cluster"
          data={clusterData}
          loading={loading}
          emptyHint="No members match this filter."
        />
        <PlaceholderTypeCard />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Btn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-md text-xs bg-white whitespace-nowrap"
    >
      {icon}
      {label}
    </button>
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
  subVariant = "up",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
  subVariant?: "up" | "down";
}) {
  const subClass =
    subVariant === "down" ? "text-xs text-red-600" : "text-xs text-green-600";
  return (
    <div className="bg-white p-5 rounded-md border flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {sub && <p className={subClass}>{sub}</p>}
      </div>

      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">{icon}</div>
    </div>
  );
}

function PieDetailed({
  title,
  data,
  loading,
  emptyHint,
}: {
  title: string;
  data: PieItem[];
  loading?: boolean;
  emptyHint?: string;
}) {
  if (!loading && data.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-gray-400 mb-4">Distribution by cluster</p>
        <p className="text-sm text-gray-500 py-12 text-center">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">Distribution by cluster</p>

      <div className="flex flex-col lg:flex-row items-center gap-4 min-w-0">
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

        <div className="w-full lg:w-[58%] space-y-3 text-sm min-w-0">
          {data.map((item, i) => (
            <div key={`${item.name}-${i}`} className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
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

function MembersByCategoryCard({
  data,
  loading,
  emptyHint,
}: {
  data: PieItem[];
  loading?: boolean;
  emptyHint?: string;
}) {
  if (!loading && data.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">
        <h3 className="font-semibold">Members by Category</h3>
        <p className="text-xs text-gray-400 mb-3">Current distribution of active members by tier.</p>
        <p className="text-sm text-gray-500 py-12 text-center">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200">
      <h3 className="font-semibold">Members by Category</h3>
      <p className="text-xs text-gray-400 mb-3">Current distribution of active members by tier.</p>

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
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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

function PlaceholderTypeCard() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200 border-dashed">
      <h3 className="font-semibold">Members by Type</h3>
      <p className="text-xs text-gray-400 mb-3">Organization type (e.g. commercial vs program partner).</p>
      <p className="text-sm text-gray-600 leading-relaxed">
        This breakdown is not available from the API yet. When the backend exposes member organization
        categories, this chart can be connected the same way as clusters and tiers.
      </p>
    </div>
  );
}
