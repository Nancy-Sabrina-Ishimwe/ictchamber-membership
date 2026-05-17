import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Globe2,
  Mail,
  MessageSquare,
  Paperclip,
  Send,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import {
  getAudienceMembers,
  getMessagingCampaigns,
  getMessagingRecipientsPreview,
  saveMessagingDraft,
  scheduleMessagingCampaign,
  sendMessagingCampaignNow,
  type AudienceTargetMode,
  type MessagingAttachment,
  type MemberAudienceItem,
  type MembershipStatusFilter,
  type MessagingCampaign,
  type MessagingFilters,
} from "../services/bulkMessagingService";

type Channel = "email" | "sms";
type FlashState = { type: "success" | "error"; text: string } | null;
const MAX_TOTAL_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const TARGET_OPTIONS: {
  mode: AudienceTargetMode;
  label: string;
  description: string;
  Icon: typeof Globe2;
}[] = [
  { mode: "all", label: "All members", description: "Every company in the directory", Icon: Globe2 },
  { mode: "cluster", label: "By cluster", description: "Filter by membership cluster", Icon: Users },
  { mode: "specific", label: "Specific companies", description: "Hand-pick who receives this email", Icon: Building2 },
];

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function toScheduleInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildPreviewHtml(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line || "&nbsp;")
    .join("<br />");
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function audienceSummary(filters: MessagingFilters, clusterName?: string): string {
  if (filters.targetMode === "specific") {
    return `${filters.includeMemberIds.length} selected compan${filters.includeMemberIds.length === 1 ? "y" : "ies"}`;
  }
  if (filters.targetMode === "cluster" && clusterName) {
    return clusterName;
  }
  return "All clusters";
}

async function fileToAttachment(file: File): Promise<MessagingAttachment> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
  const [, contentBase64 = ""] = dataUrl.split(",", 2);
  return {
    filename: file.name,
    contentBase64,
    contentType: file.type || undefined,
    size: file.size,
  };
}

export default function BulkMessaging() {
  const [channel, setChannel] = useState<Channel>("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [members, setMembers] = useState<MemberAudienceItem[]>([]);
  const [campaigns, setCampaigns] = useState<MessagingCampaign[]>([]);
  const [targetMode, setTargetMode] = useState<AudienceTargetMode>("all");
  const [clusterId, setClusterId] = useState<number | "">("");
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatusFilter>("all");
  const [includeMemberIds, setIncludeMemberIds] = useState<number[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [recipientCount, setRecipientCount] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showRecipientList, setShowRecipientList] = useState(false);
  const [previewRecipients, setPreviewRecipients] = useState<
    { id: number; companyName: string; email: string; clusterName: string | null }[]
  >([]);
  const [attachments, setAttachments] = useState<MessagingAttachment[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return toScheduleInputValue(nextHour);
  });
  const [activeDraftId, setActiveDraftId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"draft" | "schedule" | "send" | null>(null);
  const [flash, setFlash] = useState<FlashState>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [memberRows, campaignRows] = await Promise.all([getAudienceMembers(), getMessagingCampaigns()]);
        setMembers(memberRows);
        setCampaigns(campaignRows);
      } catch (error) {
        setFlash({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to load messaging data.",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const clusterOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const member of members) {
      if (member.cluster?.id && member.cluster.clusterName) {
        map.set(member.cluster.id, member.cluster.clusterName);
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const filters = useMemo<MessagingFilters>(
    () => ({
      targetMode,
      clusterId: targetMode === "cluster" && clusterId !== "" ? clusterId : undefined,
      membershipStatus,
      includeMemberIds: targetMode === "specific" ? includeMemberIds : [],
    }),
    [targetMode, clusterId, membershipStatus, includeMemberIds],
  );

  const selectedClusterName = useMemo(() => {
    if (clusterId === "") return undefined;
    return clusterOptions.find((cluster) => cluster.id === clusterId)?.name;
  }, [clusterId, clusterOptions]);

  const includedMembers = useMemo(
    () => members.filter((member) => includeMemberIds.includes(member.id)),
    [includeMemberIds, members],
  );

  const companySuggestions = useMemo(() => {
    const query = companySearch.trim().toLowerCase();
    if (!query || targetMode !== "specific") return [];
    return members
      .filter((member) => !includeMemberIds.includes(member.id))
      .filter((member) => {
        const haystack = `${member.companyName} ${member.email} ${member.cluster?.clusterName ?? ""}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [companySearch, includeMemberIds, members, targetMode]);

  useEffect(() => {
    if (targetMode === "cluster" && clusterId === "" && clusterOptions.length > 0) {
      setClusterId(clusterOptions[0].id);
    }
  }, [targetMode, clusterId, clusterOptions]);

  useEffect(() => {
    if (targetMode === "specific" && includeMemberIds.length === 0) {
      setRecipientCount(0);
      setPreviewRecipients([]);
      return;
    }
    if (targetMode === "cluster" && clusterId === "") {
      setRecipientCount(0);
      setPreviewRecipients([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const preview = await getMessagingRecipientsPreview(filters);
        setRecipientCount(preview.count);
        setPreviewRecipients(preview.items);
      } catch {
        setRecipientCount(0);
        setPreviewRecipients([]);
      } finally {
        setPreviewLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filters, targetMode, clusterId, includeMemberIds]);

  const charsRemaining = 160 - body.length;
  const smsMode = channel === "sms";
  const hasRecipients =
    targetMode === "specific" ? includeMemberIds.length > 0 : targetMode === "cluster" ? clusterId !== "" : true;
  const canSendEmail =
    !smsMode && subject.trim().length > 0 && body.trim().length > 0 && hasRecipients && recipientCount > 0;
  const previewTitle = subject.trim() || "Subject line will appear here";
  const totalAttachmentBytes = useMemo(
    () => attachments.reduce((sum, attachment) => sum + attachment.size, 0),
    [attachments],
  );

  const refreshCampaigns = async () => {
    const rows = await getMessagingCampaigns();
    setCampaigns(rows);
  };

  const handleTargetModeChange = (mode: AudienceTargetMode) => {
    setTargetMode(mode);
    setCompanySearch("");
    if (mode !== "specific") {
      setIncludeMemberIds([]);
    }
  };

  const handleIncludeMember = (memberId: number) => {
    setIncludeMemberIds((current) => (current.includes(memberId) ? current : [...current, memberId]));
    setCompanySearch("");
  };

  const handleRemoveIncludedMember = (memberId: number) => {
    setIncludeMemberIds((current) => current.filter((id) => id !== memberId));
  };

  const handleAttachmentSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    try {
      const nextAttachments = await Promise.all(files.map((file) => fileToAttachment(file)));
      const deduped = [...attachments];
      for (const attachment of nextAttachments) {
        const exists = deduped.some(
          (item) => item.filename === attachment.filename && item.size === attachment.size,
        );
        if (!exists) deduped.push(attachment);
      }
      const totalBytes = deduped.reduce((sum, attachment) => sum + attachment.size, 0);
      if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
        throw new Error("Total attachment size must stay under 5 MB.");
      }
      setAttachments(deduped);
      setFlash(null);
    } catch (error) {
      setFlash({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add attachments.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveAttachment = (filename: string, size: number) => {
    setAttachments((current) =>
      current.filter((attachment) => !(attachment.filename === filename && attachment.size === size)),
    );
  };

  const handleSaveDraft = async () => {
    if (!body.trim()) {
      setFlash({ type: "error", text: "Add a message body before saving a draft." });
      return;
    }

    try {
      setSubmitting("draft");
      setFlash(null);
      const result = await saveMessagingDraft({
        campaignId: activeDraftId,
        channel,
        subject,
        body,
        attachments,
        filters,
      });
      setActiveDraftId(result.campaign?.id);
      await refreshCampaigns();
      setFlash({ type: "success", text: result.message });
    } catch (error) {
      setFlash({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save draft.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleSchedule = async () => {
    if (smsMode) {
      setFlash({ type: "error", text: "SMS scheduling will be enabled after the SMS API is connected." });
      return;
    }
    if (!canSendEmail) {
      setFlash({ type: "error", text: "Add a subject, message body, and at least one recipient before scheduling." });
      return;
    }

    try {
      setSubmitting("schedule");
      setFlash(null);
      const result = await scheduleMessagingCampaign({
        channel: "email",
        subject: subject.trim(),
        body: body.trim(),
        attachments,
        scheduledFor: new Date(scheduleAt).toISOString(),
        filters,
      });
      setActiveDraftId(result.campaign?.id);
      await refreshCampaigns();
      setScheduleOpen(false);
      setFlash({ type: "success", text: result.message });
    } catch (error) {
      setFlash({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to schedule campaign.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleSendNow = async () => {
    if (smsMode) {
      setFlash({ type: "error", text: "SMS sending will be enabled after the SMS API is connected." });
      return;
    }
    if (!canSendEmail) {
      setFlash({ type: "error", text: "Add a subject, message body, and at least one recipient before sending." });
      return;
    }

    try {
      setSubmitting("send");
      setFlash(null);
      const result = await sendMessagingCampaignNow({
        campaignId: activeDraftId,
        channel: "email",
        subject: subject.trim(),
        body: body.trim(),
        attachments,
        filters,
      });
      await refreshCampaigns();
      setActiveDraftId(undefined);
      setSubject("");
      setBody("");
      setAttachments([]);
      setIncludeMemberIds([]);
      setCompanySearch("");
      setTargetMode("all");
      setClusterId("");
      setMembershipStatus("all");
      setFlash({ type: "success", text: result.message });
    } catch (error) {
      setFlash({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send campaign.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-5">
      {flash ? (
        <div className={`rounded-md border px-4 py-3 text-sm ${
            flash.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {flash.text}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Bulk Messaging</h2>
          <p className="mt-1 text-sm text-gray-500">
            Email all members, a cluster, or hand-picked companies. Scheduled sends are checked every minute on the
            server.
          </p>
        </div>

        <div className="inline-flex w-full gap-1 rounded-md border border-gray-200 bg-white p-1 sm:w-auto">
          <button
            type="button"
            onClick={() => setChannel("email")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-1.5 text-sm transition-colors sm:flex-none ${
              channel === "email" ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail size={15} />
            Email
          </button>
          <button
            type="button"
            onClick={() => setChannel("sms")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-1.5 text-sm transition-colors sm:flex-none ${
              channel === "sms" ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare size={15} />
            SMS Text
          </button>
        </div>
      </div>

      {smsMode ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          SMS composition is available so templates are not blocked, but SMS send and schedule actions stay disabled
          until the SMS API is connected.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Filter size={13} className="text-gray-500" />
                Target Audience
              </h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {loading || previewLoading
                  ? "Calculating recipients..."
                  : `${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`}
              </span>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {TARGET_OPTIONS.map(({ mode, label, description, Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleTargetModeChange(mode)}
                    className={`rounded-md border p-3 text-left transition-colors ${
                      targetMode === mode
                        ? "border-[#0F2A44] bg-[#0F2A44]/5 ring-1 ring-[#0F2A44]"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={targetMode === mode ? "text-[#0F2A44]" : "text-gray-400"}
                    />
                    <p className="mt-2 text-sm font-medium text-gray-900">{label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {targetMode === "cluster" ? (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Membership cluster</label>
                    <select
                      value={clusterId === "" ? "" : String(clusterId)}
                      onChange={(event) => setClusterId(event.target.value === "" ? "" : Number(event.target.value))}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-400"
                    >
                      <option value="">Select a cluster</option>
                      {clusterOptions.map((cluster) => (
                        <option key={cluster.id} value={cluster.id}>
                          {cluster.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className={targetMode === "cluster" ? "" : "sm:col-span-2"}>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Membership status</label>
                  <select
                    value={membershipStatus}
                    onChange={(event) => setMembershipStatus(event.target.value as MembershipStatusFilter)}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-400"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active only</option>
                    <option value="inactive">Inactive only</option>
                    <option value="pending">Pending only</option>
                  </select>
                </div>
              </div>

              {targetMode === "specific" ? (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-gray-700">Include companies</p>
                  <div className="rounded-md border border-gray-200 bg-white px-2.5 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {includedMembers.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-1.5 rounded bg-[#0F2A44]/10 px-2 py-1 text-xs text-[#0F2A44]"
                        >
                          {member.companyName}
                          <button
                            type="button"
                            onClick={() => handleRemoveIncludedMember(member.id)}
                            className="text-[#0F2A44]/60 hover:text-[#0F2A44]"
                            aria-label={`Remove ${member.companyName}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        value={companySearch}
                        onChange={(event) => setCompanySearch(event.target.value)}
                        placeholder="Search company, email, or cluster..."
                        className="min-w-[200px] flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-300"
                      />
                    </div>

                    {companySuggestions.length > 0 ? (
                      <div className="mt-2 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                        {companySuggestions.map((member) => (
                          <button
                            type="button"
                            key={member.id}
                            onClick={() => handleIncludeMember(member.id)}
                            className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 last:border-b-0 hover:bg-white"
                          >
                            <span className="font-medium">{member.companyName}</span>
                            <span className="truncate text-xs text-gray-400">
                              {member.cluster?.clusterName ?? "No cluster"} · {member.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {includeMemberIds.length === 0 ? (
                      <p className="mt-2 text-xs text-gray-500">
                        Search and add at least one company to build your recipient list.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-100 bg-gray-50 p-3 sm:grid-cols-3">
                <AudienceStat label="Recipients" value={previewLoading ? "…" : String(recipientCount)} />
                <AudienceStat
                  label="Audience"
                  value={audienceSummary(filters, selectedClusterName)}
                />
                <AudienceStat
                  label="Status filter"
                  value={membershipStatus === "all" ? "All" : membershipStatus[0].toUpperCase() + membershipStatus.slice(1)}
                />
              </div>

              {recipientCount > 0 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowRecipientList((current) => !current)}
                    className="text-sm font-medium text-[#0F2A44] hover:underline"
                  >
                    {showRecipientList ? "Hide" : "View"} recipient list ({recipientCount})
                  </button>
                  {showRecipientList ? (
                    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-md border border-gray-100 bg-white p-2 text-xs text-gray-600">
                      {previewRecipients.map((recipient) => (
                        <li key={recipient.id} className="flex justify-between gap-2 border-b border-gray-50 py-1 last:border-0">
                          <span className="font-medium text-gray-800">{recipient.companyName}</span>
                          <span className="truncate text-gray-400">{recipient.email}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Message Content</h3>
            </div>

            <div className="space-y-4 p-4">
              {channel === "email" ? (
                <div>
                  <label className="mb-1.5 block text-sm text-gray-700">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Example: Important update from Rwanda ICT Chamber"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors placeholder-gray-300 focus:border-gray-400"
                  />
                </div>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm text-gray-700">Message Body</label>
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder={channel === "email" ? "Write your email content here..." : "Write your SMS message here..."}
                    className="h-36 w-full resize-none p-3 text-sm text-gray-700 outline-none placeholder-gray-300"
                  />
                  <div className="flex flex-col gap-2 border-t border-gray-100 px-3 py-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    {channel === "email" ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={(event) => void handleAttachmentSelection(event)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-gray-500 transition-colors hover:text-gray-700"
                        >
                          <Paperclip size={13} />
                          Attach files
                        </button>
                        <span>{formatFileSize(totalAttachmentBytes)} / 5 MB</span>
                      </div>
                    ) : (
                      <span>{Math.max(0, charsRemaining)} characters remaining</span>
                    )}
                    <span>Use {"{{companyName}}"}, {"{{email}}"}, or {"{{clusterName}}"} for personalization.</span>
                  </div>
                </div>
              </div>

              {channel === "email" && attachments.length > 0 ? (
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="mb-2 text-sm font-medium text-gray-700">Attachments</p>
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={`${attachment.filename}-${attachment.size}`}
                        className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm text-gray-700"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{attachment.filename}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.filename, attachment.size)}
                          className="text-gray-400 transition-colors hover:text-gray-700"
                          aria-label={`Remove ${attachment.filename}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => void handleSaveDraft()}
                disabled={submitting !== null}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting === "draft" ? "Saving..." : "Save as Draft"}
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleOpen((current) => !current)}
                  disabled={submitting !== null || smsMode}
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clock size={14} />
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => void handleSendNow()}
                  disabled={submitting !== null || !canSendEmail}
                  className="flex items-center gap-2 rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={14} />
                  {submitting === "send" ? "Sending..." : "Send Now"}
                </button>
              </div>
            </div>

            {scheduleOpen ? (
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex-1 text-sm text-gray-700">
                    Schedule for
                    <input
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(event) => setScheduleAt(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleSchedule()}
                    disabled={submitting !== null || smsMode}
                    className="rounded-md bg-[#0F2A44] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#16395c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting === "schedule" ? "Scheduling..." : "Confirm Schedule"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  The server checks for due scheduled emails every minute and sends them automatically.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="relative flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <Eye size={14} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
              <span className="absolute bottom-0 left-0 h-0.5 w-32 bg-[#0F2A56]" />
            </div>

            <div className="p-4">
              <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
                <div className="flex items-center gap-1.5 bg-[#1f2d46] px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <div className="ml-2 rounded bg-[#2e3e5b] px-2 py-0.5 text-[10px] text-blue-200">
                    {channel}
                  </div>
                </div>

                {channel === "email" ? (
                  <>
                    <div className="space-y-0.5 border-b border-gray-100 p-3 text-xs leading-relaxed text-gray-600">
                      <p>From: ICT Chamber Communications</p>
                      <p className="text-gray-400">&lt;noreply@ictchamber.rw&gt;</p>
                      <p>To: [Member Company Name]</p>
                      <p className={`mt-1 text-sm font-semibold ${subject ? "text-gray-900" : "text-gray-400"}`}>
                        {previewTitle}
                      </p>
                    </div>

                    <div
                      className={`min-h-[150px] p-3 text-xs ${body ? "text-gray-700" : "italic text-gray-400"}`}
                      dangerouslySetInnerHTML={{
                        __html:
                          body.trim().length > 0
                            ? buildPreviewHtml(body)
                            : "Your email body content will appear here once you start typing.",
                      }}
                    />

                    <div className="border-t border-gray-100 p-3 text-center text-[10px] leading-relaxed text-gray-400">
                      You are receiving this email because you are a registered member of the Rwanda ICT Chamber.
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center p-3">
                    <div className="w-full max-w-[220px] rounded-md border border-gray-200 bg-gray-50 p-3 shadow-sm">
                      <p className="mb-2 text-[11px] text-gray-400">SMS Preview</p>
                      <div className={`rounded-md border border-gray-200 bg-white px-3 py-2 text-xs ${body ? "text-gray-700" : "text-gray-400"}`}>
                        {body || "Your SMS draft will appear here..."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Campaigns</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {campaigns.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500">No campaigns yet.</p>
              ) : (
                campaigns.slice(0, 6).map((campaign) => (
                  <div key={campaign.id} className="space-y-2 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {campaign.subject || `${campaign.channel.toUpperCase()} draft`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {campaign.recipientCount} recipients
                          {campaign.scheduledFor ? ` • Scheduled ${formatDateTime(campaign.scheduledFor)}` : ""}
                        </p>
                        {campaign.attachmentCount > 0 ? (
                          <p className="text-xs text-gray-500">
                            {campaign.attachmentCount} attachment{campaign.attachmentCount === 1 ? "" : "s"}
                          </p>
                        ) : null}
                      </div>
                      <CampaignBadge status={campaign.status} />
                    </div>
                    {campaign.lastError ? (
                      <p className="text-xs text-red-600">{campaign.lastError}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Delivery Notes</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Email send and scheduling are live.</li>
              <li>Scheduled campaigns are stored in the database and processed every minute.</li>
              <li>SMS delivery is disabled until the SMS API is connected.</li>
              <li>Attachments are supported for email with a 5 MB total limit.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AudienceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function CampaignBadge({ status }: { status: MessagingCampaign["status"] }) {
  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
        <CheckCircle2 size={12} />
        Sent
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
        <Clock size={12} />
        Scheduled
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
        <AlertCircle size={12} />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
      Draft
    </span>
  );
}
