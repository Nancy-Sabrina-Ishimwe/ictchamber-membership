export interface Renewal {
  id: string;
  companyName: string;
  tier: string;
  category: string;
  expiryDate: string;
  daysLeft: number;
  lastNotification?: string;
  channel?: string; // Email | SMS
  status: "urgent" | "sent" | "pending";
}