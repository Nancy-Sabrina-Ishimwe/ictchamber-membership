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
  contacts: ContactPerson[];
  requests: typeof mockRequests;
  activity: typeof mockActivity;
  payments: typeof mockPayments;
  benefitUsage: typeof mockBenefitUsage;
  showNewRequestModal: boolean;
  notifications: number;

  // Actions
  updateMember: (data: Partial<Member>) => void;
  updateContacts: (contacts: ContactPerson[]) => void;
  addRequest: (req: ServiceRequest) => void;
  setShowNewRequestModal: (show: boolean) => void;
  toggleAutomatedReminders: () => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  member: mockMember,
  contacts: mockContacts,
  requests: mockRequests,
  activity: mockActivity,
  payments: mockPayments,
  benefitUsage: mockBenefitUsage,
  showNewRequestModal: false,
  notifications: 2,

  updateMember: (data) =>
    set((state) => ({ member: { ...state.member, ...data } })),

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
