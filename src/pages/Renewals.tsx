import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock3,
  Building2,
  SlidersHorizontal,
  FileText,
  Loader2,
  Eye,
} from "lucide-react";
import type { Renewal } from "../types/renewal";
import {
  getRenewalsDashboard,
  previewRenewalTemplate,
  updateRenewalSettings,
  type ReminderTrigger,
} from "../services/renewalService";

type StatusFilter = "all" | "urgent" | "sent" | "pending";

export default function Renewals() {
  const [data, setData] = useState<Renewal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [triggers, setTriggers] = useState<ReminderTrigger[]>([]);
  const [templateBody, setTemplateBody] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [previewSubject, setPreviewSubject] = useState("Membership Renewal Reminder");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [summary, setSummary] = useState({
    expiringSoon: 0,
    projectedRevenue: 0,
    activeTriggerCount: 0,
    totalTriggers: 0,
  });
  const pageSize = 5;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dashboard = await getRenewalsDashboard();
        setData(dashboard.items);
        setTriggers(dashboard.triggers);
        setTemplateBody(dashboard.template.body);
        setSummary(dashboard.summary);
      } catch (error) {
        setFlash({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to load renewal dashboard.",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return data.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!query) return true;
      const searchable = `${item.companyName} ${item.tier} ${item.category}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [data, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const saveSettings = async (nextTriggers = triggers, nextTemplateBody = templateBody) => {
    try {
      setSaving(true);
      setFlash(null);
      const message = await updateRenewalSettings({
        triggers: nextTriggers,
        templateBody: nextTemplateBody,
      });
      setTriggers(nextTriggers);
      setTemplateBody(nextTemplateBody);
      setSummary((current) => ({
        ...current,
        activeTriggerCount: nextTriggers.filter((item) => item.enabled).length,
      }));
      setFlash({ type: "success", text: message });
    } catch (error) {
      setFlash({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save renewal settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTrigger = async (triggerId: ReminderTrigger["id"]) => {
    const nextTriggers = triggers.map((item) =>
      item.id === triggerId ? { ...item, enabled: !item.enabled } : item,
    );
    await saveSettings(nextTriggers, templateBody);
  };

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      setFlash(null);
      const firstMemberId = filteredData[0]?.memberId;
      const preview = await previewRenewalTemplate(firstMemberId);
      setPreviewSubject(preview.subject);
      setPreviewBody(preview.body);
    } catch (error) {
      setFlash({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to preview template.",
      });
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {flash ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            flash.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {flash.text}
        </div>
      ) : null}

      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Renewal Management Hub</h2>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Automate and track membership retention
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:w-auto">
            <TopStat label="EXPIRING < 30 DAYS" value={summary.expiringSoon.toString()} red />
            <TopStat
              label="PROJECTED REVENUE"
              value={formatCompactMoney(summary.projectedRevenue)}
              suffix="RWF"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-3">
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-2.5 border-b border-gray-100 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                <Clock3 size={15} className="text-gray-500" />
                Upcoming Expiries
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Memberships expiring within the next 90 days
              </p>
            </div>

            <div className="flex w-full gap-2 lg:w-auto">
              <div className="flex w-full items-center rounded-md border border-gray-200 px-2.5 py-1.5 lg:w-64">
                <Search size={13} className="text-gray-400" />
                <input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="ml-2 w-full bg-transparent text-xs outline-none sm:text-sm"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="h-full appearance-none rounded-md border border-gray-200 bg-white px-9 py-1.5 text-xs text-gray-700 outline-none sm:text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="urgent">Urgent</option>
                  <option value="sent">Sent</option>
                  <option value="pending">Pending</option>
                </select>
                <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="hidden grid-cols-3 border-b border-gray-100 bg-gray-50/60 px-3 py-2.5 text-[11px] font-medium text-gray-500 md:grid sm:px-4">
            <p>Member Organization</p>
            <p>Expiry Details</p>
            <p>Automation Status</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-4 py-16 text-sm text-gray-500">
              <Loader2 size={18} className="mr-2 animate-spin" />
              Loading renewal data...
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 md:hidden">
                {paginatedData.map((item) => (
                  <div key={item.id} className="space-y-2.5 p-3 transition-colors hover:bg-gray-50/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <Building2 size={14} className="text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="break-words text-xs font-semibold text-gray-900 sm:text-sm">{item.companyName}</p>
                          <p className="break-words text-xs text-gray-500">
                            {item.tier} - {item.category}
                          </p>
                        </div>
                      </div>
                      <ExpiryBadge days={item.daysLeft} />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <p className="text-gray-400">Expiry</p>
                        <p className="mt-0.5 text-[11px] font-medium text-gray-800 sm:text-xs">{formatDate(item.expiryDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <div className="mt-0.5">
                          <AutomationStatus item={item} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && paginatedData.length === 0 ? (
                  <EmptyState />
                ) : null}
              </div>

              <div className="hidden md:block">
                {paginatedData.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-3 items-start gap-2.5 border-b border-gray-100 px-3 py-3 transition-colors hover:bg-gray-50/60 lg:items-center sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <Building2 size={14} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="break-words text-xs font-medium text-gray-900 sm:text-sm">{item.companyName}</p>
                        <p className="break-words text-xs text-gray-500">
                          {item.tier} - {item.category}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-800 sm:text-sm">{formatDate(item.expiryDate)}</p>
                      <div className="mt-1.5">
                        <ExpiryBadge days={item.daysLeft} />
                      </div>
                    </div>

                    <AutomationStatus item={item} />
                  </div>
                ))}
                {!loading && paginatedData.length === 0 ? (
                  <EmptyState />
                ) : null}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 p-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <p>
              Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + paginatedData.length, filteredData.length)} of {filteredData.length} expiring members
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-md border border-gray-200 px-3 py-1 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-md border border-gray-200 px-3 py-1 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <SlidersHorizontal size={14} className="text-gray-500" />
                Automated Triggers
              </h3>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {summary.activeTriggerCount}/{summary.totalTriggers} Active
              </span>
            </div>

            <p className="mb-3 text-xs text-gray-500 sm:text-sm">
              System will automatically dispatch the template below based on these active rules.
            </p>

            {triggers.map((trigger) => (
              <Trigger
                key={trigger.id}
                label={trigger.label}
                sub={trigger.sub}
                enabled={trigger.enabled}
                disabled={saving}
                onToggle={() => void handleToggleTrigger(trigger.id)}
              />
            ))}
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FileText size={14} className="text-gray-500" />
              Standard Reminder Template
            </h3>

            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">AVAILABLE VARIABLES</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {["[Company Name]", "[Remaining Days]", "[Expiry Date]", "[Tier Level]"].map((tag) => (
                <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>

            <textarea
              value={templateBody}
              onChange={(event) => setTemplateBody(event.target.value)}
              className="h-40 w-full resize-none rounded-md border border-gray-200 p-2.5 text-xs sm:text-sm"
            />

            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => void saveSettings(triggers, templateBody)}
                disabled={saving}
                className="w-full rounded-md bg-yellow-500 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
              >
                {saving ? "Saving..." : "Save Template"}
              </button>
              <button
                type="button"
                onClick={() => void handlePreview()}
                disabled={previewing}
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
              >
                {previewing ? "Preparing..." : "Preview"}
              </button>
            </div>

            <div className="mt-4 rounded-md border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Eye size={14} className="text-gray-500" />
                <p className="text-sm font-medium text-gray-800">{previewSubject}</p>
              </div>
              <div className="whitespace-pre-wrap text-xs leading-6 text-gray-600 sm:text-sm">
                {previewBody || "Click preview to render the reminder using the first expiring member in the list."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-4 py-12 text-center text-sm text-gray-500">
      No expiring memberships match the current search and filter.
    </div>
  );
}

type TopStatProps = {
  label: string;
  value: string;
  suffix?: string;
  red?: boolean;
};

function TopStat({ label, value, suffix, red }: TopStatProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs sm:text-sm">
      <p className="text-[10px] font-semibold leading-tight text-gray-500 sm:text-xs">{label}</p>
      <p className={`mt-1 text-base font-bold leading-tight sm:text-lg ${red ? "text-red-500" : "text-gray-900"}`}>
        {value}
        {suffix ? <span className="ml-1 text-xs font-semibold text-gray-500">{suffix}</span> : null}
      </p>
    </div>
  );
}

function ExpiryBadge({ days }: { days: number }) {
  let style = "bg-green-100 text-green-600";

  if (days < 10) style = "bg-red-100 text-red-600";
  else if (days < 30) style = "bg-yellow-100 text-yellow-600";

  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${style}`}>
      {days} days left
    </span>
  );
}

function Trigger({
  label,
  sub,
  enabled,
  disabled,
  onToggle,
}: {
  label: string;
  sub: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-md border border-gray-100 p-2.5">
      <div>
        <p className="text-xs font-medium text-gray-800 sm:text-sm">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={onToggle}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          enabled ? "bg-slate-800" : "bg-gray-300"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            enabled ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function AutomationStatus({ item }: { item: Renewal }) {
  if (item.status === "urgent") {
    return (
      <div className="flex items-start gap-2 text-xs text-gray-600 sm:text-sm">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
        <span className="break-words">
          {item.lastNotification ?? "Recently"} ({item.channel ?? "Email + SMS"}) (Urgent)
        </span>
      </div>
    );
  }

  if (item.status === "sent") {
    return (
      <div className="flex items-start gap-2 text-xs text-gray-600 sm:text-sm">
        <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
        <span className="break-words">
          {item.lastNotification ?? "Recently"} ({item.channel ?? "Email"})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 text-xs text-gray-500 sm:text-sm">
      <Clock3 size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
      <span>Not sent yet</span>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCompactMoney(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toString();
}
