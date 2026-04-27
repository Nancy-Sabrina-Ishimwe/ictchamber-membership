export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type RequestStatus = 'in_progress' | 'completed' | 'closed' | 'pending';
export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface Member {
  id: string;
  companyName: string;
  representedBy: string;
  membershipId: string;
  tier: MembershipTier;
  status: 'active' | 'inactive' | 'expired';
  validFrom: string;
  expiryDate: string;
  daysToExpiry: number;
  email: string;
  phone: string;
  website: string;
  address: string;
  tinNumber: string;
  description: string;
  logoUrl?: string;
  automatedReminders: boolean;
}

export interface ContactPerson {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatarInitials: string;
}

export interface ServiceRequest {
  id: string;
  requestId: string;
  title: string;
  category: string;
  submittedDate: string;
  status: RequestStatus;
  assignedOfficer: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  date: string;
  status: RequestStatus;
  type: 'request' | 'payment' | 'benefit' | 'document';
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  date: string;
  description: string;
  method: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export interface BenefitUsage {
  label: string;
  used: number;
  total: number;
}

export const SERVICE_CATEGORIES = [
  'B2B Linkages',
  'Advocacy',
  'Event Participation',
  'Training',
  'Research Support',
  'Capacity Building',
  'Legal & Compliance',
  'Market Access',
  'Media & PR',
] as const;

export const TIER_LABELS: Record<MembershipTier, string> = {
  bronze: 'Bronze Member',
  silver: 'Silver Member',
  gold: 'Gold Member',
  platinum: 'Platinum Member',
};

export const TIER_PRICES: Record<MembershipTier, number> = {
  bronze: 100000,
  silver: 300000,
  gold: 600000,
  platinum: 1000000,
};
