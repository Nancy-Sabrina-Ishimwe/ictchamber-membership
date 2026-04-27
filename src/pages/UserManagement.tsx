import { NavLink } from "react-router-dom";
import { Search, Plus, MoreVertical, ShieldCheck, Users, SlidersHorizontal, KeyRound } from "lucide-react";

type User = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  image: string;
};

export default function UserManagement() {
  const users: User[] = [
    {
      name: "Jean Paul Ntezimana",
      email: "jean.ntezimana@ictchamber.rw",
      role: "Super Admin",
      status: "Active",
      lastLogin: "2 hours ago",
      image: "https://i.pravatar.cc/40?img=1",
    },
    {
      name: "Clarisse Uwamahoro",
      email: "clarisse.u@ictchamber.rw",
      role: "Membership Officer",
      status: "Active",
      lastLogin: "Yesterday, 14:30",
      image: "https://i.pravatar.cc/40?img=2",
    },
    {
      name: "David Karekezi",
      email: "david.karekezi@ictchamber.rw",
      role: "Finance Officer",
      status: "Active",
      lastLogin: "Oct 24, 2023",
      image: "https://i.pravatar.cc/40?img=3",
    },
    {
      name: "Alice Mutoni",
      email: "alice.mutoni@external.org",
      role: "Viewer",
      status: "Inactive",
      lastLogin: "Sep 12, 2023",
      image: "https://i.pravatar.cc/40?img=4",
    },
    {
      name: "Eric Ndahiro",
      email: "eric.n@ictchamber.rw",
      role: "Admin",
      status: "Pending",
      lastLogin: "Never",
      image: "https://i.pravatar.cc/40?img=5",
    },
  ];

  return (
    <div className="space-y-5">
      {/* TABS */}
      <div className="w-fit max-w-full rounded-md border border-gray-200 bg-white p-1.5 overflow-x-auto">
        <div className="inline-flex min-w-max gap-1">
          <Tab
            label="User roles & access management"
            icon={<ShieldCheck size={14} />}
            to="/admin/settings"
            end
          />
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
            User Management
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage user accounts, assign roles, and monitor system access.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400">
          <Plus size={15} />
          Create User
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border rounded-md shadow-sm">

        {/* TOP BAR */}
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center p-4 border-b">

          {/* SEARCH */}
          <div className="flex items-center border rounded-md px-3 py-2 w-full lg:w-80">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search users by name or email..."
              className="ml-2 outline-none text-sm w-full"
            />
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-3">
            <select className="border px-3 py-2 rounded-md text-sm">
              <option>Role Filter</option>
            </select>

            <select className="border px-3 py-2 rounded-md text-sm">
              <option>Select Status</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="text-left p-4">User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, i) => (
              <tr key={i} className="border-t text-center">

                {/* USER */}
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={user.image}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{user.name}</span>
                </td>

                <td>{user.email}</td>

                {/* ROLE */}
                <td>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                    {user.role}
                  </span>
                </td>

                {/* STATUS */}
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : user.status === "Inactive"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {user.status}
                  </span>
                </td>

                <td>{user.lastLogin}</td>

                {/* ACTION */}
                <td>
                  <MoreVertical size={16} className="mx-auto cursor-pointer" />
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-4 text-sm text-gray-500">
          <span>Showing 1 to 5 of 24 users</span>

          <div className="flex gap-2">
            <button className="border px-3 py-1 rounded-md">Previous</button>
            <button className="border px-3 py-1 rounded-md">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* TAB COMPONENT */
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
