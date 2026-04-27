export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type MembershipPeriod = 1 | 2 | 3;
export type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer';

export interface Founder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface CompanyInfoData {
  officialName: string;
  address: string;
  cluster: string;
  /** Backend cluster ID (integer) resolved from cluster name */
  clusterId: number | null;
  /** Backend subcluster ID (integer) */
  subclusterId: number | null;
  tinNumber: string;
  email: string;
  logoFile?: File | null;
}

export interface KeyContactsData {
  founders: Founder[];
  alternateRep: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface TrustSealData {
  hasTrustSeal: boolean | null;
}

export interface TierPaymentData {
  tier: MembershipTier | null;
  period: MembershipPeriod;
  paymentMethod: PaymentMethod;
  cardDetails?: {
    nameOnCard: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  };
  mobileMoneyDetails?: {
    phone: string;
    provider: string;
  };
}

export interface RegistrationFormData {
  companyInfo: CompanyInfoData;
  keyContacts: KeyContactsData;
  trustSeal: TrustSealData;
  tierPayment: TierPaymentData;
}

export type RegistrationStep = 1 | 2;

export const TIER_PRICES: Record<MembershipTier, number> = {
  bronze: 100000,
  silver: 300000,
  gold: 600000,
  platinum: 1000000,
};

export const CLUSTERS = [
  'FinTech',
  'Drones and Robotics',
  'Infrastructure and Connectivity',
  'Artificial Intelligence',
  'Hubs, Incubators and Capacity Building',
  'AgriTech',
  'E-commerce and E-services',
  'IT Hardware and Solutions',
  'Multimedia and Digital Agents',
  'EdTech',
  'HealthTech',
];
