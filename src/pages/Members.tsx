import { Search, 
  // Filter, 
  ChevronDown, MoreVertical, Eye, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { ROUTES } from "../constants/app";

type Member = {
  id: string;
  name: string;
  cluster: string;
  website: string;
  category: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
  lastPaymentAmount: string;
  lastPaymentDate: string;
};

type MemberApiItem = {
  id: number;
  companyName: string;
  logoUrl: string | null;
  role: string;
  active: boolean;
  cluster?: { clusterName: string } | null;
  selectedTier?: { tierName: string } | null;
  membershipPayments?: Array<{
    amount: number;
    paidAt?: string | null;
    createdAt: string;
  }>;
  subscriptions?: Array<{
    startDate: string;
  }>;
};

type MembersApiResponse = {
  success: boolean;
  count: number;
  data: MemberApiItem[];
};

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
  const icon =
    status === "Active" ? (
      <CheckCircle2 size={12} />
    ) : status === "Inactive" ? (
      <XCircle size={12} />
    ) : (
      <Clock3 size={12} />
    );

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.badge}`}>
      <span className={s.dot}>{icon}</span>
      {status}
    </span>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none w-full pl-3 pr-8 py-2 border border-gray-200 rounded-md text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

const normalizeTier = (tierName?: string | null): Member["tier"] => {
  const normalized = (tierName ?? "").trim().toLowerCase();
  if (normalized === "platinum") return "Platinum";
  if (normalized === "gold") return "Gold";
  if (normalized === "silver") return "Silver";
  return "Bronze";
};

const formatDate = (rawDate?: string) => {
  if (!rawDate) return "-";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const mapMemberFromApi = (member: MemberApiItem): Member => ({
  ...(() => {
    const isPending = !member.active && !member.selectedTier;
    const latestPayment = member.membershipPayments?.[0];
    return {
      id: String(member.id),
      name: member.companyName,
      cluster: member.cluster?.clusterName ?? "-",
      website: member.logoUrl ?? "-",
      category: member.role,
      tier: normalizeTier(member.selectedTier?.tierName),
      status: isPending ? "Pending" : (member.active ? "Active" : "Inactive"),
      joinDate: formatDate(member.subscriptions?.[0]?.startDate),
      lastPaymentAmount: latestPayment ? `RWF ${latestPayment.amount.toLocaleString()}` : "-",
      lastPaymentDate: latestPayment ? formatDate(latestPayment.paidAt ?? latestPayment.createdAt) : "-",
    } satisfies Member;
  })(),
});

export default function Members() {
  const navigate = useNavigate();
  const [openActionFor, setOpenActionFor] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<MembersApiResponse>("/members");
        setMembers((response.data.data ?? []).map(mapMemberFromApi));
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load members.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMembers();

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-member-action-menu]")) {
        setOpenActionFor(null);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const activeMembersCount = members.filter((member) => member.status === "Active").length;
  const clusterOptions = useMemo(
    () => Array.from(new Set(members.map((member) => member.cluster).filter((cluster) => cluster !== "-"))).sort(),
    [members],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(members.map((member) => member.category).filter(Boolean))).sort(),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return members.filter((member) => {
      if (clusterFilter && member.cluster !== clusterFilter) return false;
      if (categoryFilter && member.category !== categoryFilter) return false;
      if (statusFilter && member.status !== statusFilter) return false;
      if (tierFilter && member.tier !== tierFilter) return false;
      if (!normalizedSearch) return true;

      const searchable = [member.id, member.name, member.website, member.category, member.cluster].join(" ").toLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [members, searchTerm, clusterFilter, categoryFilter, statusFilter, tierFilter]);

  const totalEntries = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = totalEntries === 0 ? 0 : (currentPageSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
  const paginatedMemberIds = paginatedMembers.map((member) => member.id);
  const selectedVisibleCount = paginatedMemberIds.filter((id) => selectedMemberIds.includes(id)).length;
  const allVisibleSelected = paginatedMemberIds.length > 0 && selectedVisibleCount === paginatedMemberIds.length;
  const partiallyVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clusterFilter, categoryFilter, statusFilter, tierFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = partiallyVisibleSelected;
  }, [partiallyVisibleSelected]);

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedMemberIds((prev) => prev.filter((id) => !paginatedMemberIds.includes(id)));
      return;
    }
    setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...paginatedMemberIds])));
  };

  const toggleSelectMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  const toggleMemberStatus = async (memberId: string) => {
    try {
      await api.patch(`/members/${memberId}/toggle-active`);
      setMembers((previousMembers) =>
        previousMembers.map((member) => {
          if (member.id !== memberId) return member;
          return {
            ...member,
            status: member.status === "Active" ? "Inactive" : "Active",
          };
        }),
      );
      setOpenActionFor(null);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Failed to toggle member status.");
    }
  };

  const viewMemberProfile = (memberId: string) => {
    // Navigate immediately; the profile page can load its own data.
    navigate(`/admin/members/${memberId}`);
    setOpenActionFor(null);
  };

  const renderStatusAction = (status: Member["status"]) => {
    if (status === "Inactive") {
      return ["Activate"];
    }
    if (status === "Active") {
      return ["Deactivate"];
    }
    return ["Activate", "Deactivate"];
  };

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
            Total Active: <span className="font-bold text-green-600">{activeMembersCount}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_REGISTRATIONS)}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 transition-colors text-black rounded-md text-xs font-semibold"
          >
            Registrations
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-3">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 flex-1 min-w-[180px]">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              placeholder="Search company, contact, or email..."
              className="outline-none text-xs w-full bg-transparent text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <SelectFilter label="All Clusters" value={clusterFilter} options={clusterOptions} onChange={setClusterFilter} />
          <SelectFilter label="All Categories" value={categoryFilter} options={categoryOptions} onChange={setCategoryFilter} />
          <SelectFilter
            label="All Statuses"
            value={statusFilter}
            options={["Active", "Inactive", "Pending"]}
            onChange={setStatusFilter}
          />
          <SelectFilter label="Any Tier" value={tierFilter} options={["Platinum", "Gold", "Silver", "Bronze"]} onChange={setTierFilter} />
          {/* <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Filter size={13} /> More Filters
          </button> */}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {isLoading ? <p className="p-3 text-xs text-gray-500">Loading members...</p> : null}
          {!isLoading && paginatedMembers.length === 0 ? (
            <p className="p-3 text-xs text-gray-500">No members match the selected filters.</p>
          ) : null}
          {paginatedMembers.map((m) => (
            <div key={m.id} className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{m.id}</p>
                </div>
                <div className="flex items-start gap-2">
                  <StatusBadge status={m.status} />
                  <div className="relative inline-flex" data-member-action-menu>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenActionFor((prev) => (prev === m.id ? null : m.id));
                      }}
                      className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      aria-label={`Open actions for ${m.name}`}
                    >
                      <MoreVertical size={14} />
                    </button>

                    {openActionFor === m.id ? (
                      <div className="absolute right-0 top-7 z-20 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => void viewMemberProfile(m.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={12} />
                          View Profile
                        </button>
                        {renderStatusAction(m.status).map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => void toggleMemberStatus(m.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div><p className="text-gray-400">Cluster</p><p className="text-gray-700">{m.cluster}</p></div>
                <div><p className="text-gray-400">Tier</p><div className="mt-0.5"><TierBadge tier={m.tier} /></div></div>
                <div><p className="text-gray-400">Category</p><p className="text-gray-700">{m.category}</p></div>
                <div><p className="text-gray-400">Join Date</p><p className="text-gray-700">{m.joinDate}</p></div>
                <div><p className="text-gray-400">Last Payment</p><p className="text-gray-700 font-medium">{m.lastPaymentAmount}</p><p className="text-[11px] text-gray-400">{m.lastPaymentDate}</p></div>
              </div>
              {m.website !== "-" ? (
                <a className="mt-2 inline-block text-xs text-blue-600 underline break-all" href={m.website} target="_blank" rel="noreferrer">
                  {m.website}
                </a>
              ) : null}
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-xs min-w-[960px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="rounded"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible members"
                  />
                </th>
                {/* <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">MEMBERSHIP ID</th> */}
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">COMPANY NAME</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">MEMBERSHIP CLUSTER</th>
                {/* <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">COMPANY WEBSITE</th> */}
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">CATEGORY</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">TIER</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">STATUS</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">JOIN DATE</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">LAST PAYMENT</th>
                <th className="text-left px-3 py-3 text-gray-400 font-semibold tracking-wide">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-xs text-gray-500">
                    Loading members...
                  </td>
                </tr>
              ) : null}
              {!isLoading && paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-xs text-gray-500">
                    No members match the selected filters.
                  </td>
                </tr>
              ) : null}
              {paginatedMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedMemberIds.includes(m.id)}
                      onChange={() => toggleSelectMember(m.id)}
                      aria-label={`Select ${m.name}`}
                    />
                  </td>
                  {/* <td className="px-3 py-3 text-blue-600 font-medium cursor-pointer hover:underline">{m.id}</td> */}
                  <td className="px-3 py-3 font-semibold text-gray-800">{m.name}</td>
                  <td className="px-3 py-3 text-gray-500">{m.cluster}</td>
                  {/* <td className="px-3 py-3">
                    {m.website !== "-" ? (
                      <a href={m.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block max-w-[140px]">
                        {m.website}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td> */}
                  <td className="px-3 py-3 text-gray-500">{m.category}</td>
                  <td className="px-3 py-3"><TierBadge tier={m.tier} /></td>
                  <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-3 py-3 text-gray-500">{m.joinDate}</td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-gray-800">{m.lastPaymentAmount}</p>
                    <p className="text-[11px] text-gray-400">{m.lastPaymentDate}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative inline-flex" data-member-action-menu>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenActionFor((prev) => (prev === m.id ? null : m.id));
                        }}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        aria-label={`Open actions for ${m.name}`}
                      >
                        <MoreVertical size={15} />
                      </button>

                      {openActionFor === m.id ? (
                        <div className="absolute right-0 top-8 z-20 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => void viewMemberProfile(m.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Eye size={12} />
                            View Profile
                          </button>
                          {renderStatusAction(m.status).map((action) => (
                            <button
                              key={action}
                              type="button"
                              onClick={() => void toggleMemberStatus(m.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <p>
            Showing <span className="font-medium text-gray-700">{totalEntries === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-medium text-gray-700">{endIndex}</span> of{" "}
            <span className="font-medium text-gray-700">{totalEntries}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPageSafe === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  n === currentPageSafe ? "bg-gray-900 text-white" : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPageSafe === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
