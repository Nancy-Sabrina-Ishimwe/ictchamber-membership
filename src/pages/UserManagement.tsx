import { useNavigate } from "react-router-dom";
import { Search, Plus, MoreVertical } from "lucide-react";

type User = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  image: string;
};

export default function UserManagement() {
  const navigate = useNavigate();

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
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-gray-500 text-sm">
            Manage user accounts, assign roles, and monitor system access.
          </p>
        </div>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Plus size={16} /> Create User
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-white border rounded-xl p-2 w-fit">
        <Tab label="User roles & access management" onClick={() => navigate("/settings")} />
        <Tab label="User management" onClick={()=> navigate("/settings/users")} />
        <Tab label="General setting" onClick={() => navigate("/settings/general")} />
        <Tab label="Security settings" onClick={() => navigate("/settings/security")} />
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border rounded-xl shadow-sm">

        {/* TOP BAR */}
        <div className="flex justify-between items-center p-4 border-b gap-3">

          {/* SEARCH */}
          <div className="flex items-center border rounded-md px-3 py-2 w-80">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search users by name or email..."
              className="ml-2 outline-none text-sm w-full"
            />
          </div>

          {/* FILTERS */}
          <div className="flex gap-3">
            <select className="border px-3 py-2 rounded-md text-sm">
              <option>Role Filter</option>
            </select>

            <select className="border px-3 py-2 rounded-md text-sm">
              <option>Select Status</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm">
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

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-sm text-gray-500">
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
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm ${
        active
          ? "bg-yellow-500 text-black"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}