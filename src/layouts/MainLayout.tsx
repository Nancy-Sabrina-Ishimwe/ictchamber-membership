import {
  LayoutDashboard,
  Users,
  Handshake,
  CreditCard,
  Settings,
  BarChart3,
  MessageSquare,
  Calendar,
  Briefcase,
  LifeBuoy,
  LogOut,
  Bell,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoict from '../assets/logoict.png';

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Dashboard Overview';
      case '/admin/members':
        return 'Member Directory';
      case '/admin/payments':
        return 'Payments Ledger';
      case '/admin/messaging':
        return 'Bulk Messaging';
      case '/admin/partners':
      case '/admin/partners/directory':
        return 'Partners';
      case '/admin/renewals':
        return 'Renewals';
      case '/admin/services':
      case '/admin/services/delivered':
        return 'Services';
      case '/admin/events':
        return 'Events';
      case '/admin/reports':
      case '/admin/reports/service-usage':
        return 'Reports';
      case '/admin/settings':
        return 'Settings';
      case '/admin/support':
        return 'Support';
      case '/admin/logout':
        return 'Log Out';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className={`flex h-screen ${location.pathname === '/admin' ? 'bg-[#F5F7FA]' : 'bg-white'}`}>
      <div className="flex h-screen w-64 flex-col bg-black text-white">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-gray-800 p-6">
            <img src={logoict} alt="ICT Chamber" className="h-6 w-6" />
            <span className="text-sm font-semibold">ICT CHAMBER</span>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 text-sm">
            <p className="mb-3 text-xs text-gray-500">MAIN MENU</p>

            <div className="space-y-2">
              <MenuItem to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <MenuItem to="/admin/members" icon={<Users size={18} />} label="Members" />
              <MenuItem to="/admin/partners" icon={<Handshake size={18} />} label="Partners" />
              <MenuItem to="/admin/payments" icon={<CreditCard size={18} />} label="Payments" />
              <MenuItem to="/admin/services" icon={<Briefcase size={18} />} label="Services" />
              <MenuItem to="/admin/events" icon={<Calendar size={18} />} label="Events" />
              <MenuItem to="/admin/messaging" icon={<MessageSquare size={18} />} label="Bulk Messaging" />
              <MenuItem to="/admin/reports" icon={<BarChart3 size={18} />} label="Reports" />
              <MenuItem to="/admin/settings" icon={<Settings size={18} />} label="Settings" />
            </div>
          </nav>
        </div>

        <div className="space-y-2 border-t border-gray-800 p-4 text-sm">
          <MenuItem to="/admin/support" icon={<LifeBuoy size={18} />} label="Support" />
          <MenuItem to="/admin/logout" icon={<LogOut size={18} />} label="Log Out" />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between bg-[#0F1E3A] px-6 text-white">
          <h1 className="text-lg font-semibold">{getTitle()}</h1>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-300">Super Admin</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-400" />
            </div>
          </div>
        </div>

        <div className="h-full overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
}) {
  const location = useLocation();
  const isActive = to === '/admin'
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded px-4 py-2 transition-colors ${
        isActive ? 'bg-yellow-500 font-medium text-black' : 'text-white hover:bg-gray-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
