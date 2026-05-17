import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Calendar,
  ChevronDown,
  Layers,
  Loader2,
  MapPin,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { api } from "../lib/api";

export type EventFormValue = {
  title: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  companies: string[];
};

type Props = {
  onClose: () => void;
  onSave: (payload: EventFormValue) => Promise<void> | void;
};

type MemberApiItem = {
  companyName?: string | null;
  active?: boolean;
  cluster?: { clusterName: string } | null;
  subcluster?: { name: string } | null;
  selectedTier?: { tierName: string } | null;
};

type EventMember = {
  companyName: string;
  cluster: string;
  subcluster: string;
  tier: string;
};

const ALL = "all";

export default function EventModal({ onClose, onSave }: Props) {
  const [members, setMembers] = useState<EventMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [companies, setCompanies] = useState<string[]>([]);
  const [directorySearch, setDirectorySearch] = useState("");
  const [clusterFilter, setClusterFilter] = useState(ALL);
  const [subclusterFilter, setSubclusterFilter] = useState(ALL);
  const [tierFilter, setTierFilter] = useState(ALL);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        setMembersError(null);
        const response = await api.get<{ data?: MemberApiItem[] }>("/members");
        const mapped = (response.data.data ?? [])
          .map(mapApiMember)
          .filter((member): member is EventMember => member !== null);
        const byName = new Map<string, EventMember>();
        for (const member of mapped) {
          const key = member.companyName.toLowerCase();
          if (!byName.has(key)) byName.set(key, member);
        }
        setMembers(
          [...byName.values()].sort((a, b) =>
            a.companyName.localeCompare(b.companyName, undefined, { sensitivity: "base" }),
          ),
        );
      } catch (error) {
        setMembersError(error instanceof Error ? error.message : "Failed to load member companies.");
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    void loadMembers();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (clusterFilter === ALL) return;
    if (subclusterFilter === ALL) return;
    const subclusterExists = members.some(
      (member) => member.cluster === clusterFilter && member.subcluster === subclusterFilter,
    );
    if (!subclusterExists) setSubclusterFilter(ALL);
  }, [clusterFilter, subclusterFilter, members]);

  const selectedKeys = useMemo(
    () => new Set(companies.map((name) => name.toLowerCase())),
    [companies],
  );

  const clusterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const member of members) {
      if (member.cluster) set.add(member.cluster);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [members]);

  const subclusterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const member of members) {
      if (!member.subcluster) continue;
      if (clusterFilter !== ALL && member.cluster !== clusterFilter) continue;
      set.add(member.subcluster);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [members, clusterFilter]);

  const tierOptions = useMemo(() => {
    const set = new Set<string>();
    for (const member of members) {
      if (member.tier) set.add(member.tier);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [members]);

  const directoryFiltersActive =
    directorySearch.trim() !== "" ||
    clusterFilter !== ALL ||
    subclusterFilter !== ALL ||
    tierFilter !== ALL;

  const filteredDirectory = useMemo(() => {
    const query = directorySearch.trim().toLowerCase();
    return members.filter((member) => {
      if (selectedKeys.has(member.companyName.toLowerCase())) return false;
      if (clusterFilter !== ALL && member.cluster !== clusterFilter) return false;
      if (subclusterFilter !== ALL && member.subcluster !== subclusterFilter) return false;
      if (tierFilter !== ALL && member.tier !== tierFilter) return false;
      if (!query) return true;
      const haystack = [
        member.companyName,
        member.cluster,
        member.subcluster,
        member.tier,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [members, selectedKeys, directorySearch, clusterFilter, subclusterFilter, tierFilter]);

  const clusterBulkTargets = useMemo(() => {
    const map = new Map<string, EventMember[]>();
    for (const member of members) {
      if (!member.cluster || selectedKeys.has(member.companyName.toLowerCase())) continue;
      const list = map.get(member.cluster) ?? [];
      list.push(member);
      map.set(member.cluster, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [members, selectedKeys]);

  const addCompanies = (names: string[]) => {
    if (names.length === 0) return;
    setCompanies((prev) => {
      const keys = new Set(prev.map((name) => name.toLowerCase()));
      const next = [...prev];
      for (const name of names) {
        const key = name.toLowerCase();
        if (keys.has(key)) continue;
        keys.add(key);
        next.push(name);
      }
      return next;
    });
  };

  const removeCompany = (name: string) => {
    setCompanies((prev) => prev.filter((c) => c !== name));
  };

  const clearSelectedCompanies = () => setCompanies([]);

  const clearDirectoryFilters = () => {
    setDirectorySearch("");
    setClusterFilter(ALL);
    setSubclusterFilter(ALL);
    setTierFilter(ALL);
  };

  const addAllMatchingDirectory = () => {
    addCompanies(filteredDirectory.map((member) => member.companyName));
  };

  const addAllInCluster = (clusterName: string) => {
    addCompanies(
      members
        .filter((member) => member.cluster === clusterName)
        .map((member) => member.companyName),
    );
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedTime = time.trim();
    if (!trimmedTitle) {
      setFormError("Event name is required.");
      return;
    }
    if (!date) {
      setFormError("Event date is required.");
      return;
    }
    if (!trimmedTime) {
      setFormError("Event time is required.");
      return;
    }
    if (companies.length === 0) {
      setFormError("Select at least one member company from the directory.");
      return;
    }
    if (members.length === 0 && !loadingMembers) {
      setFormError("No active member companies available. Add members before creating an event.");
      return;
    }
    setFormError(null);
    try {
      setIsSaving(true);
      await onSave({
        title: trimmedTitle,
        date,
        time: trimmedTime,
        location: location.trim() || "Virtual Event",
        notes: notes.trim(),
        companies,
      });
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-black/50 px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16"
      onClick={() => {
        if (isSaving) return;
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl min-h-0 max-h-[min(90vh,calc(100dvh-6rem))] overflow-y-scroll overflow-x-hidden overscroll-contain rounded-md border border-gray-200 bg-white shadow-lg [scrollbar-width:thin] [scrollbar-color:#d4d4d8_#f4f4f5] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the primary information for the upcoming partner event.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close event modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

            <Input
              label="Event Name / Topic *"
              placeholder="Q3 Corporate Sustainability Summit"
              value={title}
              onChange={setTitle}
              disabled={loadingMembers}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IconInput
                label="Event Date *"
                icon={<Calendar size={16} />}
                type="date"
                value={date}
                onChange={setDate}
                disabled={loadingMembers}
              />

              <IconInput
                label="Location (Optional)"
                icon={<MapPin size={16} />}
                placeholder="Grand Hyatt, Seattle WA"
                value={location}
                onChange={setLocation}
                disabled={loadingMembers}
              />
            </div>

            <Input
              label="Event Time *"
              placeholder="9:00 AM - 5:00 PM"
              value={time}
              onChange={setTime}
              disabled={loadingMembers}
            />

            <div>
              <label className="text-sm text-gray-700 font-medium">Description & Notes</label>
              <textarea
                rows={3}
                value={notes}
                disabled={loadingMembers}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full mt-1.5 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Annual gathering of partner companies to discuss Q3 sustainability targets, review carbon offset initiatives, and plan for Q4 joint ventures. Keynote by Sarah Jenkins. Ensure VIP catering is booked."
              />
            </div>

            <hr className="border-gray-200" />

            <div className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Benefitting Companies</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Filter the directory, then add individually or invite a whole cluster at once.
                  </p>
                </div>
                {companies.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F2A56]/10 text-[#0F2A56] px-2.5 py-1 text-xs font-medium shrink-0">
                    <Users size={13} aria-hidden />
                    {companies.length} selected
                  </span>
                ) : null}
              </div>

              {loadingMembers ? (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading member companies…
                </p>
              ) : membersError ? (
                <p className="text-xs text-red-600">{membersError}</p>
              ) : members.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  No active member companies found. Add members first, then schedule an event.
                </p>
              ) : (
                <>
                  {companies.length > 0 ? (
                    <div className="border border-gray-200 rounded-md px-3 py-2 flex flex-wrap gap-2 items-center min-h-[44px] bg-gray-50/50">
                      {companies.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs max-w-full"
                        >
                          <Building2 size={11} className="text-gray-400 shrink-0" />
                          <span className="truncate">{name}</span>
                          <button
                            type="button"
                            disabled={loadingMembers || isSaving}
                            onClick={() => removeCompany(name)}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                            aria-label={`Remove ${name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={clearSelectedCompanies}
                        disabled={isSaving}
                        className="text-xs text-gray-500 hover:text-gray-800 ml-auto"
                      >
                        Clear all
                      </button>
                    </div>
                  ) : null}

                  <div className="rounded-md border border-gray-200 bg-gray-50/40 p-3 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Layers size={16} className="text-gray-400" aria-hidden />
                        <span>Find companies</span>
                        {directoryFiltersActive ? (
                          <span className="text-xs font-normal text-gray-500">
                            ({filteredDirectory.length} available)
                          </span>
                        ) : null}
                      </div>
                      {directoryFiltersActive ? (
                        <button
                          type="button"
                          onClick={clearDirectoryFilters}
                          className="text-xs text-gray-600 hover:text-gray-900"
                        >
                          Clear filters
                        </button>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white">
                      <Search size={14} className="text-gray-400 shrink-0" aria-hidden />
                      <input
                        value={directorySearch}
                        disabled={loadingMembers}
                        onChange={(event) => setDirectorySearch(event.target.value)}
                        placeholder="Search company, cluster, subcluster, tier…"
                        className="outline-none text-sm w-full bg-transparent placeholder:text-gray-400"
                        aria-label="Search member directory"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <DirectoryFilterSelect
                        label="Cluster"
                        value={clusterFilter}
                        onChange={(value) => {
                          setClusterFilter(value);
                          setSubclusterFilter(ALL);
                        }}
                        placeholder="All clusters"
                        options={clusterOptions}
                      />
                      <DirectoryFilterSelect
                        label="Subcluster"
                        value={subclusterFilter}
                        onChange={setSubclusterFilter}
                        placeholder="All subclusters"
                        options={subclusterOptions}
                        disabled={subclusterOptions.length === 0}
                      />
                      <DirectoryFilterSelect
                        label="Tier"
                        value={tierFilter}
                        onChange={setTierFilter}
                        placeholder="All tiers"
                        options={tierOptions}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {filteredDirectory.length > 0 ? (
                        <button
                          type="button"
                          onClick={addAllMatchingDirectory}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#0F2A56]/20 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F2A56] hover:bg-[#0F2A56]/5 transition-colors"
                        >
                          <UserPlus size={13} aria-hidden />
                          Add all matching ({filteredDirectory.length})
                        </button>
                      ) : null}
                      {clusterFilter !== ALL ? (
                        <button
                          type="button"
                          onClick={() => addAllInCluster(clusterFilter)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1.5 rounded-md border border-yellow-400/60 bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-900 hover:bg-yellow-100 transition-colors"
                        >
                          <Users size={13} aria-hidden />
                          Add all in {clusterFilter}
                        </button>
                      ) : null}
                    </div>

                    {clusterBulkTargets.length > 0 && clusterFilter === ALL ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                          Quick invite by cluster
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {clusterBulkTargets.map(([clusterName, clusterMembers]) => (
                            <button
                              key={clusterName}
                              type="button"
                              onClick={() => addAllInCluster(clusterName)}
                              disabled={isSaving}
                              className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              + All {clusterName} ({clusterMembers.length})
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-md border border-gray-200 bg-white max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {filteredDirectory.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-gray-500 text-center">
                          {directoryFiltersActive
                            ? "No companies match these filters."
                            : "All matching companies are already selected."}
                        </p>
                      ) : (
                        filteredDirectory.map((member) => (
                          <button
                            key={member.companyName}
                            type="button"
                            disabled={isSaving}
                            onClick={() => addCompanies([member.companyName])}
                            className="w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors disabled:opacity-60"
                          >
                            <p className="text-sm font-medium text-gray-900 truncate">{member.companyName}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {[member.cluster, member.subcluster].filter(Boolean).join(" · ") || "No cluster"}
                              {member.tier ? ` · ${member.tier}` : ""}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 sm:pt-5 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSaving || loadingMembers || members.length === 0 || Boolean(membersError)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-yellow-500 rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Saving…
                </>
              ) : (
                "Save Event"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function mapApiMember(member: MemberApiItem): EventMember | null {
  const companyName = member.companyName?.trim() ?? "";
  if (!companyName || member.active === false) return null;
  return {
    companyName,
    cluster: member.cluster?.clusterName?.trim() ?? "",
    subcluster: member.subcluster?.name?.trim() ?? "",
    tier: formatTierLabel(member.selectedTier?.tierName),
  };
}

function formatTierLabel(tierName?: string | null) {
  const normalized = (tierName ?? "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "platinum") return "Platinum";
  if (normalized === "gold") return "Gold";
  if (normalized === "silver") return "Silver";
  if (normalized === "bronze") return "Bronze";
  return tierName?.trim() ?? "";
}

function DirectoryFilterSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
}) {
  const id = `event-directory-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1 min-w-0">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2 pl-2.5 pr-8 text-sm text-gray-900 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/80 disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <option value={ALL}>{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          aria-hidden
        />
      </div>
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium">{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full mt-1.5 border border-gray-200 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function IconInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  icon: ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 mt-1.5">
        <div className="text-gray-400">{icon}</div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="ml-2 outline-none text-sm w-full bg-transparent disabled:cursor-not-allowed disabled:bg-transparent"
        />
      </div>
    </div>
  );
}
