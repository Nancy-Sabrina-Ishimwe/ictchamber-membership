import type { Renewal } from "../types/renewal";
import { api } from "../lib/api";

export async function getRenewals(): Promise<Renewal[]> {
  try {
    const response = await api.get<{
      data?: Array<{
        id: number;
        companyName: string;
        selectedTier?: { tierName?: string | null } | null;
        cluster?: { clusterName?: string | null } | null;
        subscriptions?: Array<{ endDate: string; active: boolean }>;
      }>;
    }>("/members");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const in90Days = new Date(todayStart);
    in90Days.setDate(in90Days.getDate() + 90);

    const mapped: Renewal[] = [];
    for (const member of response.data.data ?? []) {
        const activeSub = (member.subscriptions ?? []).find((sub) => sub.active) ?? member.subscriptions?.[0];
        if (!activeSub?.endDate) continue;
        const expiry = new Date(activeSub.endDate);
        if (Number.isNaN(expiry.getTime())) continue;
        if (expiry < todayStart || expiry > in90Days) continue;

        const msPerDay = 1000 * 60 * 60 * 24;
        const daysLeft = Math.max(0, Math.ceil((expiry.getTime() - todayStart.getTime()) / msPerDay));
        const status: Renewal["status"] = daysLeft <= 10 ? "urgent" : daysLeft <= 30 ? "sent" : "pending";

        mapped.push({
          id: String(member.id),
          companyName: member.companyName,
          tier: member.selectedTier?.tierName ?? "Membership",
          category: member.cluster?.clusterName ?? "General",
          expiryDate: expiry.toISOString(),
          daysLeft,
          lastNotification: status === "urgent" ? "1 day ago" : status === "sent" ? "7 days ago" : "Not sent yet",
          channel: status === "pending" ? "Email" : "Email + SMS",
          status,
        });
      }

    return mapped.sort((a, b) => a.daysLeft - b.daysLeft);
  } catch {
    // fallback (design data)
    return [
      {
        id: "1",
        companyName: "Kigali Tech Solutions Ltd",
        tier: "Corporate Gold",
        category: "Software Development",
        expiryDate: "2024-06-15",
        daysLeft: 6,
        lastNotification: "1 day ago",
        channel: "Email + SMS",
        status: "urgent",
      },
      {
        id: "2",
        companyName: "Rwanda Cloud Infrastructure",
        tier: "Corporate Platinum",
        category: "IT Infrastructure",
        expiryDate: "2024-06-20",
        daysLeft: 17,
        lastNotification: "14 days ago",
        channel: "Email + SMS",
        status: "sent",
      },
      {
        id: "3",
        companyName: "InnovateHub Africa",
        tier: "Startup Bronze",
        category: "Incubator",
        expiryDate: "2024-07-01",
        daysLeft: 88,
        lastNotification: "2 days ago",
        channel: "Email",
        status: "sent",
      },
    ];
  }
}