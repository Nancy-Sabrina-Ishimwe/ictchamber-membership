import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Download,
  Printer,
  FileDown,
  LayoutGrid,
  FileChartColumnIncreasing,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  getServiceUsageChart,
  getServiceUsagePerformanceTable,
  getServiceUsageSummary,
  type ChartTopCategory,
  type PerformanceRow,
  type ServiceUsageQuery,
  type ServiceUsageSummary,
} from "./serviceUsageReportsApi";

type CsvRow = Record<string, string | number>;

function defaultDateInputs(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 6);
  const pad = (n: number) => String(n).padStart(2, "0");
  const toStr = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`;
  const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
  return { from: fromStr, to: toStr };
}

function toIsoStart(day: string): string {
  return new Date(`${day}T00:00:00`).toISOString();
}

function toIsoEnd(day: string): string {
  return new Date(`${day}T23:59:59.999`).toISOString();
}

function formatPctChange(pct: number | null): string {
  if (pct === null || Number.isNaN(pct)) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% vs last period`;
}

function formatAvgDays(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—";
  return `${n} Days`;
}

function formatSatisfaction(p: number | null): string {
  if (p === null) return "—";
  return `${p}%`;
}

function csvEscape(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(filename: string, rows: CsvRow[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h] ?? "")).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function openPrintableWindow(title: string, contentHtml: string): void {
  const w = window.open("", "_blank", "noopener,noreferrer,width=980,height=700");
  if (!w) return;
  w.document.write(`
    <html>
      <head><title>${title}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
        <h1 style="margin: 0 0 16px 0;">${title}</h1>
        ${contentHtml}
      </body>
    </html>
  `);
  w.document.close();
  w.focus();
  w.print();
}

export default function ServiceUsage() {
  const navigate = useNavigate();

  const [{ from: dateFrom, to: dateTo }, setRange] = useState(defaultDateInputs);
  const [categoryId, setCategoryId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<ServiceUsageSummary | null>(null);
  const [chartTop, setChartTop] = useState<ChartTopCategory[]>([]);
  const [chartRows, setChartRows] = useState<Array<Record<string, string | number>>>([]);
  const [tableRows, setTableRows] = useState<PerformanceRow[]>([]);
  const [tablePage, setTablePage] = useState(1);
  const [tableTotalPages, setTableTotalPages] = useState(1);
  const [tableSearch, setTableSearch] = useState("");
  const [tableSearchDebounced, setTableSearchDebounced] = useState("");

  const apiQuery: ServiceUsageQuery = useMemo(
    () => ({
      dateFrom: toIsoStart(dateFrom),
      dateTo: toIsoEnd(dateTo),
      ...(categoryId === "" ? {} : { serviceCategoryId: categoryId }),
    }),
    [dateFrom, dateTo, categoryId],
  );

  useEffect(() => {
    const t = window.setTimeout(() => setTableSearchDebounced(tableSearch.trim()), 400);
    return () => window.clearTimeout(t);
  }, [tableSearch]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, chart] = await Promise.all([
        getServiceUsageSummary(apiQuery),
        getServiceUsageChart({ ...apiQuery, topN: 5 }),
      ]);
      setSummary(sum);
      setChartTop(chart.topCategories);
      setChartRows(chart.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service usage.");
      setSummary(null);
      setChartTop([]);
      setChartRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiQuery]);

  const loadTable = useCallback(async () => {
    try {
      const res = await getServiceUsagePerformanceTable({
        ...apiQuery,
        search: tableSearchDebounced || undefined,
        page: tablePage,
        pageSize: 10,
        sort: "total",
        order: "desc",
      });
      setTableRows(res.items);
      setTableTotalPages(res.totalPages);
    } catch {
      setTableRows([]);
      setTableTotalPages(1);
    }
  }, [apiQuery, tablePage, tableSearchDebounced]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    void loadTable();
  }, [loadTable]);

  useEffect(() => {
    setTablePage(1);
  }, [apiQuery, tableSearchDebounced]);

  const categoryOptions = summary?.serviceCategories ?? [];

  const chartTitleSuffix = useMemo(() => {
    if (chartRows.length === 0) return "";
    const first = String(chartRows[0].monthLabel ?? "");
    const last = String(chartRows[chartRows.length - 1].monthLabel ?? "");
    return first === last ? first : `${first}–${last}`;
  }, [chartRows]);

  const applyLastSixMonths = () => setRange(defaultDateInputs());

  const totalReqSub = formatPctChange(summary?.totalRequestsChangePercent ?? null);
  const deliveredSub =
    summary?.completionRatePct != null
      ? `${summary.completionRatePct.toFixed(0)}% completion rate`
      : "—";
  const pendingSub = formatPctChange(summary?.pendingChangePercent ?? null);

  const avgCardValue = formatAvgDays(summary?.avgDeliveryDaysAll ?? null);
  const avgCardSub = (() => {
    const top = summary?.topService?.categoryName;
    const d = summary?.avgDeliveryDaysTopService;
    if (!top && d == null) return "Average delivery time (submitted → delivered)";
    if (top && d != null) return `Top category (${top}): ${d} days avg`;
    if (top) return `Top category: ${top}`;
    return "Average delivery time (submitted → delivered)";
  })();

  const topServiceValue = summary?.topService?.categoryName ?? "—";
  const topServiceSub =
    summary?.topService != null
      ? `${summary.topService.shareOfTotalPercent.toFixed(0)}% of requests in range`
      : "Most requested service category";
  const runDate = new Date().toISOString().slice(0, 10);

  const handleExportExcel = () => {
    const rows: CsvRow[] = [
      { section: "KPI", metric: "Total Requests", value: summary?.totalRequests ?? 0 },
      { section: "KPI", metric: "Delivered Services", value: summary?.totalDelivered ?? 0 },
      { section: "KPI", metric: "Pending Requests", value: summary?.totalPending ?? 0 },
      { section: "KPI", metric: "Avg Delivery Days", value: summary?.avgDeliveryDaysAll ?? "--" },
      { section: "KPI", metric: "Top Service", value: summary?.topService?.categoryName ?? "--" },
      ...tableRows.map((r) => ({
        section: "Performance",
        serviceType: r.serviceType,
        total: r.totalRequests,
        completed: r.completed,
        pending: r.pending,
        avgDeliveryDays: r.avgDeliveryDays ?? "--",
        satisfactionPercent: r.satisfactionPercent ?? "--",
      })),
    ];
    downloadCsv(`service-usage-report-${runDate}.csv`, rows);
  };

  const handleExportPdf = () => {
    const content = `
      <p><strong>Date filter:</strong> ${dateFrom} to ${dateTo}</p>
      <p><strong>Total Requests:</strong> ${summary?.totalRequests ?? 0}</p>
      <p><strong>Delivered Services:</strong> ${summary?.totalDelivered ?? 0}</p>
      <p><strong>Pending Requests:</strong> ${summary?.totalPending ?? 0}</p>
      <p><strong>Top Service:</strong> ${summary?.topService?.categoryName ?? "--"}</p>
    `;
    openPrintableWindow("Service Usage Report", content);
  };

  return (
    <div className="w-full max-w-full space-y-5 overflow-x-hidden">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex bg-white border border-gray-200 rounded-md p-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate("/admin/reports")}
            className="flex-1 sm:flex-none px-3 py-2 text-gray-500 rounded-md text-xs inline-flex items-center justify-center gap-1.5 hover:text-gray-700"
          >
            <LayoutGrid size={12} className="text-gray-400" />
            Overview
          </button>

          <button
            type="button"
            className="flex-1 sm:flex-none px-3 py-2 bg-yellow-500 text-black rounded-md text-xs inline-flex items-center justify-center gap-1.5 font-medium"
          >
            <FileChartColumnIncreasing size={12} className="text-yellow-900" />
            Service usage
          </button>
        </div>

        <div className="flex flex-wrap gap-2 min-w-0 w-full sm:w-auto">
          <Btn icon={<FileDown size={14} />} label="Export Excel" onClick={handleExportExcel} />
          <Btn icon={<Download size={14} />} label="Export PDF" onClick={handleExportPdf} />
          <Btn icon={<Printer size={14} />} label="Print" onClick={() => window.print()} />
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:flex-wrap w-full">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
          <label className="flex flex-col text-xs text-gray-500 flex-1 min-w-0">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="mt-1 border border-gray-200 px-3 py-2 rounded-md text-sm w-full"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-500 flex-1 min-w-0">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="mt-1 border border-gray-200 px-3 py-2 rounded-md text-sm w-full"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={applyLastSixMonths}
          className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-md text-sm bg-white w-full sm:w-auto sm:min-w-[160px] justify-center hover:bg-gray-50"
        >
          <Calendar size={14} className="text-gray-500 flex-shrink-0" />
          <span>Last 6 months</span>
        </button>

        <label className="flex flex-col text-xs text-gray-500 w-full sm:w-auto sm:min-w-[200px]">
          Service category
          <select
            value={categoryId === "" ? "" : String(categoryId)}
            onChange={(e) => {
              const v = e.target.value;
              setCategoryId(v === "" ? "" : Number(v));
            }}
            className="mt-1 border border-gray-200 px-3 py-2 rounded-md text-sm bg-white w-full"
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <Card title="Total Requests" value={loading ? "…" : String(summary?.totalRequests ?? 0)} sub={totalReqSub} />
        <Card
          title="Delivered Services"
          value={loading ? "…" : String(summary?.totalDelivered ?? 0)}
          sub={deliveredSub}
        />
        <Card
          title="Pending Requests"
          value={loading ? "…" : String(summary?.totalPending ?? 0)}
          sub={pendingSub}
          muted={summary?.totalPending === 0}
        />
        <Card title="Avg. Response" value={loading ? "…" : avgCardValue} sub={avgCardSub} />
        <Card title="Top Service" value={loading ? "…" : topServiceValue} sub={topServiceSub} />
      </div>

      {/* CHART */}
      <div className="bg-white p-4 sm:p-6 rounded-md border border-gray-200 overflow-hidden">
        <h3 className="font-semibold">Requests by service category{chartTitleSuffix ? ` (${chartTitleSuffix})` : ""}</h3>
        <p className="text-xs text-gray-400 mb-4">Monthly volume · top five categories in this range</p>

        {chartRows.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-16 text-center">No service requests in this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {chartTop.map((s) => (
                <Bar key={s.dataKey} dataKey={s.dataKey} name={s.categoryName} fill={s.color} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 sm:p-6 rounded-md border border-gray-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
          <div>
            <h3 className="font-semibold">Service Performance Details</h3>
            <p className="text-xs text-gray-400">Breakdown by service category (same date filters as above).</p>
          </div>

          <input
            placeholder="Search categories…"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm w-full sm:w-64"
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
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {loading ? "Loading…" : "No rows match your filters."}
                  </td>
                </tr>
              ) : (
                tableRows.map((item) => (
                  <tr key={item.serviceCategoryId} className="border-t text-center">
                    <td className="text-left py-3">{item.serviceType}</td>
                    <td>{item.totalRequests}</td>
                    <td>{item.completed}</td>
                    <td>{item.pending}</td>
                    <td>{formatAvgDays(item.avgDeliveryDays)}</td>
                    <td>{formatSatisfaction(item.satisfactionPercent)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {tableTotalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4 text-sm">
            <button
              type="button"
              disabled={tablePage <= 1}
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded-md disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {tablePage} / {tableTotalPages}
            </span>
            <button
              type="button"
              disabled={tablePage >= tableTotalPages}
              onClick={() => setTablePage((p) => p + 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Btn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-md text-xs bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
    >
      {icon}
      {label}
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
