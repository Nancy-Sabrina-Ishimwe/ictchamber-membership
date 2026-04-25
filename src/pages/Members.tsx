import { Search } from "lucide-react";

type Member = {
  id: string;
  name: string;
  cluster: string;
  website: string;
  category: string;
  tier: string;
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
};

export default function Members() {
  const members: Member[] = [
    {
      id: "ICT2024PN924",
      name: "Hviewtech group",
      cluster: "IT Hardware and Solutions",
      website: "www.hviewtech.com",
      category: "Commercial Company",
      tier: "Platinum",
      status: "Active",
      joinDate: "15 Jan 2024",
    },
    {
      id: "ICT2024NA055",
      name: "1000 hills traveler",
      cluster: "Tourism & Hospitality",
      website: "www.bookly.africa",
      category: "Associated",
      tier: "Gold",
      status: "Active",
      joinDate: "20 Mar 2024",
    },
    {
      id: "ICT2024PS233",
      name: "1000hills animation studio",
      cluster: "Media Tech",
      website: "thousandhillsanima.wix",
      category: "Commercial Company",
      tier: "Silver",
      status: "Inactive",
      joinDate: "10 May 2024",
    },
  ];

  return (
    <div className="bg-slate-100 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">ICT Chamber Members</h2>
          <p className="text-gray-500 text-sm">
            List of companies and individuals that subscribed
          </p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 bg-gray-100 rounded-md text-sm">
            Total Active: <span className="font-semibold text-green-600">342</span>
          </div>

          <button className="px-4 py-2 bg-yellow-500 text-black rounded-md text-sm font-medium">
            Registrations
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-3 items-center">

        {/* Search */}
        <div className="flex items-center gap-2 border rounded px-3 py-2 w-72">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search company, contact, or email..."
            className="outline-none text-sm w-full"
          />
        </div>

        {/* Dropdowns */}
        <Select label="All Clusters" />
        <Select label="All Categories" />
        <Select label="All Statuses" />
        <Select label="Any Tier" />

        <button className="px-4 py-2 border rounded text-sm">
          More Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3"><input type="checkbox" /></th>
              <th className="text-left p-3">MEMBERSHIP ID</th>
              <th className="text-left p-3">COMPANY NAME</th>
              <th className="text-left p-3">MEMBERSHIP CLUSTER</th>
              <th className="text-left p-3">COMPANY WEBSITE</th>
              <th className="text-left p-3">CATEGORY</th>
              <th className="text-left p-3">TIER</th>
              <th className="text-left p-3">STATUS</th>
              <th className="text-left p-3">JOIN DATE</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" />
                </td>

                <td className="p-3 text-blue-600 cursor-pointer">
                  {m.id}
                </td>

                <td className="p-3 font-medium">
                  {m.name}
                </td>

                <td className="p-3 text-gray-500">
                  {m.cluster}
                </td>

                <td className="p-3 text-blue-600 underline">
                  {m.website}
                </td>

                <td className="p-3 text-gray-600">
                  {m.category}
                </td>

                <td className="p-3">
                  <TierBadge tier={m.tier} />
                </td>

                <td className="p-3">
                  <StatusBadge status={m.status} />
                </td>

                <td className="p-3 text-gray-500">
                  {m.joinDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 text-sm text-gray-500">
          <p>Showing 1 to 10 of 342 entries</p>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 border rounded">2</button>
            <button className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Dropdown */
function Select({ label }: { label: string }) {
  return (
    <select className="px-3 py-2 border rounded text-sm text-gray-600">
      <option>{label}</option>
    </select>
  );
}

/* Status Badge */
function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Active"
      ? "bg-green-100 text-green-600"
      : status === "Inactive"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-600";

  return (
    <span className={`px-2 py-1 rounded text-xs ${styles}`}>
      {status}
    </span>
  );
}

/* Tier Badge */
function TierBadge({ tier }: { tier: string }) {
  const styles =
    tier === "Platinum"
      ? "bg-black text-white"
      : tier === "Gold"
      ? "bg-yellow-100 text-yellow-600"
      : tier === "Silver"
      ? "bg-gray-200 text-gray-700"
      : "bg-orange-100 text-orange-600";

  return (
    <span className={`px-2 py-1 rounded text-xs ${styles}`}>
      {tier}
    </span>
  );
}