import { api } from "../lib/api";
import type { Renewal } from "../types/renewal";

export type ReminderTrigger = {
  id: "three-months" | "two-months" | "one-month" | "on-expiry";
  label: string;
  sub: string;
  enabled: boolean;
  daysBefore: number;
  channel: "email" | "email+sms";
};

export type RenewalDashboardData = {
  items: Renewal[];
  triggers: ReminderTrigger[];
  template: { body: string };
  summary: {
    expiringSoon: number;
    projectedRevenue: number;
    activeTriggerCount: number;
    totalTriggers: number;
  };
};

export async function getRenewalsDashboard(): Promise<RenewalDashboardData> {
  const { data } = await api.get<{ data?: RenewalDashboardData }>("/renewals/dashboard");
  return (
    data?.data ?? {
      items: [],
      triggers: [],
      template: { body: "" },
      summary: {
        expiringSoon: 0,
        projectedRevenue: 0,
        activeTriggerCount: 0,
        totalTriggers: 0,
      },
    }
  );
}

export async function getRenewals(): Promise<Renewal[]> {
  const dashboard = await getRenewalsDashboard();
  return dashboard.items;
}

export async function updateRenewalSettings(payload: {
  triggers: ReminderTrigger[];
  templateBody: string;
}) {
  const { data } = await api.put<{ message?: string }>("/renewals/settings", payload);
  return data?.message ?? "Renewal settings saved successfully.";
}

export async function previewRenewalTemplate(memberId?: number) {
  const search = new URLSearchParams();
  if (memberId) search.set("memberId", String(memberId));
  const { data } = await api.get<{ data?: { subject: string; body: string } }>(
    `/renewals/preview?${search.toString()}`,
  );
  return (
    data?.data ?? {
      subject: "Membership Renewal Reminder",
      body: "",
    }
  );
}
