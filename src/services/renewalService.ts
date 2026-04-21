import type { Renewal } from "../types/renewal";

export async function getRenewals(): Promise<Renewal[]> {
  try {
    const res = await fetch("/api/renewals");

    if (!res.ok) throw new Error("Failed");

    return await res.json();
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