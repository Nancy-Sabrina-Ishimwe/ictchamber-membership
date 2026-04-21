export interface DashboardStats {
  totalOrganizations: number;
  activeMembers: number;
  inactiveMembers: number;
  renewalDue: number;
}

export interface Activity {
  id: string;
  company: string;
  action: string;
  date: string;
  amount: string;
  status: "success" | "pending";
}