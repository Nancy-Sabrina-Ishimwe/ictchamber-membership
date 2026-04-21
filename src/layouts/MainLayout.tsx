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

import logoict from "../assets/logoict.png";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col h-screen">
        
        {/* Top section (takes remaining space) */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Logo */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-2">
            <img src={logoict} alt="ICT Chamber" className="w-6 h-6" />
            <span className="text-sm font-semibold">ICT CHAMBER</span>
          </div>

          {/* Menu (scrollable if needed) */}
          <nav className="flex-1 px-4 py-6 space-y-2 text-sm overflow-y-auto">
            <p className="text-gray-500 text-xs mb-3">MAIN MENU</p>

            <MenuItem active icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <MenuItem icon={<Users size={18} />} label="Members" />
            <MenuItem icon={<Handshake size={18} />} label="Partners" />
            <MenuItem icon={<CreditCard size={18} />} label="Payments" />
            <MenuItem icon={<Briefcase size={18} />} label="Services" />
            <MenuItem icon={<Calendar size={18} />} label="Events" />
            <MenuItem icon={<MessageSquare size={18} />} label="Bulk Messaging" />
            <MenuItem icon={<BarChart3 size={18} />} label="Reports" />
            <MenuItem icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>

        {/* Bottom section (ALWAYS visible) */}
        <div className="p-4 border-t border-gray-800 text-sm space-y-2">
          <MenuItem icon={<LifeBuoy size={18} />} label="Support" />
          <MenuItem icon={<LogOut size={18} />} label="Log Out" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <div className="h-16 bg-[#0F1E3A] text-white flex items-center justify-between px-6">
          <h1 className="font-semibold text-lg">Dashboard Overview</h1>

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

/* Menu Item */
function MenuItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded cursor-pointer ${
        active
          ? "bg-yellow-500 text-black font-medium"
          : "hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}