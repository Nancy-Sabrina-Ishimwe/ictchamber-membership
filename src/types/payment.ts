export interface Payment {
  id: string;
  companyName: string;
  tier: string;
  period: string;
  amount: number;
  datePaid: string;
  method: string;
  reference: string;
  status: "Paid" | "Pending" | "Failed";
}