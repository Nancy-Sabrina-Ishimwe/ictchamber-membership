import { api } from "../lib/api";

export type MessagingChannel = "email" | "sms";
export type MembershipStatusFilter = "all" | "active" | "inactive" | "pending";

export type AudienceTargetMode = "all" | "cluster" | "specific";

export type MessagingFilters = {
  targetMode: AudienceTargetMode;
  clusterId?: number;
  membershipStatus: MembershipStatusFilter;
  includeMemberIds: number[];
};

export type MessagingAttachment = {
  filename: string;
  contentBase64: string;
  contentType?: string;
  size: number;
};

export type MessagingAttachmentSummary = {
  filename: string;
  contentType?: string;
  size: number;
};

export type MessagingCampaign = {
  id: string;
  channel: MessagingChannel;
  subject: string;
  body: string;
  attachments: MessagingAttachmentSummary[];
  attachmentCount: number;
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledFor?: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
  sentAt?: string | null;
};

export type MessagingRecipient = {
  id: number;
  email: string;
  companyName: string;
  clusterName: string | null;
};

export type MemberAudienceItem = {
  id: number;
  companyName: string;
  email: string;
  active: boolean;
  selectedTierId: number | null;
  cluster?: { id: number; clusterName: string } | null;
};

export async function getMessagingCampaigns(): Promise<MessagingCampaign[]> {
  const { data } = await api.get<{ data?: MessagingCampaign[] }>("/messaging/campaigns");
  return Array.isArray(data?.data) ? data.data : [];
}

export async function getMessagingRecipientsPreview(filters: MessagingFilters) {
  const search = new URLSearchParams();
  search.set("targetMode", filters.targetMode);
  if (filters.clusterId) search.set("clusterId", String(filters.clusterId));
  if (filters.membershipStatus && filters.membershipStatus !== "all") {
    search.set("membershipStatus", filters.membershipStatus);
  }
  if (filters.includeMemberIds.length > 0) {
    search.set("includeMemberIds", filters.includeMemberIds.join(","));
  }

  const { data } = await api.get<{ data?: { count?: number; items?: MessagingRecipient[] } }>(
    `/messaging/recipients-preview?${search.toString()}`,
  );
  return {
    count: Number(data?.data?.count ?? 0),
    items: Array.isArray(data?.data?.items) ? data.data.items : [],
  };
}

export async function saveMessagingDraft(payload: {
  campaignId?: string;
  channel: MessagingChannel;
  subject?: string;
  body: string;
  attachments: MessagingAttachment[];
  filters: MessagingFilters;
}) {
  const { data } = await api.post<{ data?: MessagingCampaign; message?: string }>("/messaging/drafts", payload);
  return {
    campaign: data?.data,
    message: data?.message ?? "Draft saved successfully.",
  };
}

export async function scheduleMessagingCampaign(payload: {
  channel: MessagingChannel;
  subject: string;
  body: string;
  attachments: MessagingAttachment[];
  scheduledFor: string;
  filters: MessagingFilters;
}) {
  const { data } = await api.post<{ data?: MessagingCampaign; message?: string }>("/messaging/schedule", payload);
  return {
    campaign: data?.data,
    message: data?.message ?? "Campaign scheduled successfully.",
  };
}

export async function sendMessagingCampaignNow(payload: {
  campaignId?: string;
  channel: MessagingChannel;
  subject: string;
  body: string;
  attachments: MessagingAttachment[];
  filters: MessagingFilters;
}) {
  const { data } = await api.post<{ data?: MessagingCampaign; message?: string }>("/messaging/send-now", payload);
  return {
    campaign: data?.data,
    message: data?.message ?? "Campaign sent successfully.",
  };
}

export async function getAudienceMembers(): Promise<MemberAudienceItem[]> {
  const { data } = await api.get<{ data?: MemberAudienceItem[] }>("/members");
  return Array.isArray(data?.data) ? data.data : [];
}
