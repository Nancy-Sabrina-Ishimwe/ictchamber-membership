import { Search, Filter, ChevronDown } from "lucide-react";

type Member = {
  id: string;
  name: string;
  cluster: string;
  website: string;
  category: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
};

const members: Member[] = [
  { id: "ICT2024PN924", name: "Hviewtech group",            cluster: "IT Hardware and Solutions",          website: "www.hviewtech.com",          category: "Commercial Company",        tier: "Platinum", status: "Active",   joinDate: "15 Jan 2024" },
  { id: "ICT2024NA055", name: "1000 hills traveler",        cluster: "Tourism & Hospitality",              website: "www.bookly.africa",           category: "Associated",                tier: "Gold",     status: "Active",   joinDate: "20 Mar 2024" },
  { id: "ICT2024PS233", name: "1000hills animation studio", cluster: "Media Tech",                         website: "thousandhillsanima.wix",      category: "Commercial Company",        tier: "Silver",   status: "Inactive", joinDate: "10 May 2024" },
  { id: "ICT2024CM756", name: "4netafrica /isp",            cluster: "Infrastructure and Connectivity Services", website: "www.4netafrica.com",    category: "Program Partner",           tier: "Bronze",   status: "Active",   joinDate: "01 Sep 2024" },
  { id: "ICT2024TB775", name: "Ab global consultants",      cluster: "IT Hardware and Solutions",          website: "www.linkedin.com/comp",       category: "Individual Professional",   tier: "Bronze",   status: "Pending",  joinDate: "25 Oct 2024" },
  { id: "ICT2024PB644", name: "AC Group",                   cluster: "IT Hardware and Solutions",          website: "www.acgroup.rw",              category: "Commercial Company",        tier: "Platinum", status: "Active",   joinDate: "12 Feb 2024" },
  { id: "ICT2024MM464", name: "Academic bridge",            cluster: "EdTech",                             website: "academicbridge.xyz",          category: "Program",                   tier: "Silver",   status: "Active",   joinDate: "05 Jul 2024" },
  { id: "ICT2024MO848", name: "Adfinance",                  cluster: "FinTech",                            website: "www.adfinance.co",            category: "Multiple Business",         tier: "Gold",     status: "Inactive", joinDate: "18 Aug 2024" },
  { id: "ICT2024YK637", name: "Aegis consult",              cluster: "IT Hardware and Solutions",          website: "www.aegistrust.org",          category: "Commercial Company",        tier: "Silver",   status: "Active",   joinDate: "22 Nov 2024" },
  { id: "ICT2024KB405", name: "Africa Blockchain Institute",cluster: "eCommerce and eServices",            website: "africablockchain.institut",   category: "Commercial Company",        tier: "Platinum", status: "Active",   joinDate: "14 Apr 2024" },
];

const tierStyles = {
  Platinum: "bg-gray-900 text-white",
  Gold:     "bg-yellow-100 text-yellow-700",
  Silver:   "bg-gray-100 text-gray-600",
  Bronze:   "bg-orange-100 text-orange-600",
};

const statusStyles = {
  Active:   { dot: "text-green-500", badge: "bg-green-50 text-green-600 border-green-200" },
  Inactive: { dot: "text-red-400",   badge: "bg-red-50 text-red-500 border-red-200" },
  Pending:  { dot: "text-yellow-500",badge: "bg-yellow-50 text-yellow-600 border-yellow-200" },
};

function TierBadge({ tier }: { tier: Member["tier"] }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierStyles[tier]}`}>
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: Member["status"] }) {
  const s = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.badge}`}>
      <span className={`text-base leading-none ${s.dot}`}>⊙</span>
      {status}
    </span>
  );
}

function SelectFilter({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none w-full pl-3 pr-8 py-2 border border-gray-200 rounded-md text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300">
        <option>{label}</option>
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function Members() {
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ICT Chamber Members</h2>
          <p className="text-gray-400 text-xs mt-0.5">List of companies and individuals that subscribed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs shadow-sm">
            Total Active: <span className="font-bold text-green-600">342</span>
          </div>
          <button className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 transition-colors text-black rounded-md text-xs font-semibold">
            Registrations
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-3">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 flex-1 min-w-[180px]">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              placeholder="Search company, contact, or email..."
              className="outline-none text-xs w-full bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
          <SelectFilter label="All Clusters" />
          <SelectFilter label="All Categories" />
          <SelectFilter label="All Statuses" />
          <SelectFilter label="Any Tier" />
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Filter size={13} /> More Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.id} className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{m.id}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div><p className="text-gray-400">Cluster</p><p className="text-gray-700">{m.cluster}</p></div>
                <div><p className="text-gray-400">Tier</p><div className="mt-0.5"><TierBadge tier={m.tier} /></div></div>
                <div><p className="text-gray-400">Category</p><p className="text-gray-700">{m.category}</p></div>
                <div><p className="text-gray-400">Join Date</p><p className="text-gray-700">{m.joinDate}</p></div>
              </div>
              <a className="mt-2 inline-block text-xs text-blue-600 underline break-all" href={`https://${m.website}`} target="_blank" rel="noreferrer">
                {m.website}
              </a>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-xs min-w-[960px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded" /></th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">MEMBERSHIP ID</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">COMPANY NAME</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">MEMBERSHIP CLUSTER</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">COMPANY WEBSITE</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">CATEGORY</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">TIER</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">STATUS</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">JOIN DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-3 py-3 text-blue-600 font-medium cursor-pointer hover:underline">{m.id}</td>
                  <td className="px-3 py-3 font-semibold text-gray-800">{m.name}</td>
                  <td className="px-3 py-3 text-gray-500">{m.cluster}</td>
                  <td className="px-3 py-3">
                    <a href={`https://${m.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block max-w-[140px]">
                      {m.website}
                    </a>
                  </td>
                  <td className="px-3 py-3 text-gray-500">{m.category}</td>
                  <td className="px-3 py-3"><TierBadge tier={m.tier} /></td>
                  <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-3 py-3 text-gray-500">{m.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <p>Showing <span className="font-medium text-gray-700">1</span> to <span className="font-medium text-gray-700">10</span> of <span className="font-medium text-gray-700">342</span> entries</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">Previous</button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`px-3 py-1.5 rounded-md transition-colors ${n === 1 ? "bg-gray-900 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
              >
                {n}
              </button>
            ))}
            <span className="px-1">...</span>
            <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">35</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}