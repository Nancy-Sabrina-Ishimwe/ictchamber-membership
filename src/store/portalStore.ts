import { create } from 'zustand';
import type { Member, ContactPerson, ServiceRequest } from '../types/portal';
import {
  mockMember,
  mockContacts,
  mockRequests,
  mockActivity,
  mockPayments,
  mockBenefitUsage,
} from '../mocks/portalData';

interface PortalState {
  member: Member;
  hydratedMemberId: string | null;
  contacts: ContactPerson[];
  requests: typeof mockRequests;
  activity: typeof mockActivity;
  payments: typeof mockPayments;
  benefitUsage: typeof mockBenefitUsage;
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
  member: mockMember,
  hydratedMemberId: null,
  contacts: mockContacts,
  requests: mockRequests,
  activity: mockActivity,
  payments: mockPayments,
  benefitUsage: mockBenefitUsage,
  showNewRequestModal: false,
  notifications: 2,

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
