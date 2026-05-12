import { api } from "../lib/api";

export type ServiceUsageQuery = {
  dateFrom: string;
  dateTo: string;
  serviceCategoryId?: number;
  serviceSubtypeId?: number;
};

function appendServiceUsageParams(search: URLSearchParams, q: ServiceUsageQuery): void {
  search.set("dateFrom", q.dateFrom);
  search.set("dateTo", q.dateTo);
  if (q.serviceCategoryId !== undefined) search.set("serviceCategoryId", String(q.serviceCategoryId));
  if (q.serviceSubtypeId !== undefined) search.set("serviceSubtypeId", String(q.serviceSubtypeId));
}

export type ServiceCategoryOption = { id: number; categoryName: string };

export type ServiceUsageSummary = {
  period: { dateFrom: string; dateTo: string };
  totalRequests: number;
  totalDelivered: number;
  totalPending: number;
  avgDeliveryDaysAll: number | null;
  avgDeliveryDaysTopService: number | null;
  topService: {
    serviceCategoryId: number;
    categoryName: string;
    requestCount: number;
    shareOfTotalPercent: number;
    avgDeliveryDays: number | null;
  } | null;
  completionRatePct: number | null;
  totalRequestsChangePercent: number | null;
  pendingChangePercent: number | null;
  serviceCategories: ServiceCategoryOption[];
};

export type ChartTopCategory = {
  serviceCategoryId: number;
  categoryName: string;
  dataKey: string;
  color: string;
};

export type ServiceUsageChartResponse = {
  period: { dateFrom: string; dateTo: string };
  monthKeys: string[];
  topCategories: ChartTopCategory[];
  rows: Array<Record<string, string | number>>;
};

export type PerformanceRow = {
  serviceCategoryId: number;
  serviceType: string;
  totalRequests: number;
  completed: number;
  pending: number;
  avgDeliveryDays: number | null;
  satisfactionPercent: number | null;
};

export async function getServiceUsageSummary(q: ServiceUsageQuery): Promise<ServiceUsageSummary> {
  const search = new URLSearchParams();
  appendServiceUsageParams(search, q);
  const { data } = await api.get<{ data?: ServiceUsageSummary }>(`/reports/service-usage/summary?${search}`);
  if (!data?.data) {
    throw new Error("Invalid summary response");
  }
  return data.data;
}

export async function getServiceUsageChart(
  q: ServiceUsageQuery & { topN?: number },
): Promise<ServiceUsageChartResponse> {
  const search = new URLSearchParams();
  appendServiceUsageParams(search, q);
  search.set("topN", String(q.topN ?? 5));
  const { data } = await api.get<{ data?: ServiceUsageChartResponse }>(
    `/reports/service-usage/requests-by-type-chart?${search}`,
  );
  if (!data?.data) {
    throw new Error("Invalid chart response");
  }
  return data.data;
}

export async function getServiceUsagePerformanceTable(
  q: ServiceUsageQuery & {
    search?: string;
    sort?: "total" | "name" | "completed" | "pending" | "satisfaction";
    order?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  },
): Promise<{
  items: PerformanceRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}> {
  const search = new URLSearchParams();
  appendServiceUsageParams(search, q);
  if (q.search) search.set("search", q.search);
  if (q.sort) search.set("sort", q.sort);
  if (q.order) search.set("order", q.order);
  search.set("page", String(q.page ?? 1));
  search.set("pageSize", String(q.pageSize ?? 20));
  const { data } = await api.get<{
    data?: {
      items?: PerformanceRow[];
      page?: number;
      pageSize?: number;
      totalItems?: number;
      totalPages?: number;
    };
  }>(`/reports/service-usage/performance-table?${search}`);
  const d = data?.data;
  return {
    items: Array.isArray(d?.items) ? d.items : [],
    page: Number(d?.page ?? 1),
    pageSize: Number(d?.pageSize ?? 20),
    totalItems: Number(d?.totalItems ?? 0),
    totalPages: Number(d?.totalPages ?? 1),
  };
}
