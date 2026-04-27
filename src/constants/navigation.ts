import {
  BarChart3,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from './app';

export interface NavItem {
  /** Display label shown in the sidebar */
  label: string;
  /** Destination route path */
  path: string;
  /** Lucide icon component */
  Icon: LucideIcon;
}

// ─── Admin sidebar navigation ─────────────────────────────────────────────────
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     path: ROUTES.ADMIN,                  Icon: LayoutDashboard },
  { label: 'Members',       path: ROUTES.ADMIN_MEMBERS,          Icon: Users           },
  { label: 'Partners',      path: ROUTES.ADMIN_PARTNERS,         Icon: Handshake       },
  { label: 'Payments',      path: ROUTES.ADMIN_PAYMENTS,         Icon: CreditCard      },
  { label: 'Services',      path: ROUTES.ADMIN_SERVICES,         Icon: Briefcase       },
  { label: 'Events',        path: ROUTES.ADMIN_EVENTS,           Icon: Calendar        },
  { label: 'Bulk Messaging',path: ROUTES.ADMIN_MESSAGING,        Icon: MessageSquare   },
  { label: 'Reports',       path: ROUTES.ADMIN_REPORTS,          Icon: BarChart3       },
  { label: 'Settings',      path: ROUTES.ADMIN_SETTINGS,         Icon: Settings        },
];

/** Items rendered at the bottom of the admin sidebar (before logout) */
export const ADMIN_BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Support', path: ROUTES.ADMIN_SUPPORT, Icon: LifeBuoy },
];

// ─── Member portal sidebar navigation ────────────────────────────────────────
export const PORTAL_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   path: ROUTES.MEMBER_DASHBOARD, Icon: LayoutDashboard },
  { label: 'My Requests', path: ROUTES.MEMBER_REQUESTS,  Icon: FileText        },
  { label: 'My Profile',  path: ROUTES.MEMBER_PROFILE,   Icon: User            },
  { label: 'My Benefits', path: ROUTES.MEMBER_BENEFITS,  Icon: Star            },
  { label: 'Payments',    path: ROUTES.MEMBER_PAYMENTS,  Icon: CreditCard      },
];

// Re-export LogOut icon so consumers can import it alongside nav items
export { LogOut };
