import { api } from '../lib/api';

/** Query params shared by most report GETs (snake_case in URL via manual build). */
export type ReportsFilterParams = {
  active?: boolean;
  clusterId?: number;
  subclusterId?: number;
  tierId?: number;
  /** ISO datetime strings */
  dateFrom?: string;
  dateTo?: string;
  memberPaidInPeriod?: boolean;
};

function appendFilterParams(
  search: URLSearchParams,
  filters: ReportsFilterParams | undefined,
): void {
  if (!filters) return;
  if (filters.active !== undefined) search.set('active', String(filters.active));
  if (filters.clusterId !== undefined) search.set('clusterId', String(filters.clusterId));
  if (filters.subclusterId !== undefined) search.set('subclusterId', String(filters.subclusterId));
  if (filters.tierId !== undefined) search.set('tierId', String(filters.tierId));
  if (filters.dateFrom) search.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) search.set('dateTo', filters.dateTo);
  if (filters.memberPaidInPeriod !== undefined) {
    search.set('memberPaidInPeriod', String(filters.memberPaidInPeriod));
  }
}

export type MembersByClusterItem = {
  name: string;
  value: number;
  percent: string;
  clusterId: number | null;
};

export type MembersByTierItem = {
  name: string;
  value: number;
  tierId: number | null;
  tierPrice: number | null;
  percent: string;
};

export type RevenueGrowthPoint = {
  periodKey: string;
  label: string;
  timestamp: string;
  value: number;
};

export async function getReportsTotalMembers(
  filters: ReportsFilterParams,
): Promise<number> {
  const search = new URLSearchParams();
  appendFilterParams(search, filters);
  const { data } = await api.get<{ success?: boolean; data?: { totalMembers?: number } }>(
    `/reports/total-members?${search.toString()}`,
  );
  return Number(data?.data?.totalMembers ?? 0);
}

export async function getReportsMembershipRevenue(filters: ReportsFilterParams): Promise<{
  totalRevenue: number;
  currency: string;
  revenueChangePercent: number | null;
}> {
  const search = new URLSearchParams();
  appendFilterParams(search, filters);
  const { data } = await api.get<{
    data?: {
      totalRevenue?: number;
      currency?: string;
      revenueChangePercent?: number | null;
    };
  }>(`/reports/membership-revenue?${search.toString()}`);
  const d = data?.data;
  return {
    totalRevenue: Number(d?.totalRevenue ?? 0),
    currency: String(d?.currency ?? 'RWF'),
    revenueChangePercent: d?.revenueChangePercent ?? null,
  };
}

export async function getReportsRevenueGrowth(
  filters: ReportsFilterParams & {
    granularity?: 'day' | 'week' | 'month';
    page?: number;
    pageSize?: number;
  },
): Promise<RevenueGrowthPoint[]> {
  const search = new URLSearchParams();
  appendFilterParams(search, filters);
  search.set('granularity', filters.granularity ?? 'month');
  search.set('page', String(filters.page ?? 1));
  search.set('pageSize', String(filters.pageSize ?? 24));
  const { data } = await api.get<{
    data?: { items?: RevenueGrowthPoint[] };
  }>(`/reports/revenue-growth?${search.toString()}`);
  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

export async function getReportsMembersByCluster(
  filters: ReportsFilterParams & { pageSize?: number; search?: string },
): Promise<MembersByClusterItem[]> {
  const search = new URLSearchParams();
  appendFilterParams(search, filters);
  search.set('page', '1');
  search.set('pageSize', String(filters.pageSize ?? 500));
  if (filters.search) search.set('search', filters.search);
  const { data } = await api.get<{
    data?: { items?: MembersByClusterItem[] };
  }>(`/reports/members-by-cluster?${search.toString()}`);
  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

export async function getReportsMembersByTier(
  filters: ReportsFilterParams & { pageSize?: number },
): Promise<MembersByTierItem[]> {
  const search = new URLSearchParams();
  appendFilterParams(search, filters);
  search.set('page', '1');
  search.set('pageSize', String(filters.pageSize ?? 100));
  const { data } = await api.get<{
    data?: { items?: MembersByTierItem[] };
  }>(`/reports/members-by-tier?${search.toString()}`);
  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

export async function getReportsPendingApplicationsSummary(): Promise<number> {
  const { data } = await api.get<{
    data?: { summary?: { totalMatchingUsers?: number } };
  }>('/reports/pending-applications?page=1&pageSize=1');
  return Number(data?.data?.summary?.totalMatchingUsers ?? 0);
}
