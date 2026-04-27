// ─── Brand / Logo ─────────────────────────────────────────────────────────────
export const APP_LOGO_SRC = '/ict_chamber_logo-removebg-preview.png';
export const APP_LOGO_ALT = 'Rwanda ICT Chamber';
export const APP_NAME = 'Rwanda ICT Chamber';
export const APP_SUBTITLE = 'Membership Portal';

// ─── All Application Routes ───────────────────────────────────────────────────
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  // Admin
  ADMIN: '/admin',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_MEMBER_PROFILE: (id: string) => `/admin/members/${id}`,
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_MESSAGING: '/admin/messaging',
  ADMIN_PARTNERS: '/admin/partners',
  ADMIN_PARTNERS_DIRECTORY: '/admin/partners/directory',
  ADMIN_RENEWALS: '/admin/renewals',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_SERVICES_DELIVERED: '/admin/services/delivered',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_REPORTS_SERVICE_USAGE: '/admin/reports/service-usage',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SETTINGS_SECURITY: '/admin/settings/security',
  ADMIN_SETTINGS_GENERAL: '/admin/settings/general',
  ADMIN_SETTINGS_USERS: '/admin/settings/users',
  ADMIN_SUPPORT: '/admin/support',

  // Member portal
  MEMBER_REGISTER: '/member/register',
  MEMBER_DASHBOARD: '/member/dashboard',
  MEMBER_REQUESTS: '/member/requests',
  MEMBER_PROFILE: '/member/profile',
  MEMBER_BENEFITS: '/member/benefits',
  MEMBER_PAYMENTS: '/member/payments',
  MEMBER_CATALOG: '/member/membership-catalog',
} as const;
