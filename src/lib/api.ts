import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:2000/api';

const TOKEN_KEY = 'ict_auth_token';
const SESSION_KEY = 'ict_auth_user';
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT if present ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toLowerCase();
  if (method && MUTATING_METHODS.has(method)) {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw) as { role?: string };
        if (session.role === 'standard_user') {
          return Promise.reject(
            new Error('You have view-only access and cannot perform this action.'),
          );
        }
      }
    } catch {
      // ignore malformed session
    }
  }

  return config;
});

// ─── Response interceptor: surface error messages ────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  },
);

// ─── Token helpers ────────────────────────────────────────────────────────────
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
