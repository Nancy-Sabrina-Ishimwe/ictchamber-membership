import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoict from '../assets/logoict.png';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/app';
import { ADMIN_NAV_ITEMS, ADMIN_BOTTOM_NAV_ITEMS } from '../constants/navigation';
import type { NavItem } from '../constants/navigation';

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarWidthClass = 'w-64';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const getTitle = () => {
    switch (location.pathname) {
      case ROUTES.ADMIN:                       return 'Dashboard Overview';
      case ROUTES.ADMIN_MEMBERS:               return 'Member Directory';
      case ROUTES.ADMIN_REGISTRATIONS:         return 'Recent Registrations';
      case ROUTES.ADMIN_PAYMENTS:              return 'Payments Ledger';
      case ROUTES.ADMIN_MESSAGING:             return 'Bulk Messaging';
      case ROUTES.ADMIN_PARTNERS:
      case ROUTES.ADMIN_PARTNERS_DIRECTORY:    return 'Partners';
      case ROUTES.ADMIN_RENEWALS:              return 'Renewals';
      case ROUTES.ADMIN_SERVICES:
      case ROUTES.ADMIN_SERVICES_DELIVERED:    return 'Services';
      case ROUTES.ADMIN_EVENTS:                return 'Events';
      case ROUTES.ADMIN_REPORTS:
      case ROUTES.ADMIN_REPORTS_SERVICE_USAGE: return 'Reports';
      case ROUTES.ADMIN_SETTINGS:              return 'Settings';
      case ROUTES.ADMIN_SUPPORT:               return 'Support';
      default:                                 return 'Dashboard';
    }
  };

  const SidebarContent = () => (
    <div className="flex min-h-0 h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-gray-800 p-6">
        <img src={logoict} alt="ICT Chamber" className="h-6 w-6" />
        <span className="text-sm font-semibold">ICT CHAMBER</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 text-sm">
        <p className="mb-3 text-xs text-gray-500">MAIN MENU</p>
        <div className="space-y-2">
          {ADMIN_NAV_ITEMS.map((item) => (
            <MenuItem key={item.path} item={item} onClick={() => setMobileSidebarOpen(false)} />
          ))}
        </div>
      </nav>

      {/* Bottom nav + logout */}
      <div className="space-y-2 border-t border-gray-800 p-4 text-sm">
        {ADMIN_BOTTOM_NAV_ITEMS.map((item) => (
          <MenuItem key={item.path} item={item} onClick={() => setMobileSidebarOpen(false)} />
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded px-4 py-2 text-white transition-colors hover:bg-gray-800"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`flex h-screen ${location.pathname.startsWith('/admin') ? 'bg-[#F5F7FA]' : 'bg-white'}`}
    >

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex h-screen ${sidebarWidthClass} flex-shrink-0 flex-col bg-black text-white`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close admin menu"
          />
          <div className={`relative h-full ${sidebarWidthClass} bg-black text-white`}>
            <button
              type="button"
              className="absolute top-4 right-4 rounded-sm p-1 text-white/80 hover:bg-white/10"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between bg-[#0F1E3A] px-4 sm:px-6 text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden rounded-sm p-1.5 hover:bg-white/10"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-base sm:text-lg font-semibold">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name ?? 'Admin'}</p>
                <p className="text-xs text-gray-300">Super Admin</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EF9F27] text-black font-bold text-sm">
                {(user?.name ?? 'A')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function MenuItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const location = useLocation();
  const { path, label, Icon } = item;
  const isActive =
    path === ROUTES.ADMIN
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 rounded px-4 py-2 transition-colors ${
        isActive ? 'bg-yellow-500 font-medium text-black' : 'text-white hover:bg-gray-800'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
