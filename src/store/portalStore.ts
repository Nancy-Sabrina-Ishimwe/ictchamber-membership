import { create } from 'zustand';
import type {
  ActivityItem,
  BenefitUsage,
  ContactPerson,
  Member,
  MembershipTier,
  PaymentRecord,
  ServiceRequest,
} from '../types/portal';

const SESSION_KEY = 'ict_auth_user';

type StoredAuthUser = {
  id?: string;
  email?: string;
  name?: string;
  companyName?: string;
  tier?: string;
  logoUrl?: string;
};

function mapStoredTier(value?: string): MembershipTier | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'bronze' || normalized === 'silver' || normalized === 'gold' || normalized === 'platinum') {
    return normalized;
  }
  return undefined;
}

const EMPTY_MEMBER: Member = {
  id: '',
  companyName: '',
  representedBy: '',
  membershipId: '',
  tier: 'bronze',
  status: 'inactive',
  validFrom: '',
  expiryDate: '',
  daysToExpiry: 0,
  email: '',
  phone: '',
  website: '',
  address: '',
  tinNumber: '',
  description: '',
  automatedReminders: true,
};

const EMPTY_CONTACTS: ContactPerson[] = [];
const EMPTY_REQUESTS: ServiceRequest[] = [];
const EMPTY_ACTIVITY: ActivityItem[] = [];
const EMPTY_PAYMENTS: PaymentRecord[] = [];
const EMPTY_BENEFIT_USAGE: BenefitUsage[] = [];

function getInitialMember(): Member {
  if (typeof window === 'undefined') {
    return EMPTY_MEMBER;
  }

  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      return EMPTY_MEMBER;
    }

    const session = JSON.parse(rawSession) as StoredAuthUser;
    const sessionTier = mapStoredTier(session.tier);

    return {
      ...EMPTY_MEMBER,
      id: session.id ?? EMPTY_MEMBER.id,
      companyName: session.companyName ?? session.name ?? EMPTY_MEMBER.companyName,
      representedBy: session.companyName ?? session.name ?? EMPTY_MEMBER.representedBy,
      email: session.email ?? EMPTY_MEMBER.email,
      logoUrl: session.logoUrl ?? EMPTY_MEMBER.logoUrl,
      ...(sessionTier ? { tier: sessionTier } : {}),
    };
  } catch {
    return EMPTY_MEMBER;
  }
}

interface PortalState {
  member: Member;
  hydratedMemberId: string | null;
  contacts: ContactPerson[];
  requests: ServiceRequest[];
  activity: ActivityItem[];
  payments: PaymentRecord[];
  benefitUsage: BenefitUsage[];
  showNewRequestModal: boolean;
  notifications: number;

  // Actions
  updateMember: (data: Partial<Member>) => void;
  setHydratedMemberId: (memberId: string | null) => void;
  updateContacts: (contacts: ContactPerson[]) => void;
  addRequest: (req: ServiceRequest) => void;
  setShowNewRequestModal: (show: boolean) => void;
  toggleAutomatedReminders: () => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  member: getInitialMember(),
  hydratedMemberId: null,
  contacts: EMPTY_CONTACTS,
  requests: EMPTY_REQUESTS,
  activity: EMPTY_ACTIVITY,
  payments: EMPTY_PAYMENTS,
  benefitUsage: EMPTY_BENEFIT_USAGE,
  showNewRequestModal: false,
  notifications: 0,

  updateMember: (data) =>
    set((state) => ({ member: { ...state.member, ...data } })),

  setHydratedMemberId: (memberId) => set({ hydratedMemberId: memberId }),

  updateContacts: (contacts) => set({ contacts }),

  addRequest: (req) =>
    set((state) => ({ requests: [req, ...state.requests] })),

  setShowNewRequestModal: (show) => set({ showNewRequestModal: show }),

  toggleAutomatedReminders: () =>
    set((state) => ({
      member: {
        ...state.member,
        automatedReminders: !state.member.automatedReminders,
      },
    })),
}));
