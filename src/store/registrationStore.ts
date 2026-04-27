import { create } from 'zustand';
import type {
  RegistrationFormData,
  RegistrationStep,
  CompanyInfoData,
  KeyContactsData,
  TrustSealData,
  TierPaymentData,
} from '../types/registration';

interface RegistrationState {
  step: RegistrationStep;
  showTrustSealModal: boolean;
  showSuccessModal: boolean;
  formData: RegistrationFormData;

  // Actions
  setStep: (step: RegistrationStep) => void;
  setShowTrustSealModal: (show: boolean) => void;
  setShowSuccessModal: (show: boolean) => void;
  updateCompanyInfo: (data: Partial<CompanyInfoData>) => void;
  updateKeyContacts: (data: Partial<KeyContactsData>) => void;
  updateTrustSeal: (data: Partial<TrustSealData>) => void;
  updateTierPayment: (data: Partial<TierPaymentData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialFormData: RegistrationFormData = {
  companyInfo: {
    officialName: '',
    address: '',
    cluster: '',
    clusterId: null,
    subclusterId: null,
    tinNumber: '',
    email: '',
    logoFile: null,
  },
  keyContacts: {
    founders: [{ id: crypto.randomUUID(), fullName: '', email: '', phone: '' }],
    alternateRep: { fullName: '', email: '', phone: '', role: '' },
  },
  trustSeal: {
    hasTrustSeal: null,
  },
  tierPayment: {
    tier: null,
    period: 1,
    paymentMethod: 'card',
    cardDetails: { nameOnCard: '', cardNumber: '', expiry: '', cvc: '' },
    mobileMoneyDetails: { phone: '', provider: 'MTN' },
  },
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  step: 1,
  showTrustSealModal: false,
  showSuccessModal: false,
  formData: initialFormData,

  setStep: (step) => set({ step }),
  setShowTrustSealModal: (show) => set({ showTrustSealModal: show }),
  setShowSuccessModal: (show) => set({ showSuccessModal: show }),

  updateCompanyInfo: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        companyInfo: { ...state.formData.companyInfo, ...data },
      },
    })),

  updateKeyContacts: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        keyContacts: { ...state.formData.keyContacts, ...data },
      },
    })),

  updateTrustSeal: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        trustSeal: { ...state.formData.trustSeal, ...data },
      },
    })),

  updateTierPayment: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        tierPayment: { ...state.formData.tierPayment, ...data },
      },
    })),

  nextStep: () =>
    set((state) => ({
      step: Math.min(state.step + 1, 2) as RegistrationStep,
    })),

  prevStep: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 1) as RegistrationStep,
    })),

  reset: () =>
    set({
      step: 1,
      showTrustSealModal: false,
      showSuccessModal: false,
      formData: initialFormData,
    }),
}));
