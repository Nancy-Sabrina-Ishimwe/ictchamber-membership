import { Search, Plus, Pencil, Trash2, Filter, ShieldCheck, Users, SlidersHorizontal, KeyRound } from "lucide-react";
import { NavLink } from "react-router-dom";

type Role = {
  name: string;
  description: string;
  users: number;
  permissions: string[];
};

const roles: Role[] = [
  {
    name: "Super Admin",
    description:
      "Unrestricted access to all system modules, settings, and full user management capabilities.",
    users: 1,
    permissions: ["All Permissions"],
  },
  {
    name: "Admin",
    description:
      "Manage most general settings, user accounts, and can oversee daily operational content.",
    users: 5,
    permissions: ["Manage Users", "General Settings", "View Audit Logs"],
  },
  {
    name: "Membership Officer",
    description:
      "Dedicated to managing member company profiles, applications, and related communications.",
    users: 12,
    permissions: ["Manage Members", "Communications", "Generate Reports"],
  },
  {
    name: "Finance Officer",
    description:
      "Access to financial records, invoicing, payment tracking, and financial reporting.",
    users: 3,
    permissions: ["View Finances", "Manage Invoices", "Export Financials"],
  },
  {
    name: "Support Officer",
    description:
      "Handle incoming support tickets, member inquiries, and basic user assistance.",
    users: 8,
    permissions: ["Manage Tickets", "View User Profiles"],
  },
  {
    name: "Viewer",
    description:
      "Read-only access to specific dashboards and public-facing directory information.",
    users: 25,
    permissions: ["View Dashboards", "Read-Only Directory"],
  },
];

export default function Settings() {
  return (
    <div className="space-y-5">
      {/* TABS */}
      <div className="w-fit max-w-full rounded-md border border-gray-200 bg-white p-1.5 overflow-x-auto">
        <div className="inline-flex min-w-max gap-1">
          <Tab label="User roles & access management" icon={<ShieldCheck size={14} />} to="/admin/settings" end />

          <Tab
            label="User management"
            icon={<Users size={14} />}
            to="/admin/settings/users"
          />

          <Tab
            label="General setting"
            icon={<SlidersHorizontal size={14} />}
            to="/admin/settings/general"
          />

          <Tab
            label="Security settings"
            icon={<KeyRound size={14} />}
            to="/admin/settings/security"
          />
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[34px] leading-tight font-bold tracking-[-0.02em] text-gray-900">
            User Roles & Access Management
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Control what each role can access and manage within the system. Define precise permissions to
            maintain security and operational efficiency.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400">
          <Plus size={15} />
          Create New Role
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white border rounded-md p-4 flex flex-col sm:flex-row sm:items-center gap-3">

        <div className="flex items-center border rounded-md px-3 py-2 w-full max-w-md">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            placeholder="Search roles or permissions..."
            className="outline-none w-full text-sm"
          />
        </div>

        <button className="sm:ml-auto flex items-center gap-2 border px-4 py-2 rounded-md text-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-md overflow-hidden">

        {/* HEADER */}
        <div className="hidden lg:grid grid-cols-5 text-xs text-gray-400 px-6 py-3 border-b">
          <span>ROLE NAME</span>
          <span>DESCRIPTION</span>
          <span>USERS COUNT</span>
          <span>PERMISSIONS</span>
          <span className="text-right">ACTIONS</span>
        </div>

        {/* ROWS */}
        {roles.map((role, index) => (
          <div
            key={index}
            className="grid grid-cols-1 lg:grid-cols-5 gap-3 px-4 sm:px-6 py-5 border-b items-start"
          >
            {/* NAME */}
            <div className="font-semibold text-sm">{role.name}</div>

            {/* DESCRIPTION */}
            <div className="text-sm text-gray-500 pr-4">
              {role.description}
            </div>

            {/* USERS */}
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs">
                {role.users}
              </span>
              <span className="text-gray-500">Active</span>
            </div>

            {/* PERMISSIONS */}
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((p, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-2 py-1 rounded-md text-xs"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex lg:justify-end gap-3 text-gray-400">
              <Pencil size={16} className="cursor-pointer hover:text-black" />
              <Trash2 size={16} className="cursor-pointer hover:text-red-500" />
            </div>
          </div>
        ))}

        {/* FOOTER */}
        <div className="px-6 py-4 text-sm text-gray-400 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <span>Showing 1 to 6 of 6 roles</span>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-md text-xs text-gray-400">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-md text-xs text-gray-400">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function Tab({
  label,
  icon,
  to,
  end,
}: {
  label: string;
  icon?: React.ReactNode;
  to: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ${
          isActive
            ? "bg-yellow-500 text-black"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }`
      }
    >
      {icon ? <span className="text-black">{icon}</span> : null}
      {label}
    </NavLink>
  );
}
