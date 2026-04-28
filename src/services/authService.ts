import { api } from '../lib/api';
import type { AuthUser, UserRole } from '../context/AuthContext';

// ─── API response shapes ──────────────────────────────────────────────────────
interface BackendUser {
  id: number;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  companyName: string;
  address?: string;
  logoUrl?: string;
  active: boolean;
  hasSeal: boolean;
  memberships?: { tier?: { tierName?: string } }[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: BackendUser;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: BackendUser;
}

interface DemoPaymentResponse {
  success: boolean;
  message: string;
}

interface MeResponse {
  success: boolean;
  data: BackendUser;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapRole(role: 'ADMIN' | 'MEMBER'): UserRole {
  return role === 'ADMIN' ? 'admin' : 'member';
}

export function backendUserToAuthUser(user: BackendUser): AuthUser {
  const tier = user.memberships?.[0]?.tier?.tierName?.toLowerCase();
  return {
    id: String(user.id),
    email: user.email,
    name: user.companyName,
    role: mapRole(user.role),
    companyName: user.companyName,
    tier: tier,
  };
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

/** POST /auth/login */
export async function loginApi(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string }> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return { user: backendUserToAuthUser(data.user), token: data.token };
}

/** GET /auth/me */
export async function getMeApi(): Promise<AuthUser> {
  const { data } = await api.get<MeResponse>('/auth/me');
  return backendUserToAuthUser(data.data);
}

/** POST /auth/logout (stateless, best-effort) */
export async function logoutApi(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // server-side logout is a no-op; ignore errors
  }
}

// ─── Register payload ─────────────────────────────────────────────────────────
export interface RegisterPayload {
  email: string;
  role?: 'ADMIN' | 'MEMBER';
  companyName: string;
  address: string;
  clusterId: number;
  subclusterId: number;
  hasSeal: boolean;
  founders: Array<{ fullName: string; email: string; phone: string }>;
  alternateRepresentative: {
    fullName: string;
    email: string;
    phone: string;
    title: string;
  };
  logo?: File | null;
}

/** POST /auth/register (multipart) */
export async function registerApi(payload: RegisterPayload): Promise<RegisterResponse> {
  const form = new FormData();
  form.append('email', payload.email);
  form.append('role', payload.role ?? 'MEMBER');
  form.append('companyName', payload.companyName);
  form.append('address', payload.address);
  form.append('clusterId', String(payload.clusterId));
  form.append('subclusterId', String(payload.subclusterId));
  form.append('hasSeal', String(payload.hasSeal));
  form.append('founders', JSON.stringify(payload.founders));
  form.append('alternateRepresentative', JSON.stringify(payload.alternateRepresentative));
  if (payload.logo) {
    form.append('logo', payload.logo);
  }

  const { data } = await api.post<RegisterResponse>('/auth/register', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** POST /auth/demo-membership-payment — activates account + sends email with credentials */
export async function demoMembershipPaymentApi(
  email: string,
  membershipType: string,
): Promise<DemoPaymentResponse> {
  const { data } = await api.post<DemoPaymentResponse>('/auth/demo-membership-payment', {
    email,
    membershipType,
  });
  return data;
}

// ─── Clusters ─────────────────────────────────────────────────────────────────
export interface ClusterItem {
  id: number;
  clusterName: string;
  subclusters: SubclusterItem[];
}

export interface SubclusterItem {
  id: number;
  name: string;
  mainCluster: number;
}

interface ClustersResponse {
  success: boolean;
  data: ClusterItem[];
}

/** GET /clusters — public read (superadmin gate lifted on GET for registration) */
export async function getClustersApi(): Promise<ClusterItem[]> {
  const { data } = await api.get<ClustersResponse>('/clusters');
  return data.data;
}
