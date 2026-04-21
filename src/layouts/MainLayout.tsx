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
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import logoict from "../assets/logoict.png";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const location = useLocation();

  // 🔥 Dynamic title
  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard Overview";
      case "/members":
        return "Member Directory";
      case "/payments":
        return "Payments Ledger";
      case "/messaging":
        return "Bulk Messaging";
      case "/partners":
        return "Partners";
      case "/services":
        return "Services";
      case "/events":
        return "Events";
      case "/reports":
        return "Reports";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div
      className={`flex h-screen ${
        location.pathname === "/" ? "bg-[#F5F7FA]" : "bg-white"
      }`}
    >
      
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col h-screen">
        
        {/* Top */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Logo */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-2">
            <img src={logoict} alt="ICT Chamber" className="w-6 h-6" />
            <span className="text-sm font-semibold">ICT CHAMBER</span>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 text-sm overflow-y-auto">
            <p className="text-gray-500 text-xs mb-3">MAIN MENU</p>

            <MenuItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <MenuItem to="/members" icon={<Users size={18} />} label="Members" />
            <MenuItem to="/partners" icon={<Handshake size={18} />} label="Partners" />
            <MenuItem to="/payments" icon={<CreditCard size={18} />} label="Payments" />
            <MenuItem to="/services" icon={<Briefcase size={18} />} label="Services" />
            <MenuItem to="/events" icon={<Calendar size={18} />} label="Events" />
            <MenuItem to="/messaging" icon={<MessageSquare size={18} />} label="Bulk Messaging" />
            <MenuItem to="/reports" icon={<BarChart3 size={18} />} label="Reports" />
            <MenuItem to="/settings" icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-800 text-sm space-y-2">
          <MenuItem to="/support" icon={<LifeBuoy size={18} />} label="Support" />
          <MenuItem to="/logout" icon={<LogOut size={18} />} label="Log Out" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <div className="h-16 bg-[#0F1E3A] text-white flex items-center justify-between px-6">
          
          {/* Dynamic Title */}
          <h1 className="font-semibold text-lg">{getTitle()}</h1>

          <div className="flex items-center gap-6">
            
            {/* Notification */}
            <div className="relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-300">Super Admin</p>
              </div>
              <div className="w-8 h-8 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

/* MenuItem */
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

  const isActive =
    location.pathname === to ||
    location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded transition-colors ${
        isActive
          ? "bg-yellow-500 text-black font-medium"
          : "hover:bg-gray-800 text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}