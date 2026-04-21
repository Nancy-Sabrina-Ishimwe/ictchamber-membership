import type { DashboardStats, Activity } from "../types/dashboard";

export const getDashboardData = async (): Promise<{
  stats: DashboardStats;
  activities: Activity[];
}> => {
  // simulate API delay
  await new Promise((res) => setTimeout(res, 500));

  return {
    stats: {
      totalOrganizations: 2845,
      activeMembers: 2103,
      inactiveMembers: 42,
      renewalDue: 9,
    },
    activities: [
      {
        id: "1",
        company: "TechVision Rwanda",
        action: "Membership Renewed",
        date: "Today",
        amount: "$500",
        status: "success",
      },
      {
        id: "2",
        company: "Kigali Cloud",
        action: "New Registration",
        date: "Today",
        amount: "-",
        status: "pending",
      },
    ],
  };
};