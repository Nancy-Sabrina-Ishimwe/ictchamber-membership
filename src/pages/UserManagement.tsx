import { NavLink } from "react-router-dom";
import { Search, Plus, ShieldCheck, Users, SlidersHorizontal, KeyRound, X, ChevronDown, Pencil, Trash2, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  image: string;
};

const INITIAL_USERS: User[] = [
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

export default function UserManagement() {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [openActionFor, setOpenActionFor] = useState<string | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-user-action-menu]")) {
        setOpenActionFor(null);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

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
          <h2 className="text-[24px] leading-tight font-bold tracking-[-0.02em] text-gray-900">
            User Management
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage user accounts, assign roles, and monitor system access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateUserModal(true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400"
        >
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
                  <div className="relative inline-flex items-center justify-center" data-user-action-menu>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenActionFor((prev) => (prev === user.email ? null : user.email));
                      }}
                      className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      aria-label={`Open actions for ${user.name}`}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openActionFor === user.email ? (
                      <div className="absolute right-0 top-8 z-20 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditUserModal(true);
                            setOpenActionFor(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={12} />
                          Edit User
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUsers((prev) => prev.filter((item) => item.email !== user.email));
                            setOpenActionFor(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                          Delete User
                        </button>
                      </div>
                    ) : null}
                  </div>
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

      {showCreateUserModal ? (
        <CreateUserModal onClose={() => setShowCreateUserModal(false)} />
      ) : null}

      {showEditUserModal && selectedUser ? (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
        />
      ) : null}
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

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] rounded-md border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">Create New User</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close create user modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="text-sm font-medium text-gray-800">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              defaultValue="Jane Doe"
              className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              defaultValue="jane.doe@example.com"
              className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800">Role</label>
              <button
                type="button"
                className="mt-1.5 flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-500"
              >
                <span />
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">Status</label>
              <button
                type="button"
                className="mt-1.5 flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-500"
              >
                <span />
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800">Temporary Password</label>
              <input
                defaultValue="••••••••••"
                className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">Phone Number</label>
              <input
                defaultValue="+250 788 000 000"
                className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-gray-800">
              <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-yellow-500" />
              <span>
                <span className="font-medium">Auto-generate password</span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  Auto-generated credentials will be securely forwarded via email.
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-md border border-gray-200 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Send Welcome Email</p>
                <p className="text-xs text-gray-500">
                  Automatically send an onboarding email with login instructions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSendWelcomeEmail((prev) => !prev)}
                className={`relative h-5 w-10 rounded-full transition-colors ${
                  sendWelcomeEmail ? "bg-yellow-500" : "bg-gray-300"
                }`}
                aria-label="Toggle welcome email"
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                    sendWelcomeEmail ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-yellow-500 px-5 py-2 text-sm font-medium text-black hover:bg-yellow-400"
          >
            Create User
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] rounded-md border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">Edit User</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close edit user modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="text-sm font-medium text-gray-800">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              defaultValue={user.name}
              className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              defaultValue={user.email}
              className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800">Role</label>
              <button
                type="button"
                className="mt-1.5 flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700"
              >
                <span>{user.role}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">Status</label>
              <button
                type="button"
                className="mt-1.5 flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700"
              >
                <span>{user.status}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800">Temporary Password</label>
              <input
                defaultValue="••••••••••"
                className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">Phone Number</label>
              <input
                defaultValue="+250 788 000 000"
                className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Send Updated Access Email</p>
                <p className="text-xs text-gray-500">
                  Automatically notify the user that profile settings were updated.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSendWelcomeEmail((prev) => !prev)}
                className={`relative h-5 w-10 rounded-full transition-colors ${
                  sendWelcomeEmail ? "bg-yellow-500" : "bg-gray-300"
                }`}
                aria-label="Toggle updated access email"
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                    sendWelcomeEmail ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-yellow-500 px-5 py-2 text-sm font-medium text-black hover:bg-yellow-400"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
